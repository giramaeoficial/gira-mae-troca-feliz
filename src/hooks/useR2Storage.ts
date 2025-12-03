import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Domínio público do R2 - configurar conforme ambiente
const R2_PUBLIC_DOMAIN = import.meta.env.VITE_R2_PUBLIC_DOMAIN || 'https://pub-SEU-ID.r2.dev';

export interface R2UploadResult {
  path: string;
  publicUrl: string;
}

export const useR2Storage = () => {
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Faz upload de arquivo para o Cloudflare R2
   * @param file O arquivo (File object)
   * @param bucket Nome do bucket (ex: 'itens')
   * @param path Caminho/Nome do arquivo (ex: 'user_123/foto.jpg')
   */
  const uploadFile = async (
    file: File, 
    bucket: string, 
    path: string
  ): Promise<{ data: R2UploadResult | null; error: Error | null }> => {
    setIsUploading(true);
    try {
      console.log('🔄 R2 Upload iniciando:', { bucket, path, fileSize: file.size });

      // 1. Pede a URL assinada para a Edge Function
      const { data: responseData, error: funcError } = await supabase.functions.invoke('storage-r2', {
        body: {
          action: 'upload',
          bucket,
          key: path,
          contentType: file.type
        }
      });

      if (funcError || !responseData?.uploadUrl) {
        throw new Error(funcError?.message || 'Falha ao gerar URL de upload');
      }

      console.log('✅ URL de upload obtida');

      // 2. Faz o upload direto para o R2 usando a URL assinada
      const uploadResponse = await fetch(responseData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('Erro ao enviar arquivo para o R2');
      }

      // 3. Retorna a URL pública final para salvar no banco
      const publicUrl = `${R2_PUBLIC_DOMAIN}/${bucket}/${path}`;
      
      console.log('✅ R2 Upload concluído:', publicUrl);

      return { 
        data: { path, publicUrl }, 
        error: null 
      };

    } catch (error: any) {
      console.error('❌ R2 Upload Error:', error);
      return { data: null, error };
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Deleta arquivo do R2
   */
  const deleteFile = async (
    bucket: string, 
    path: string
  ): Promise<{ error: Error | null }> => {
    try {
      console.log('🗑️ R2 Delete:', { bucket, path });

      const { error } = await supabase.functions.invoke('storage-r2', {
        body: {
          action: 'delete',
          bucket,
          key: path
        }
      });

      if (error) {
        throw error;
      }

      console.log('✅ R2 Delete concluído');
      return { error: null };
    } catch (error: any) {
      console.error('❌ R2 Delete Error:', error);
      return { error };
    }
  };

  /**
   * Gera URL pública (Apenas formatação de string, sem custo)
   */
  const getPublicUrl = (bucket: string, path: string): string => {
    return `${R2_PUBLIC_DOMAIN}/${bucket}/${path}`;
  };

  return {
    uploadFile,
    deleteFile,
    getPublicUrl,
    isUploading
  };
};
