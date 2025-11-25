import React, { useState, useRef, useEffect, useCallback } from 'react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropComplete: (croppedImageUrl: string) => void;
  aspectRatio?: number;
}

const MODAL_ANIMATION_DURATION = 350;

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  aspectRatio = 1,
}) => {
  const cropperRef = useRef<ReactCropperElement>(null);
  const [cropper, setCropper] = useState<Cropper | null>(null);
  const [isModalReady, setIsModalReady] = useState(false);

  // Aguarda o modal estar completamente visível antes de renderizar o Cropper
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      timer = setTimeout(() => {
        setIsModalReady(true);
      }, MODAL_ANIMATION_DURATION);
    } else {
      setIsModalReady(false);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Cleanup quando o modal fecha
  useEffect(() => {
    if (!isOpen && cropper) {
      cropper.destroy();
      setCropper(null);
    }
  }, [isOpen, cropper]);

  const handleCrop = useCallback(() => {
    if (cropper) {
      const canvas = cropper.getCroppedCanvas({
        maxWidth: 1920,
        maxHeight: 1080,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });
      if (canvas) {
        onCropComplete(canvas.toDataURL('image/jpeg', 0.9));
        onClose();
      }
    }
  }, [cropper, onCropComplete, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-4 w-full max-w-2xl mx-4">
        <h2 className="text-lg font-semibold mb-4">Recortar Imagem</h2>
        
        {/* Container com altura EXPLÍCITA - crítico! */}
        <div style={{ height: 400, width: '100%' }}>
          {isModalReady && imageSrc ? (
            <Cropper
              ref={cropperRef}
              src={imageSrc}
              style={{ height: '100%', width: '100%' }}
              viewMode={1}
              aspectRatio={aspectRatio}
              autoCropArea={1}
              responsive={true}
              restore={true}
              guides={true}
              center={true}
              background={false}
              checkOrientation={false}
              onInitialized={(instance) => setCropper(instance)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span>Carregando...</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleCrop}
            disabled={!cropper}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Recortar
          </button>
        </div>
      </div>
    </div>
  );
};
