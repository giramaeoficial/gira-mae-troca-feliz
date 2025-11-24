import React, { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Button } from '@/components/ui/button';
import { X, RotateCcw, RotateCw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useImageCrop } from '@/hooks/useImageCrop';
import { toast } from '@/hooks/use-toast';
import 'cropperjs/dist/cropper.css';

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
  
  const { 
    initCropper, 
    destroyCropper, 
    applyCrop, 
    rotate, 
    reset, 
    zoom 
  } = useImageCrop();

  useEffect(() => {
    if (isOpen && imageRef.current && imageLoaded) {
      const handleZoomChange = (ratio: number) => {
        setZoomValue(ratio);
      };
      
      initCropper(imageRef.current, handleZoomChange);
    }
    
    return () => {
      destroyCropper();
    };
  }, [isOpen, imageSrc, imageLoaded, initCropper, destroyCropper]);

  useEffect(() => {
    if (!isOpen) {
      setImageLoaded(false);
      setZoomValue(0);
    }
  }, [isOpen]);

  const handleApply = async () => {
    try {
      const blob = await applyCrop('crop.jpg');
      console.log(`✅ Crop aplicado - Tamanho: ${(blob.size / 1024).toFixed(2)}KB`);
      onApply(blob);
      setImageLoaded(false);
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
      className="fixed inset-0 bg-black z-[99999] flex flex-col"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
        padding: 0,
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
          disabled={!imageLoaded}
        >
          Aplicar
        </Button>
      </div>

      {/* Área de Crop */}
      <div 
        ref={containerRef}
        className="flex-1 bg-gray-950 overflow-hidden flex items-center justify-center"
        style={{ 
          width: '100%',
          height: 'calc(100vh - 160px)',
          minHeight: '400px'
        }}
      >
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              display: imageLoaded ? 'block' : 'none'
            }}
          />
        </div>
      </div>

      {/* Controles - MELHORADO */}
      <div className="bg-gray-900 px-4 py-4 space-y-3 flex-shrink-0">
        {/* Zoom */}
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path>
          </svg>
          <Slider
            value={[zoomValue]}
            onValueChange={handleZoomChange}
            min={0}
            max={2}
            step={0.01}
            disabled={!imageLoaded}
            className="flex-1"
          />
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"></path>
          </svg>
        </div>

        {/* Info do formato */}
        <div className="bg-purple-900/50 rounded-lg p-2 text-center">
          <p className="text-white text-sm font-medium">📐 Formato quadrado 1:1</p>
          <p className="text-purple-300 text-xs mt-1">Padrão GiraMãe para melhor visualização</p>
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          <Button
            onClick={() => rotate(-90)}
            disabled={!imageLoaded}
            variant="secondary"
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Girar
          </Button>
          <Button
            onClick={reset}
            disabled={!imageLoaded}
            variant="secondary"
            className="flex-1"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Resetar
          </Button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};
