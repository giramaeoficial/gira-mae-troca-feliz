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
  }, [isOpen, imageLoaded]); // Removido imageSrc das dependências para evitar reinicialização

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
      className="fixed inset-0 bg-black flex flex-col"
      style={{ 
        zIndex: 99999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
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
          disabled={!imageLoaded || !initializing}
        >
          Aplicar
        </Button>
      </div>

      {/* Área de Crop - AUMENTADA */}
      <div 
        ref={containerRef}
        className="flex-1 bg-gray-950 overflow-hidden flex items-center justify-center p-4"
        style={{ 
          minHeight: '60vh',
          height: 'calc(100vh - 200px)'
        }}
      >
        <div 
          style={{ 
            width: '100%', 
            height: '100%', 
            maxWidth: '800px',
            maxHeight: '800px',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Imagem para crop"
            onLoad={handleImageLoad}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              width: 'auto',
              height: 'auto',
              display: imageLoaded ? 'block' : 'none',
              objectFit: 'contain'
            }}
          />
          
          {!imageLoaded && (
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Carregando imagem...</p>
            </div>
          )}
        </div>
      </div>

      {/* Controles */}
      <div className="bg-gray-900 px-4 py-4 space-y-4 flex-shrink-0">
        {/* Zoom Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-white text-sm">
            <span>Zoom</span>
            <span className="font-mono">{(zoomValue * 100).toFixed(0)}%</span>
          </div>
          <Slider
            min={0.5}
            max={3}
            step={0.01}
            value={[zoomValue]}
            onValueChange={handleZoomChange}
            disabled={!imageLoaded || !initializing}
            className="w-full"
          />
        </div>

        {/* Botões de Rotação e Reset */}
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => rotate(-90)}
            disabled={!imageLoaded || !initializing}
            className="text-white border-gray-600 hover:bg-gray-800"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Girar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => rotate(90)}
            disabled={!imageLoaded || !initializing}
            className="text-white border-gray-600 hover:bg-gray-800"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Girar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={reset}
            disabled={!imageLoaded || !initializing}
            className="text-white border-gray-600 hover:bg-gray-800"
          >
            Resetar
          </Button>
        </div>

        {/* Dica */}
        <div className="text-center text-gray-400 text-xs">
          🖼️ Formato quadrado 1:1 - Padrão GiraMãe para melhor visualização
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};
