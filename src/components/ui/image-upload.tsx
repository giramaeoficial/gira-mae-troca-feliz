
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { compressImage } from '@/utils/imageCompression';
import { toast } from '@/hooks/use-toast';

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
  maxSizeKB = 5000, // 5MB
  accept = "image/*",
  className,
  disabled = false
}) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const generatePreviews = useCallback((files: File[]) => {
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => {
      // Limpar URLs anteriores
      prev.forEach(url => URL.revokeObjectURL(url));
      return newPreviews;
    });
  }, []);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);

    try {
      const selectedFiles = Array.from(files);
      const remainingSlots = maxFiles - value.length;
      const filesToProcess = selectedFiles.slice(0, remainingSlots);

      // Validar tamanho dos arquivos
      const oversizedFiles = filesToProcess.filter(
        file => file.size > maxSizeKB * 1024
      );

      if (oversizedFiles.length > 0) {
        toast({
          title: "Arquivos muito grandes",
          description: `${oversizedFiles.length} arquivo(s) excedem o limite de ${maxSizeKB}KB`,
          variant: "destructive"
        });
      }

      // Processar apenas arquivos do tamanho correto
      const validFiles = filesToProcess.filter(
        file => file.size <= maxSizeKB * 1024
      );

      if (validFiles.length === 0) {
        setIsUploading(false);
        return;
      }

      // Comprimir imagens
      const compressedFiles = await Promise.all(
        validFiles.map(file => compressImage(file, {
          maxWidth: 1024,
          maxHeight: 1024,
          quality: 0.8,
          format: 'jpeg'
        }))
      );

      const newFiles = [...value, ...compressedFiles];
      onChange(newFiles);
      generatePreviews(newFiles);

      toast({
        title: "Imagens processadas",
        description: `${compressedFiles.length} imagem(ns) comprimida(s) e otimizada(s)`,
      });

    } catch (error) {
      console.error('Erro ao processar imagens:', error);
      toast({
        title: "Erro no processamento",
        description: "Falha ao processar as imagens selecionadas",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    const newFiles = value.filter((_, index) => index !== indexToRemove);
    onChange(newFiles);
    
    // Atualizar previews
    const newPreviews = previews.filter((_, index) => index !== indexToRemove);
    // Revogar URL removida
    URL.revokeObjectURL(previews[indexToRemove]);
    setPreviews(newPreviews);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Preview das imagens */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img 
                src={preview} 
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                disabled={disabled}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {value.length < maxFiles && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <input
            type="file"
            accept={accept}
            multiple
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            className="hidden"
            id="image-upload"
          />
          <label 
            htmlFor="image-upload" 
            className={cn(
              'cursor-pointer flex flex-col items-center gap-2',
              (disabled || isUploading) && 'cursor-not-allowed opacity-50'
            )}
          >
            {isUploading ? (
              <Upload className="w-8 h-8 text-gray-400 animate-pulse" />
            ) : (
              <Camera className="w-8 h-8 text-gray-400" />
            )}
            <span className="text-sm text-gray-600">
              {isUploading ? 'Processando imagens...' : 'Clique para adicionar fotos'}
            </span>
            <span className="text-xs text-gray-500">
              {value.length}/{maxFiles} fotos • Max {maxSizeKB}KB cada
            </span>
          </label>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
