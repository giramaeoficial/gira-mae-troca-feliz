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
        
        const cropper = (this as any).cropper;
        const containerData = cropper.getContainerData();
        const imageData = cropper.getImageData();
        
        // Calcular escala para preencher 85% do container
        const scaleX = (containerData.width * 0.85) / imageData.naturalWidth;
        const scaleY = (containerData.height * 0.85) / imageData.naturalHeight;
        const scale = Math.max(scaleX, scaleY, 1);
        
        // Aplicar zoom inicial se necessário
        if (scale > 1) {
          cropper.zoomTo(scale);
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
    const cropper = cropperInstance as any;
    cropper?.reset();
    // Reaplica zoom inicial após reset
    setTimeout(() => {
      const containerData = cropper?.getContainerData();
      const imageData = cropper?.getImageData();
      
      if (containerData && imageData) {
        const scaleX = (containerData.width * 0.85) / imageData.naturalWidth;
        const scaleY = (containerData.height * 0.85) / imageData.naturalHeight;
        const scale = Math.max(scaleX, scaleY, 1);
        if (scale > 1) {
          cropper?.zoomTo(scale);
        }
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
