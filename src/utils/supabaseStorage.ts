import { supabase } from '@/integrations/supabase/client';

// Domínio público do R2 - configurar conforme ambiente
const R2_PUBLIC_DOMAIN = import.meta.env.VITE_R2_PUBLIC_DOMAIN || 'https://pub-SEU-ID.r2.dev';

export type ImageSize = 'thumbnail' | 'medium' | 'full';

export interface UploadImageOptions {
  bucket: string;
  path: string;
  file: File;
  generateSizes?: boolean;
}

export interface UploadResult {
  path: string;
  fullPath: string;
  publicUrl: string;
}

export const uploadImage = async ({
  bucket,
  path,
  file
}: UploadImageOptions): Promise<UploadResult> => {
  console.log('🔄 Iniciando upload R2:', { bucket, path, fileSize: file.size, fileType: file.type });

  // Verificar se o arquivo é uma imagem válida
  if (!file.type.startsWith('image/')) {
    throw new Error('Arquivo deve ser uma imagem');
  }

  // Verificar tamanho do arquivo (máximo 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Arquivo muito grande. Máximo 5MB permitido.');
  }

  try {
    // 1. Pedir URL assinada para a Edge Function
    const { data: funcData, error: funcError } = await supabase.functions.invoke('storage-r2', {
      body: {
        action: 'upload',
        bucket,
        key: path,
        contentType: file.type
      }
    });

    if (funcError || !funcData?.uploadUrl) {
      console.error('❌ Erro ao obter URL de upload:', funcError);
      throw new Error(funcError?.message || 'Falha ao obter permissão de upload');
    }

    console.log('✅ URL de upload obtida');

    // 2. Fazer o upload via PUT na URL assinada
    const uploadResponse = await fetch(funcData.uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    });

    if (!uploadResponse.ok) {
      console.error('❌ Falha no upload para R2:', uploadResponse.status, uploadResponse.statusText);
      throw new Error('Falha ao enviar arquivo para o Cloudflare');
    }

    console.log('✅ Upload R2 realizado com sucesso');

    // Construir URL pública
    const publicUrl = `${R2_PUBLIC_DOMAIN}/${bucket}/${path}`;

    return {
      path: path,
      fullPath: `${bucket}/${path}`,
      publicUrl
    };

  } catch (error: any) {
    console.error('❌ Erro no upload R2:', error);
    throw error;
  }
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
  // R2 padrão não suporta transformações on-the-fly sem Cloudflare Images
  // Retorna URL direta
  return `${R2_PUBLIC_DOMAIN}/${bucket}/${path}`;
};

export const deleteImage = async (bucket: string, path: string) => {
  console.log('🗑️ Deletando imagem R2:', { bucket, path });
  
  const { error } = await supabase.functions.invoke('storage-r2', {
    body: {
      action: 'delete',
      bucket,
      key: path
    }
  });

  if (error) {
    console.error('❌ Erro ao deletar imagem R2:', error);
    throw error;
  }
  
  console.log('✅ Imagem deletada com sucesso');
};

export const generateImagePath = (userId: string, filename: string): string => {
  const timestamp = Date.now();
  const extension = filename.split('.').pop()?.toLowerCase();
  const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${userId}/${timestamp}_${cleanFilename}`;
};
