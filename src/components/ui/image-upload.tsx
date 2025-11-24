import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Upload, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ImageCropModal } from './image-crop-modal';
import { processMultipleImages, ImageMetadata } from '@/utils/imageCropUtils';

interface ImageUploadProps {
  value: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeKB?: number;
  accept?: string;
  className?: string;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value = [],
  onChange,
  maxFiles = 3,
  maxSizeKB = 5000,
  accept = "image/*",
  className,
  disabled = false
}) => {
  const [imagesMetadata, setImagesMetadata] = useState<ImageMetadata[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [currentCropIndex, setCurrentCropIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCropApply = async (croppedBlob: Blob) => {
    if (currentCropIndex === null) return;
    
    const metadata = imagesMetadata[currentCropIndex];
    const croppedFile = new File([croppedBlob], metadata.file.name, {
      type: 'image/jpeg',
      lastModified: Date.now()
    });
    
    // Atualizar metadata
    const reader = new FileReader();
    reader.onload = (e) => {
      const updatedMetadata = [...imagesMetadata];
      updatedMetadata[currentCropIndex] = {
        ...metadata,
        croppedSrc: e.target?.result as string,
        croppedBlob,
        edited: true
      };
      setImagesMetadata(updatedMetadata);
      
      // Atualizar array de files
      const newFiles = [...value];
      newFiles[currentCropIndex] = croppedFile;
      onChange(newFiles);
      
      // Verificar se há próxima imagem que precisa crop
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
          description: "Todas as fotos foram ajustadas!"
        });
      }
    };
    reader.readAsDataURL(croppedBlob);
  };

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remainingSlots = maxFiles - value.length;
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
      setImagesMetadata(prev => [...prev, ...metadata]);
      
      // Atualizar array de files original
      onChange([...value, ...validFiles]);
      
      // Verificar se há imagens que precisam de crop
      const firstNeedsCrop = metadata.findIndex(img => img.needsCrop);
      if (firstNeedsCrop !== -1) {
        const totalNeedsCrop = metadata.filter(img => img.needsCrop).length;
        toast({
          title: "Ajuste necessário",
          description: `${totalNeedsCrop} foto(s) precisa(m) ser ajustada(s) para formato quadrado.`
        });
        
        // Abrir crop automaticamente
        setTimeout(() => {
          setCurrentCropIndex(value.length + firstNeedsCrop);
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

  const removeImage = (indexToRemove: number) => {
    const newFiles = value.filter((_, index) => index !== indexToRemove);
    onChange(newFiles);
    
    const newMetadata = imagesMetadata.filter((_, index) => index !== indexToRemove);
    setImagesMetadata(newMetadata);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Sincronizar metadata com value
  useEffect(() => {
    if (value.length === 0) {
      setImagesMetadata([]);
    }
  }, [value.length]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Preview das imagens */}
      {imagesMetadata.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {imagesMetadata.map((metadata, index) => {
            const needsCropWarning = metadata.needsCrop && !metadata.edited;
            
            return (
              <div key={index} className="relative group">
                <img
                  src={metadata.croppedSrc || metadata.originalSrc}
                  alt={`Preview ${index + 1}`}
                  className={cn(
                    "w-full aspect-square object-cover rounded-lg border-2 cursor-pointer",
                    needsCropWarning ? "border-yellow-400" : "border-gray-200"
                  )}
                  onClick={() => {
                    setCurrentCropIndex(index);
                    setCropModalOpen(true);
                  }}
                />
                
                {/* Badge de status */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    ⭐ Principal
                  </div>
                )}
                
                {needsCropWarning ? (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                    ⚠️ Ajustar
                  </div>
                ) : metadata.edited && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    ✓ OK
                  </div>
                )}
                
                {/* Botão remover */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  disabled={disabled}
                  className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <X className="w-3 h-3" />
                </button>
                
                {/* Botão de editar */}
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
      )}

      {/* Dica de formato quadrado */}
      {value.length === 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <Camera className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                📸 Sistema de Crop Inteligente
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Fotos que não forem quadradas serão automaticamente detectadas e você poderá ajustá-las manualmente para o formato 1:1 (Instagram).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Crop */}
      {currentCropIndex !== null && imagesMetadata[currentCropIndex] && (
        <ImageCropModal
          isOpen={cropModalOpen}
          imageSrc={imagesMetadata[currentCropIndex].originalSrc}
          imageIndex={currentCropIndex}
          totalImages={imagesMetadata.length}
          onClose={() => {
            setCropModalOpen(false);
            setCurrentCropIndex(null);
          }}
          onApply={handleCropApply}
        />
      )}

      {/* Upload area */}
      {value.length < maxFiles && (
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
                {value.length}/{maxFiles} fotos • Max {maxSizeKB}KB cada
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

export default ImageUpload;
