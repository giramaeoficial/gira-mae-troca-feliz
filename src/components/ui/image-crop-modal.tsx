import React, { useEffect, useRef, useState } from 'react';
import { X, RotateCcw, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useImageCrop } from '@/hooks/useImageCrop';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  imageIndex: number;
  totalImages: number;
  onClose: () => void;
  onApply: (croppedBlob: Blob) => void;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageSrc,
  imageIndex,
  totalImages,
  onClose,
  onApply
}) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const [zoomValue, setZoomValue] = useState(0);
  
  const {
    initCropper,
    applyCrop,
    destroyCropper,
    zoom,
    rotate,
    reset
  } = useImageCrop();

  useEffect(() => {
    if (isOpen && imageRef.current && imageSrc) {
      const cropper = initCropper(imageRef.current, (ratio) => {
        setZoomValue(ratio);
      });
      
      return () => {
        destroyCropper();
      };
    }
  }, [isOpen, imageSrc, initCropper, destroyCropper]);

  const handleApply = async () => {
    try {
      const blob = await applyCrop(`crop_${Date.now()}.jpg`);
      onApply(blob);
    } catch (error) {
      console.error('Erro ao aplicar crop:', error);
    }
  };

  const handleZoomChange = (value: number[]) => {
    zoom(value[0]);
    setZoomValue(value[0]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white hover:bg-gray-800"
        >
          <X className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <span className="text-white text-sm font-medium">
          Foto {imageIndex + 1} de {totalImages}
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleApply}
          className="text-purple-400 hover:bg-gray-800 font-bold"
        >
          Aplicar
        </Button>
      </div>

      {/* Área de Crop - ALTURA FIXA */}
      <div 
        className="flex-1 relative overflow-hidden bg-gray-950"
        style={{ 
          minHeight: '400px',
          height: 'calc(100vh - 200px)' // Header + Controles
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Imagem para crop"
            className="max-w-full max-h-full"
            style={{ 
              display: 'block',
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          />
        </div>
      </div>

      {/* Controles */}
      <div className="bg-gray-900 px-4 py-4 space-y-3 flex-shrink-0">
        {/* Zoom */}
        <div className="flex items-center gap-3">
          <ZoomOut className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <Slider
            value={[zoomValue]}
            onValueChange={handleZoomChange}
            min={0}
            max={2}
            step={0.01}
            className="flex-1"
          />
          <ZoomIn className="w-5 h-5 text-gray-400 flex-shrink-0" />
        </div>

        {/* Info do formato */}
        <div className="bg-purple-900 rounded-lg p-3 text-center">
          <p className="text-white text-sm font-medium">📐 Formato quadrado 1:1</p>
          <p className="text-purple-300 text-xs mt-1">Padrão GiraMãe • 1024×1024px</p>
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => rotate(-90)}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Girar
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={reset}
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Resetar
          </Button>
        </div>
      </div>
    </div>
  );
};
