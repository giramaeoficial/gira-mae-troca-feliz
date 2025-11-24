import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Upload, Image, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import LazyImage from '@/components/ui/lazy-image';
import { ImageCropModal } from './image-crop-modal';
import { processMultipleImages, ImageMetadata } from '@/utils/imageCropUtils';

interface ImageUploadEditorProps {
  imagensExistentes: string[];
  novasImagens: File[];
  onRemoverExistente: (url: string) => void;
  onAdicionarNovas: (files: File[]) => void;
  maxFiles?: number;
  maxSizeKB?: number;
  accept?: string;
  className?: string;
  disabled?: boolean;
  onPendingCropsChange?: (count: number) => void;
}

const ImageUploadEditor: React.FC<ImageUploadEditorProps> = ({
  imagensExistentes = [],
  novasImagens = [],
  onRemoverExistente,
  onAdicionarNovas,
  maxFiles = 6,
  maxSizeKB = 5000,
  accept = "image/*",
  className,
  disabled = false,
  onPendingCropsChange
}) => {
  const [novasMetadata, setNovasMetadata] = useState<ImageMetadata[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [currentCropIndex, setCurrentCropIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalImagens = imagensExistentes.length + novasImagens.length;
  const pendingCropsCount = novasMetadata.filter(img => img.needsCrop && !img.edited).length;

  const handleCropApply = async (croppedBlob: Blob) => {
    if (currentCropIndex === null) return;
    
    const metadata = novasMetadata[currentCropIndex];
    const croppedFile = new File([croppedBlob], metadata.file.name, {
      type: 'image/jpeg',
      lastModified: Date.now()
    });
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const updatedMetadata = [...novasMetadata];
      updatedMetadata[currentCropIndex] = {
        ...metadata,
        croppedSrc: e.target?.result as string,
        croppedBlob,
        edited: true
      };
      setNovasMetadata(updatedMetadata);
      
      const newFiles = [...novasImagens];
      newFiles[currentCropIndex] = croppedFile;
      onAdicionarNovas(newFiles);
      
      const nextNeedsCrop = updatedMetadata.findIndex(
        (img, idx) => idx > currentCropIndex && img.needsCrop && !img.edited
      );
      
      if (nextNeedsCrop !== -1) {
        setCurrentCropIndex(nextNeedsCrop);
        toast({
          title: "Próxima foto",
          description: "Ajustando foto seguinte..."
        });
      } else {
        setCropModalOpen(false);
        setCurrentCropIndex(null);
        toast({
          title: "Concluído",
          description: "Todas as novas fotos foram ajustadas!"
        });
      }
    };
    reader.readAsDataURL(croppedBlob);
  };

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remainingSlots = maxFiles - totalImagens;
    const filesToProcess = fileArray.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      toast({
        title: "Limite de fotos",
        description: `Máximo de ${maxFiles} fotos. Adicionando apenas ${remainingSlots}.`
      });
    }

    const validFiles: File[] = [];
    
    for (const file of filesToProcess) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Tipo de arquivo inválido",
          description: `${file.name} não é uma imagem válida`,
          variant: "destructive"
        });
        continue;
      }

      if (file.size > maxSizeKB * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: `${file.name} excede o limite de ${maxSizeKB}KB`,
          variant: "destructive"
        });
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);
    try {
      console.log('🔄 Processando', validFiles.length, 'imagens...');
      
      const metadata = await processMultipleImages(validFiles);
      setNovasMetadata(prev => [...prev, ...metadata]);
      
      onAdicionarNovas([...novasImagens, ...validFiles]);
      
      const firstNeedsCrop = metadata.findIndex(img => img.needsCrop);
      if (firstNeedsCrop !== -1) {
        const totalNeedsCrop = metadata.filter(img => img.needsCrop).length;
        toast({
          title: "Ajuste necessário",
          description: `${totalNeedsCrop} foto(s) precisa(m) ser ajustada(s).`
        });
        
        setTimeout(() => {
          setCurrentCropIndex(novasImagens.length + firstNeedsCrop);
          setCropModalOpen(true);
        }, 500);
      } else {
        toast({
          title: "Imagens adicionadas",
          description: `${validFiles.length} foto(s) já está(ão) no formato correto!`
        });
      }
    } catch (error) {
      console.error('Erro no processamento das imagens:', error);
      toast({
        title: "Erro no processamento",
        description: "Falha ao processar as imagens",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    await processFiles(files);
    event.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (disabled || isUploading) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  const removerNovaImagem = (indexToRemove: number) => {
    const newFiles = novasImagens.filter((_, index) => index !== indexToRemove);
    onAdicionarNovas(newFiles);
    
    const newMetadata = novasMetadata.filter((_, index) => index !== indexToRemove);
    setNovasMetadata(newMetadata);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    if (novasImagens.length === 0) {
      setNovasMetadata([]);
    }
  }, [novasImagens.length]);

  useEffect(() => {
    if (onPendingCropsChange) {
      onPendingCropsChange(pendingCropsCount);
    }
  }, [pendingCropsCount, onPendingCropsChange]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Dica de formato quadrado */}
      {totalImagens === 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <Camera className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                📸 Sistema de Crop Inteligente
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Fotos não-quadradas serão detectadas e você poderá ajustá-las manualmente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Imagens Existentes */}
      {imagensExistentes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Imagens Atuais</h4>
          <div className="grid grid-cols-3 gap-4">
            {imagensExistentes.map((url, index) => (
              <div key={`existing-${index}`} className="relative group">
                <LazyImage
                  src={url}
                  alt={`Imagem existente ${index + 1}`}
                  bucket="itens"
                  size="medium"
                  className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => onRemoverExistente(url)}
                  disabled={disabled}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                {index === 0 && (
                  <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                    Principal
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Novas Imagens */}
      {novasMetadata.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Novas Imagens</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {novasMetadata.map((metadata, index) => {
              const needsCropWarning = metadata.needsCrop && !metadata.edited;
              
              return (
                <div key={`new-${index}`} className="relative group">
                  <img 
                    src={metadata.croppedSrc || metadata.originalSrc} 
                    alt={`Nova imagem ${index + 1}`}
                    className={cn(
                      "w-full aspect-square object-cover rounded-lg border-2 cursor-pointer",
                      needsCropWarning ? "border-yellow-400" : "border-green-200"
                    )}
                    onClick={() => {
                      setCurrentCropIndex(index);
                      setCropModalOpen(true);
                    }}
                  />
                  
                  {needsCropWarning ? (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                      ⚠️ Ajustar
                    </div>
                  ) : metadata.edited ? (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      ✓ OK
                    </div>
                  ) : (
                    <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                      Nova
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removerNovaImagem(index);
                    }}
                    disabled={disabled}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 z-10"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  
                  <Button
                    type="button"
                    size="sm"
                    variant={needsCropWarning ? "default" : "secondary"}
                    className={cn(
                      "w-full mt-2",
                      needsCropWarning && "bg-yellow-500 hover:bg-yellow-600 animate-pulse"
                    )}
                    onClick={() => {
                      setCurrentCropIndex(index);
                      setCropModalOpen(true);
                    }}
                    disabled={disabled}
                  >
                    {needsCropWarning ? '⚠️ Ajustar' : '✏️ Editar'}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Crop */}
      {currentCropIndex !== null && novasMetadata[currentCropIndex] && (
        <ImageCropModal
          isOpen={cropModalOpen}
          imageSrc={novasMetadata[currentCropIndex].originalSrc}
          imageIndex={currentCropIndex}
          totalImages={novasMetadata.length}
          onClose={() => {
            setCropModalOpen(false);
            setCurrentCropIndex(null);
          }}
          onApply={handleCropApply}
        />
      )}

      {/* Upload area */}
      {totalImagens < maxFiles && (
        <div 
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer",
            isDragOver 
              ? "border-primary bg-primary/5 scale-105" 
              : "border-gray-300 hover:border-gray-400",
            (disabled || isUploading) && "cursor-not-allowed opacity-50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            className="hidden"
          />
          
          <div className="flex flex-col items-center gap-3">
            {isUploading ? (
              <Upload className="w-10 h-10 text-primary animate-bounce" />
            ) : isDragOver ? (
              <Image className="w-10 h-10 text-primary" />
            ) : (
              <Camera className="w-10 h-10 text-gray-400" />
            )}
            
            <div className="space-y-1">
              <p className={cn(
                "font-medium",
                isDragOver ? "text-primary" : "text-gray-700"
              )}>
                {isUploading ? 'Processando imagens...' : 
                 isDragOver ? 'Solte as imagens aqui' : 
                 'Clique ou arraste fotos aqui'}
              </p>
              <p className="text-sm text-gray-500">
                {totalImagens}/{maxFiles} fotos • Max {maxSizeKB}KB cada
              </p>
              <p className="text-xs text-gray-400">
                JPG, PNG, WebP até {maxSizeKB}KB
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadEditor;
