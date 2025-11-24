import { useState, useCallback } from 'react';
import Cropper from 'cropperjs';

export const useImageCrop = () => {
  const [cropperInstance, setCropperInstance] = useState<Cropper | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);

  /**
   * Inicializa o cropper em um elemento img
   */
  const initCropper = useCallback((
    imageElement: HTMLImageElement,
    onZoomChange?: (ratio: number) => void
  ) => {
    if (cropperInstance) {
      cropperInstance.destroy();
    }

    const cropper = new Cropper(imageElement, {
      aspectRatio: 1,
      autoCropArea: 1,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      responsive: true,
      background: false,
      ready: function() {
        console.log('✅ Cropper inicializado');
      },
      zoom: function(e: any) {
        if (onZoomChange) {
          onZoomChange(e.detail.ratio);
        }
      }
    } as any);

    setCropperInstance(cropper);
    return cropper;
  }, [cropperInstance]);

  /**
   * Aplica o crop e retorna o arquivo processado
   */
  const applyCrop = useCallback(async (
    originalFileName: string
  ): Promise<Blob> => {
    if (!cropperInstance) {
      throw new Error('Cropper não inicializado');
    }

    const canvas = (cropperInstance as any).getCroppedCanvas({
      width: 1024,
      height: 1024,
      fillColor: '#fff',
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    });

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob: Blob | null) => {
          if (!blob) {
            reject(new Error('Falha ao gerar blob'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        0.9
      );
    });
  }, [cropperInstance]);

  /**
   * Destrói a instância do cropper
   */
  const destroyCropper = useCallback(() => {
    if (cropperInstance) {
      cropperInstance.destroy();
      setCropperInstance(null);
    }
  }, [cropperInstance]);

  /**
   * Controles do cropper
   */
  const zoom = useCallback((ratio: number) => {
    (cropperInstance as any)?.zoomTo(ratio);
  }, [cropperInstance]);

  const rotate = useCallback((degrees: number) => {
    (cropperInstance as any)?.rotate(degrees);
  }, [cropperInstance]);

  const reset = useCallback(() => {
    (cropperInstance as any)?.reset();
  }, [cropperInstance]);

  return {
    initCropper,
    applyCrop,
    destroyCropper,
    zoom,
    rotate,
    reset,
    cropperInstance,
    currentImageIndex,
    setCurrentImageIndex
  };
};
