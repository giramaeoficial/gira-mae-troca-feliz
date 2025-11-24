import React, { useEffect, useRef, useState } from 'react';
import { X, RotateCcw, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useImageCrop } from '@/hooks/useImageCrop';
import 'cropperjs/dist/cropper.css';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomValue, setZoomValue] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const {
    initCropper,
    applyCrop,
    destroyCropper,
    zoom,
    rotate,
    reset
  } = useImageCrop();

  // Carregar imagem e inicializar cropper
  useEffect(() => {
    if (isOpen && imageSrc && imageLoaded && imageRef.current) {
      console.log('🔄 Inicializando cropper...');
      
      // Pequeno delay para garantir que o DOM está pronto
      const timer = setTimeout(() => {
        if (imageRef.current) {
          initCropper(imageRef.current, (ratio) => {
            setZoomValue(ratio);
          });
        }
      }, 100);
      
      return () => {
        clearTimeout(timer);
        destroyCropper();
      };
    }
  }, [isOpen, imageSrc, imageLoaded, initCropper, destroyCropper]);

  // Reset quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      setImageLoaded(false);
      setZoomValue(0);
    }
  }, [isOpen]);

  const handleApply = async () => {
    try {
      const blob = await applyCrop(`crop_${Date.now()}.jpg`);
      onApply(blob);
      setImageLoaded(false); // Reset para próxima imagem
    } catch (error) {
      console.error('Erro ao aplicar crop:', error);
    }
  };

  const handleZoomChange = (value: number[]) => {
    zoom(value[0]);
    setZoomValue(value[0]);
  };

  const handleImageLoad = () => {
    console.log('✅ Imagem carregada');
    setImageLoaded(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 px-4 py-3 flex items-center justify-between flex-shrink-0 shadow-lg">
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
          disabled={!imageLoaded}
        >
          Aplicar
        </Button>
      </div>

      {/* Área de Crop */}
      <div 
        ref={containerRef}
        className="flex-1 bg-gray-950 overflow-hidden"
        style={{ 
          minHeight: '300px',
          maxHeight: 'calc(100vh - 250px)'
        }}
      >
        {/* Container interno com padding */}
        <div className="w-full h-full p-4 flex items-center justify-center">
          <div style={{ maxWidth: '100%', maxHeight: '100%' }}>
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Imagem para crop"
              onLoad={handleImageLoad}
              style={{ 
                display: 'block',
                maxWidth: '90vw',
                maxHeight: '70vh',
                width: 'auto',
                height: 'auto'
              }}
            />
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-gray-900 px-4 py-4 space-y-3 flex-shrink-0 shadow-lg">
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
            disabled={!imageLoaded}
          />
          <ZoomIn className="w-5 h-5 text-gray-400 flex-shrink-0" />
        </div>

        {/* Info do formato */}
        <div className="bg-purple-900 rounded-lg p-3 text-center">
          <p className="text-white text-sm font-medium">📐 Formato quadrado 1:1</p>
          <p className="text-purple-300 text-xs mt-1">
            Arraste para mover • Pinça para zoom • 1024×1024px
          </p>
        </div>

        {/* Ações */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => rotate(-90)}
            disabled={!imageLoaded}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Girar
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={reset}
            disabled={!imageLoaded}
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Resetar
          </Button>
        </div>
      </div>
    </div>
  );
};
