import React, { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Button } from '@/components/ui/button';
import { X, RotateCcw, RotateCw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useImageCrop } from '@/hooks/useImageCrop';
import { toast } from '@/hooks/use-toast';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  imageIndex: number;
  totalImages: number;
  onClose: () => void;
  onApply: (blob: Blob) => void;
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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [zoomValue, setZoomValue] = useState(0);
  const [initializing, setInitializing] = useState(false);
  
  const { 
    initCropper, 
    destroyCropper, 
    applyCrop, 
    rotate, 
    reset, 
    zoom 
  } = useImageCrop();

  // Inicializar cropper apenas uma vez quando imagem carregar
  useEffect(() => {
    if (isOpen && imageRef.current && imageLoaded && !initializing) {
      setInitializing(true);
      
      const handleZoomChange = (ratio: number) => {
        setZoomValue(ratio);
      };
      
      // Aguardar próximo frame para garantir que o DOM está pronto
      requestAnimationFrame(() => {
        initCropper(imageRef.current!, handleZoomChange);
      });
    }
    
    return () => {
      if (initializing) {
        destroyCropper();
        setInitializing(false);
      }
    };
  }, [isOpen, imageLoaded]);

  // Reset quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      setImageLoaded(false);
      setZoomValue(0);
      setInitializing(false);
    }
  }, [isOpen]);

  const handleApply = async () => {
    try {
      const blob = await applyCrop('crop.jpg');
      console.log(`✅ Crop aplicado - Tamanho: ${(blob.size / 1024).toFixed(2)}KB`);
      onApply(blob);
      setImageLoaded(false);
      setInitializing(false);
    } catch (error) {
      console.error('Erro ao aplicar crop:', error);
      toast({
        title: "Erro",
        description: "Falha ao processar a imagem",
        variant: "destructive"
      });
    }
  };

  const handleZoomChange = (value: number[]) => {
    zoom(value[0]);
    setZoomValue(value[0]);
  };

  const handleImageLoad = () => {
    console.log('✅ Imagem carregada no modal');
    setImageLoaded(true);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black"
      style={{ 
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh'
      }}
    >
      {/* Header - 60px */}
      <div 
        className="bg-gray-900 px-4 py-3 flex items-center justify-between shadow-lg"
        style={{ height: '60px', flexShrink: 0 }}
      >
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
          disabled={!imageLoaded || !initializing}
        >
          Aplicar
        </Button>
      </div>

      {/* Área de Crop - Ocupa EXATAMENTE o espaço restante */}
      <div 
        ref={containerRef}
        className="bg-black"
        style={{ 
          flex: '1 1 auto',
          position: 'relative',
          overflow: 'hidden',
          minHeight: 0, // CRÍTICO: permite que flex funcione corretamente
          width: '100%'
        }}
      >
        {/* Imagem - SEM estilos que atrapalhem o Cropper */}
        <img
          ref={imageRef}
          src={imageSrc}
          alt="Imagem para crop"
          onLoad={handleImageLoad}
          style={{
            display: imageLoaded ? 'block' : 'none',
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        />
        
        {!imageLoaded && (
          <div 
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
              fontSize: '14px'
            }}
          >
            Carregando imagem...
          </div>
        )}
      </div>

      {/* Footer com controles - 140px */}
      <div 
        className="bg-gray-900 px-6 py-4"
        style={{ height: '140px', flexShrink: 0 }}
      >
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Zoom Slider */}
          <div className="flex items-center gap-4">
            <span className="text-white text-sm font-medium" style={{ width: '64px' }}>
              Zoom
            </span>
            <Slider
              value={[zoomValue]}
              onValueChange={handleZoomChange}
              min={0.5}
              max={3}
              step={0.1}
              disabled={!imageLoaded || !initializing}
              className="flex-1"
            />
          </div>
          
          {/* Botões de Rotação */}
          <div className="flex items-center gap-4">
            <span className="text-white text-sm font-medium" style={{ width: '64px' }}>
              Girar
            </span>
            <div className="flex gap-2 flex-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => rotate(-90)}
                disabled={!imageLoaded || !initializing}
                className="flex-1"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                90° Esquerda
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => rotate(90)}
                disabled={!imageLoaded || !initializing}
                className="flex-1"
              >
                <RotateCw className="w-4 h-4 mr-2" />
                90° Direita
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={reset}
                disabled={!imageLoaded || !initializing}
                className="flex-1"
              >
                Resetar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(
    modalContent,
    document.body
  );
};
