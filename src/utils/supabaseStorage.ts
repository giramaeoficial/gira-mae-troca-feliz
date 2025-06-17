
import { supabase } from '@/integrations/supabase/client';

export type ImageSize = 'thumbnail' | 'medium' | 'full';

export interface UploadImageOptions {
  bucket: string;
  path: string;
  file: File;
  generateSizes?: boolean;
}

export const uploadImage = async ({
  bucket,
  path,
  file,
  generateSizes = true
}: UploadImageOptions) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  return data;
};

export const getImageUrl = (
  bucket: string,
  path: string,
  size: ImageSize = 'full',
  transform?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg';
  }
): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  
  if (!transform && size === 'full') {
    return data.publicUrl;
  }

  // Aplicar transformações baseadas no tamanho
  const sizeTransforms = {
    thumbnail: { width: 150, height: 150, quality: 80 },
    medium: { width: 500, height: 500, quality: 85 },
    full: { width: 1024, height: 1024, quality: 90 }
  };

  const finalTransform = { ...sizeTransforms[size], ...transform };
  const params = new URLSearchParams();

  if (finalTransform.width) params.append('width', finalTransform.width.toString());
  if (finalTransform.height) params.append('height', finalTransform.height.toString());
  if (finalTransform.quality) params.append('quality', finalTransform.quality.toString());
  if (finalTransform.format) params.append('format', finalTransform.format);

  return `${data.publicUrl}?${params.toString()}`;
};

export const deleteImage = async (bucket: string, path: string) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
};

export const generateImagePath = (userId: string, filename: string): string => {
  const timestamp = Date.now();
  const extension = filename.split('.').pop();
  return `${userId}/${timestamp}.${extension}`;
};
