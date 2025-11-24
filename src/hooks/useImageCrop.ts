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
      viewMode: 1, // Restringe crop box dentro do canvas
      dragMode: 'move', // Permite mover a imagem
      aspectRatio: 1, // FIXO - Formato quadrado
      autoCropArea: 0.9, // 90% da área inicial
      restore: false,
      guides: true,
      center: true,
      highlight: true,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
      responsive: true,
      background: true,
      modal: true, // Escurece área fora do crop
      zoomOnWheel: true,
      zoomOnTouch: true,
      wheelZoomRatio: 0.1,
      
      // Configurações de tamanho
      minCropBoxWidth: 100,
      minCropBoxHeight: 100,
      
      ready: function() {
        console.log('✅ Cropper inicializado');
        
        // Centralizar imagem ao iniciar
        const containerData = (this as any).cropper.getContainerData();
        const imageData = (this as any).cropper.getImageData();
        
        // Se a imagem for maior que o container, fazer zoom inicial para caber melhor
        if (imageData.naturalWidth > containerData.width || 
            imageData.naturalHeight > containerData.height) {
          const scaleX = containerData.width / imageData.naturalWidth;
          const scaleY = containerData.height / imageData.naturalHeight;
          const scale = Math.min(scaleX, scaleY) * 0.8; // 80% do tamanho máximo
          (this as any).cropper.zoomTo(scale);
        }
      },
      
      zoom: function(e: any) {
        // Limitar zoom excessivo
        if (e.detail.ratio > 3) {
          e.preventDefault();
          (this as any).cropper.zoomTo(3);
        }
        if (e.detail.ratio < 0.1) {
          e.preventDefault();
          (this as any).cropper.zoomTo(0.1);
        }
        
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
          console.log('✅ Crop aplicado:', {
            size: `${(blob.size / 1024).toFixed(2)}KB`,
            dimensions: '1024x1024px'
          });
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
      console.log('🗑️ Cropper destruído');
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
    // Reaplica zoom inicial após reset
    setTimeout(() => {
      const containerData = (cropperInstance as any)?.getContainerData();
      const imageData = (cropperInstance as any)?.getImageData();
      
      if (containerData && imageData) {
        const scaleX = containerData.width / imageData.naturalWidth;
        const scaleY = containerData.height / imageData.naturalHeight;
        const scale = Math.min(scaleX, scaleY) * 0.8;
        (cropperInstance as any)?.zoomTo(scale);
      }
    }, 100);
  }, [cropperInstance]);

  const move = useCallback((offsetX: number, offsetY: number) => {
    (cropperInstance as any)?.move(offsetX, offsetY);
  }, [cropperInstance]);

  const scale = useCallback((scaleX: number, scaleY?: number) => {
    (cropperInstance as any)?.scale(scaleX, scaleY);
  }, [cropperInstance]);

  return {
    initCropper,
    applyCrop,
    destroyCropper,
    zoom,
    rotate,
    reset,
    move,
    scale,
    cropperInstance,
    currentImageIndex,
    setCurrentImageIndex
  };
};
