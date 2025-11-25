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
  const [containerHeight, setContainerHeight] = useState<number>(0);
  
  const { 
    initCropper, 
    destroyCropper, 
    applyCrop, 
    rotate, 
    reset, 
    zoom 
  } = useImageCrop();

  // ✅ MUDANÇA 1: Calcular altura do container ANTES de inicializar
  useEffect(() => {
    if (isOpen && containerRef.current) {
      // Header = 60px, Footer = 140px
      const availableHeight = window.innerHeight - 60 - 140;
      setContainerHeight(availableHeight);
      console.log('📐 Altura calculada para container:', availableHeight);
    }
  }, [isOpen]);

  // ✅ MUDANÇA 2: Inicializar cropper COM DELAY após imagem carregar E container ter altura
  useEffect(() => {
    if (isOpen && imageRef.current && imageLoaded && containerHeight > 0 && !initializing) {
      console.log('🎬 Iniciando cropper após tudo pronto...');
      setInitializing(true);
      
      const handleZoomChange = (ratio: number) => {
        setZoomValue(ratio);
      };
      
      // ✅ CRÍTICO: Aguardar 2 frames + timeout para garantir layout estável
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            if (imageRef.current && containerRef.current) {
              console.log('🚀 Inicializando Cropper agora!');
              initCropper(imageRef.current, handleZoomChange);
            }
          }, 100);
        });
      });
    }
    
    return () => {
      if (initializing) {
        destroyCropper();
        setInitializing(false);
      }
    };
  }, [isOpen, imageLoaded, containerHeight]);

  // Reset quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      setImageLoaded(false);
      setZoomValue(0);
      setInitializing(false);
      setContainerHeight(0);
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

      {/* ✅ MUDANÇA 3: Container com altura EXPLÍCITA calculada */}
      <div 
        ref={containerRef}
        className="bg-black relative overflow-hidden"
        style={{ 
          height: containerHeight > 0 ? `${containerHeight}px` : '100%',
          width: '100%',
          flexShrink: 0
        }}
      >
        {/* ✅ MUDANÇA 4: Usar opacity ao invés de display none */}
        <img
          ref={imageRef}
          src={imageSrc}
          alt="Imagem para crop"
          onLoad={handleImageLoad}
          style={{
            display: 'block',
            maxWidth: '100%',
            maxHeight: '100%',
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.2s'
          }}
        />
        
        {!imageLoaded && (
          <div 
            className="absolute inset-0 flex items-center justify-center text-white text-sm"
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
