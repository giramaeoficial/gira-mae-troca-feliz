import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Upload, Image, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ImageCropModal } from './image-crop-modal';
import { processMultipleImages, ImageMetadata } from '@/utils/imageCropUtils';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

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
  maxFiles = 6,
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
  const [showNeedsCropAlert, setShowNeedsCropAlert] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pendingCropsCount = imagesMetadata.filter(img => img.needsCrop && !img.edited).length;

  const handleCropApply = async (croppedBlob: Blob) => {
    if (currentCropIndex === null) return;
    
    const metadata = imagesMetadata[currentCropIndex];
    const croppedFile = new File([croppedBlob], metadata.file.name, {
      type: 'image/jpeg',
      lastModified: Date.now()
    });
    
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
      
      const newFiles = [...value];
      newFiles[currentCropIndex] = croppedFile;
      onChange(newFiles);
      
      // Verificar próxima imagem que precisa crop
      const nextNeedsCrop = updatedMetadata.findIndex(
        (img, idx) => idx > currentCropIndex && img.needsCrop && !img.edited
      );
      
      if (nextNeedsCrop !== -1) {
        // Abrir próxima automaticamente
        setTimeout(() => {
          setCurrentCropIndex(nextNeedsCrop);
          toast({
            title: "Próxima foto",
            description: `Ajustando foto ${nextNeedsCrop + 1} de ${updatedMetadata.length}...`
          });
        }, 200);
      } else {
        // Todas as fotos foram ajustadas
        setCropModalOpen(false);
        setCurrentCropIndex(null);
        setShowNeedsCropAlert(false);
        toast({
          title: "✅ Concluído!",
          description: "Todas as fotos foram ajustadas para o formato quadrado."
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
        description: `Máximo de ${maxFiles} fotos permitido.`,
        variant: "destructive"
      });
    }

    setIsUploading(true);

    try {
      const metadata = await processMultipleImages(filesToProcess, maxSizeKB);
      
      const validFiles = filesToProcess.filter((_, index) => 
        metadata[index] && metadata[index].originalSrc
      );

      setImagesMetadata([...imagesMetadata, ...metadata]);
      onChange([...value, ...validFiles]);

      // Contar quantas precisam crop
      const needsCropCount = metadata.filter(m => m.needsCrop).length;
      const firstNeedsCrop = metadata.findIndex(m => m.needsCrop);

      if (needsCropCount > 0) {
        setShowNeedsCropAlert(true);
        
        // Mostrar alerta inicial
        toast({
          title: "⚠️ Atenção",
          description: `${needsCropCount} foto(s) não estão no formato quadrado e precisam ser ajustadas.`,
          variant: "destructive",
          duration: 5000
        });
        
        // Abrir crop automaticamente da primeira imagem não-quadrada
        setTimeout(() => {
          setCurrentCropIndex(value.length + firstNeedsCrop);
          setCropModalOpen(true);
        }, 500);
      } else {
        toast({
          title: "✅ Imagens adicionadas",
          description: `${validFiles.length} foto(s) já estão no formato correto!`
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
    
    // Atualizar alerta se necessário
    const stillNeedsCrop = newMetadata.some(img => img.needsCrop && !img.edited);
    setShowNeedsCropAlert(stillNeedsCrop);
  };

  const openFileDialog = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const openCropForImage = (index: number) => {
    setCurrentCropIndex(index);
    setCropModalOpen(true);
  };

  useEffect(() => {
    if (value.length === 0) {
      setImagesMetadata([]);
      setShowNeedsCropAlert(false);
    }
  }, [value.length]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Alerta de fotos pendentes */}
      {showNeedsCropAlert && pendingCropsCount > 0 && (
        <Alert variant="destructive" className="animate-pulse">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Atenção!</AlertTitle>
          <AlertDescription>
            {pendingCropsCount} foto(s) precisa(m) ser ajustada(s) para o formato quadrado antes de publicar.
          </AlertDescription>
        </Alert>
      )}

      {/* Preview das imagens */}
      {imagesMetadata.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">
              {imagesMetadata.length} foto(s) selecionada(s)
            </h3>
            {pendingCropsCount === 0 && (
              <div className="flex items-center text-green-600 text-sm">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Todas ajustadas
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {imagesMetadata.map((metadata, index) => {
              const needsCropWarning = metadata.needsCrop && !metadata.edited;
              
              return (
                <div key={index} className="relative group">
                  {/* Preview da imagem */}
                  <div className="relative rounded-lg overflow-hidden border-2 transition-all">
                    <img
                      src={metadata.croppedSrc || metadata.originalSrc}
                      alt={`Preview ${index + 1}`}
                      className="w-full aspect-square object-cover"
                    />
                    
                    {/* Badge Principal */}
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                        ⭐ Principal
                      </div>
                    )}
                    
                    {/* Badge Status */}
                    {needsCropWarning ? (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg animate-pulse">
                        ⚠️ Ajustar
                      </div>
                    ) : metadata.edited ? (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                        ✓ OK
                      </div>
                    ) : null}
                    
                    {/* Botão Remover */}
                    <button
                      onClick={() => removeImage(index)}
                      className={cn(
                        "absolute bg-red-500 text-white w-8 h-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity active:scale-90",
                        index === 0 ? "top-10 right-2" : "top-2 right-2",
                        needsCropWarning && "top-10"
                      )}
                      disabled={disabled}
                    >
                      ×
                    </button>
                    
                    {/* Info dimensões originais */}
                    {needsCropWarning && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-yellow-900 to-transparent p-2">
                        <p className="text-white text-xs text-center font-medium">
                          {metadata.dimensions.width}×{metadata.dimensions.height}px - Precisa ajustar
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Botão de ação */}
                  <Button
                    variant={needsCropWarning ? "default" : "secondary"}
                    className={cn(
                      "w-full mt-2",
                      needsCropWarning && "bg-yellow-500 hover:bg-yellow-600 animate-pulse"
                    )}
                    onClick={() => openCropForImage(index)}
                    disabled={disabled}
                  >
                    {needsCropWarning ? '⚠️ Ajustar Enquadramento' : 
                     metadata.edited ? '✏️ Editar Novamente' : 
                     '✂️ Cortar Imagem'}
                  </Button>
                </div>
              );
            })}
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
