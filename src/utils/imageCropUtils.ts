export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ImageMetadata {
  file: File;
  originalSrc: string;
  croppedSrc: string | null;
  croppedBlob: Blob | null;
  dimensions: ImageDimensions;
  needsCrop: boolean;
  edited: boolean;
}

/**
 * Verifica se uma imagem é aproximadamente quadrada
 * Tolerância de 50px de diferença
 */
export const isImageSquare = (width: number, height: number): boolean => {
  return Math.abs(width - height) < 50;
};

/**
 * Carrega dimensões de uma imagem
 */
export const loadImageDimensions = (file: File): Promise<ImageDimensions> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => reject(new Error('Falha ao carregar imagem'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
    reader.readAsDataURL(file);
  });
};

/**
 * Converte Canvas para File com compressão
 */
export const canvasToFile = async (
  canvas: HTMLCanvasElement,
  fileName: string,
  quality: number = 0.9
): Promise<File> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Falha ao converter canvas'));
          return;
        }
        
        const file = new File([blob], fileName, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        
        resolve(file);
      },
      'image/jpeg',
      quality
    );
  });
};

/**
 * Processa múltiplas imagens e identifica quais precisam de crop
 */
export const processMultipleImages = async (
  files: File[]
): Promise<ImageMetadata[]> => {
  const metadata: ImageMetadata[] = [];
  
  for (const file of files) {
    const dimensions = await loadImageDimensions(file);
    const needsCrop = !isImageSquare(dimensions.width, dimensions.height);
    
    const reader = new FileReader();
    const originalSrc = await new Promise<string>((resolve) => {
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
    
    metadata.push({
      file,
      originalSrc,
      croppedSrc: null,
      croppedBlob: null,
      dimensions,
      needsCrop,
      edited: false
    });
  }
  
  return metadata;
};
