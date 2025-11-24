import { useRef, useCallback } from 'react';
import Cropper from 'cropperjs';

export const useImageCrop = () => {
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

    console.log('🎨 Inicializando Cropper com configurações AGRESSIVAS...');

    const cropper = new Cropper(imageElement, {
      // ✅ CRÍTICO: viewMode 2 ou 3 para forçar preenchimento
      viewMode: 3, // ← MUDADO DE 2 PARA 3 (mais agressivo)
      
      dragMode: 'move',
      aspectRatio: 1,
      
      // ✅ CRÍTICO: autoCropArea em 1 força o crop a ocupar 100%
      autoCropArea: 1,
      
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      
      // ✅ Crop box deve ser móvel e redimensionável
      cropBoxMovable: true,
      cropBoxResizable: true,
      
      toggleDragModeOnDblclick: false,
      responsive: true,
      
      // ✅ Sem background para melhor visualização
      background: false,
      
      // ✅ Zoom habilitado
      zoomOnWheel: true,
      zoomOnTouch: true,
      wheelZoomRatio: 0.1,
      
      // ✅ Tamanhos mínimos razoáveis
      minCropBoxWidth: 100,
      minCropBoxHeight: 100,
      minContainerWidth: 100,
      minContainerHeight: 100,
      
      initialAspectRatio: 1,
      checkOrientation: true,
      checkCrossOrigin: true,
      
      // ✅ MUDANÇA CRÍTICA: setar minCanvasWidth e minCanvasHeight
      minCanvasWidth: 0,
      minCanvasHeight: 0,
      
      ready: function() {
        console.log('✅ Cropper pronto');
        
        const cropper = (this as any).cropper;
        
        // ✅ FORÇAR zoom inicial para preencher
        const containerData = cropper.getContainerData();
        const imageData = cropper.getImageData();
        
        // Calcular o zoom necessário para preencher o container
        const scaleX = containerData.width / imageData.naturalWidth;
        const scaleY = containerData.height / imageData.naturalHeight;
        const minScale = Math.max(scaleX, scaleY);
        
        // Aplicar zoom para preencher
        if (minScale > 1) {
          cropper.zoomTo(minScale);
        }
        
        console.log('📏 Container:', containerData.width, 'x', containerData.height);
        console.log('🖼️ Imagem:', imageData.naturalWidth, 'x', imageData.naturalHeight);
        console.log('🔍 Zoom aplicado:', minScale);
        
        if (onZoomChange) {
          onZoomChange(cropper.getData().scale || 1);
        }
      },
      
      zoom: function(e: any) {
        // Limitar zoom excessivo
        if (e.detail.ratio > 3) {
          e.preventDefault();
          (this as any).cropper.zoomTo(3);
          return;
        }
        
        // ✅ MUDANÇA: permitir zoom out até 0.1 (mais flexível)
        if (e.detail.ratio < 0.1) {
          e.preventDefault();
          (this as any).cropper.zoomTo(0.1);
          return;
        }
        
        if (onZoomChange) {
          onZoomChange(e.detail.ratio);
        }
      }
    } as any);

    cropperInstanceRef.current = cropper;
    return cropper;
  }, []);

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
        0.9
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
    
    // ✅ Após reset, reaplica o zoom para preencher
    const containerData = cropper.getContainerData();
    const imageData = cropper.getImageData();
    const scaleX = containerData.width / imageData.naturalWidth;
    const scaleY = containerData.height / imageData.naturalHeight;
    const minScale = Math.max(scaleX, scaleY);
    
    if (minScale > 1) {
      cropper.zoomTo(minScale);
    }
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
