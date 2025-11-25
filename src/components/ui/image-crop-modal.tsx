import React, { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Button } from '@/components/ui/button';
import { X, RotateCcw, RotateCw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';
import Cropper from 'cropperjs';

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
  const cropperRef = useRef<Cropper | null>(null);
  const [zoomValue, setZoomValue] = useState(0);

  // Inicializar cropper quando imagem carregar
  const handleImageLoad = () => {
    if (!imageRef.current) return;

    // Destruir cropper anterior
    if (cropperRef.current) {
      cropperRef.current.destroy();
      cropperRef.current = null;
    }

    console.log('🎨 Inicializando Cropper...');

    // EXATAMENTE como no HTML que funciona
    const cropper = new Cropper(imageRef.current, {
      viewMode: 1,
      dragMode: 'move',
      aspectRatio: 1,
      autoCropArea: 1,
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
      responsive: true,
      background: false,
      zoomOnWheel: true,
      zoomOnTouch: true,
      ready: function() {
        console.log('✅ Cropper pronto');
        setZoomValue(0);
      },
      zoom: function(e: any) {
        setZoomValue(e.detail.ratio);
      }
    });

    cropperRef.current = cropper;
  };

  // Cleanup ao fechar
  useEffect(() => {
    if (!isOpen && cropperRef.current) {
      cropperRef.current.destroy();
      cropperRef.current = null;
      setZoomValue(0);
    }
  }, [isOpen]);

  const handleApply = () => {
    if (!cropperRef.current) return;

    const canvas = cropperRef.current.getCroppedCanvas({
      width: 1024,
      height: 1024,
      fillColor: '#fff',
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    });

    canvas.toBlob((blob) => {
      if (!blob) {
        toast({
          title: "Erro",
          description: "Falha ao processar a imagem",
          variant: "destructive"
        });
        return;
      }

      console.log(`✅ Crop aplicado - Tamanho: ${(blob.size / 1024).toFixed(2)}KB`);
      onApply(blob);
    }, 'image/jpeg', 0.9);
  };

  const handleZoomChange = (value: number[]) => {
    if (cropperRef.current) {
      cropperRef.current.zoomTo(value[0]);
    }
  };

  const handleRotate = (degrees: number) => {
    if (cropperRef.current) {
      cropperRef.current.rotate(degrees);
    }
  };

  const handleReset = () => {
    if (cropperRef.current) {
      cropperRef.current.reset();
      setZoomValue(0);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-[99999]">
      <div className="h-full flex flex-col">
        
        {/* Header do Modal */}
        <div className="bg-gray-900 px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-gray-800"
          >
            ← Voltar
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

        {/* Área de Crop - EXATAMENTE como no HTML */}
        <div className="flex-1 relative overflow-hidden">
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Imagem para crop"
            className="max-w-full"
            style={{ display: 'block', maxHeight: '100%' }}
            onLoad={handleImageLoad}
          />
        </div>

        {/* Controles */}
        <div className="bg-gray-900 px-4 py-4 space-y-3">
          
          {/* Zoom */}
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path>
            </svg>
            <Slider
              value={[zoomValue]}
              onValueChange={handleZoomChange}
              min={0}
              max={2}
              step={0.01}
              className="flex-1"
            />
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"></path>
            </svg>
          </div>

          {/* Info do formato */}
          <div className="bg-purple-900 rounded-lg p-3 text-center">
            <p className="text-white text-sm font-medium">📐 Formato quadrado 1:1</p>
            <p className="text-purple-300 text-xs mt-1">Padrão GiraMãe para melhor visualização</p>
          </div>

          {/* Ações */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRotate(-90)}
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Girar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex-1"
            >
              Resetar
            </Button>
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
