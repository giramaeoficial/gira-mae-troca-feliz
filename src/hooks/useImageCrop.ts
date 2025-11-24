import { useRef, useCallback } from 'react';
import Cropper from 'cropperjs';

export const useImageCrop = () => {
  // Usar useRef ao invés de useState para evitar re-renders
  const cropperInstanceRef = useRef<Cropper | null>(null);

  /**
   * Inicializa o cropper em um elemento img
   */
  const initCropper = useCallback((
    imageElement: HTMLImageElement,
    onZoomChange?: (ratio: number) => void
  ) => {
    // Destruir instância anterior se existir
    if (cropperInstanceRef.current) {
      cropperInstanceRef.current.destroy();
      cropperInstanceRef.current = null;
    }

    console.log('🎨 Inicializando Cropper...');

    const cropper = new Cropper(imageElement, {
      viewMode: 2, // ✅ MUDANÇA: de 1 para 2 - força a imagem a preencher o container
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
      wheelZoomRatio: 0.1,
      minCropBoxWidth: 200,
      minCropBoxHeight: 200,
      initialAspectRatio: 1,
      checkOrientation: true,
      checkCrossOrigin: true,
      
      ready: function() {
        console.log('✅ Cropper pronto');
        
        const cropper = (this as any).cropper;
        
        // Iniciar com zoom 0 (padrão do protótipo)
        if (onZoomChange) {
          onZoomChange(0);
        }
      },
      
      zoom: function(e: any) {
        // Limitar zoom excessivo
        if (e.detail.ratio > 3) {
          e.preventDefault();
          (this as any).cropper.zoomTo(3);
          return;
        }
        if (e.detail.ratio < 0.5) {
          e.preventDefault();
          (this as any).cropper.zoomTo(0.5);
          return;
        }
        
        if (onZoomChange) {
          onZoomChange(e.detail.ratio);
        }
      }
    } as any);

    cropperInstanceRef.current = cropper;
    return cropper;
  }, []); // Array vazio - nunca recria a função

  /**
   * Aplica o crop e retorna o Blob processado
   */
  const applyCrop = useCallback(async (
    originalFileName: string = 'crop.jpg'
  ): Promise<Blob> => {
    if (!cropperInstanceRef.current) {
      throw new Error('Cropper não inicializado');
    }

    const cropperAny = cropperInstanceRef.current as any;
    const canvas = cropperAny.getCroppedCanvas({
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
        0.9 // 90% de qualidade
      );
    });
  }, []);

  /**
   * Destrói a instância do cropper
   */
  const destroyCropper = useCallback(() => {
    if (cropperInstanceRef.current) {
      cropperInstanceRef.current.destroy();
      cropperInstanceRef.current = null;
      console.log('🗑️ Cropper destruído');
    }
  }, []);

  /**
   * Controle de zoom
   */
  const zoom = useCallback((ratio: number) => {
    if (cropperInstanceRef.current) {
      (cropperInstanceRef.current as any).zoomTo(ratio);
    }
  }, []);

  /**
   * Rotação da imagem
   */
  const rotate = useCallback((degrees: number) => {
    if (cropperInstanceRef.current) {
      (cropperInstanceRef.current as any).rotate(degrees);
    }
  }, []);

  /**
   * Reset do cropper
   */
  const reset = useCallback(() => {
    if (!cropperInstanceRef.current) return;
    
    const cropper = cropperInstanceRef.current as any;
    cropper.reset();
  }, []);

  /**
   * Mover imagem
   */
  const move = useCallback((offsetX: number, offsetY: number) => {
    if (cropperInstanceRef.current) {
      (cropperInstanceRef.current as any).move(offsetX, offsetY);
    }
  }, []);

  /**
   * Escalar imagem
   */
  const scale = useCallback((scaleX: number, scaleY?: number) => {
    if (cropperInstanceRef.current) {
      (cropperInstanceRef.current as any).scale(scaleX, scaleY);
    }
  }, []);

  return {
    initCropper,
    applyCrop,
    destroyCropper,
    zoom,
    rotate,
    reset,
    move,
    scale,
    cropperInstance: cropperInstanceRef.current
  };
};
