
export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp';
  maxSizeKB?: number;
}

export const compressImage = async (
  file: File,
  options: CompressOptions = {}
): Promise<File> => {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.85,
    format = 'webp',
    maxSizeKB = 200
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calcular dimensões mantendo aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Desenhar imagem redimensionada
      ctx?.drawImage(img, 0, 0, width, height);

      // Converter para blob com qualidade adaptativa
      const tryCompress = (currentQuality: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Falha na compressão da imagem'));
              return;
            }

            const sizeKB = blob.size / 1024;

            // Se está acima do limite e qualidade ainda é alta, tenta reduzir
            if (sizeKB > maxSizeKB && currentQuality > 0.3) {
              tryCompress(currentQuality - 0.1);
              return;
            }

            // Criar novo arquivo com nome otimizado
            const fileName = file.name.replace(/\.[^/.]+$/, `.${format}`);
            const compressedFile = new File([blob], fileName, {
              type: `image/${format}`,
              lastModified: Date.now()
            });

            resolve(compressedFile);
          },
          `image/${format}`,
          currentQuality
        );
      };

      tryCompress(quality);
    };

    img.onerror = () => reject(new Error('Falha ao carregar imagem'));
    img.src = URL.createObjectURL(file);
  });
};

export const compressMultipleImages = async (
  files: File[],
  options?: CompressOptions
): Promise<File[]> => {
  const compressionPromises = files.map(file => compressImage(file, options));
  return Promise.all(compressionPromises);
};
