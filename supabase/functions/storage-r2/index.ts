import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { 
  S3Client, 
  PutObjectCommand, 
  DeleteObjectCommand 
} from 'https://esm.sh/@aws-sdk/client-s3@3.454.0'
import { getSignedUrl } from 'https://esm.sh/@aws-sdk/s3-request-presigner@3.454.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Autenticação básica via Supabase
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')

    const token = authHeader.replace('Bearer ', '')
    console.log('🔐 Token recebido (primeiros 20 chars):', token.substring(0, 20))

    // 2. Configuração do R2
    const accountId = Deno.env.get('R2_ACCOUNT_ID')
    const accessKeyId = Deno.env.get('R2_ACCESS_KEY_ID')
    const secretAccessKey = Deno.env.get('R2_SECRET_ACCESS_KEY')

    if (!accountId || !accessKeyId || !secretAccessKey) {
      console.error('❌ Variáveis R2 não configuradas:', { 
        hasAccountId: !!accountId, 
        hasAccessKeyId: !!accessKeyId, 
        hasSecretAccessKey: !!secretAccessKey 
      })
      throw new Error('R2 credentials not configured')
    }

    const R2 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })

    // 3. Recebimento dos dados
    const { action, key, bucket, contentType } = await req.json()
    console.log('📦 Request:', { action, bucket, key, contentType })

    if (!bucket) throw new Error('Bucket missing')
    if (!key) throw new Error('Key missing')

    // 4. Buckets permitidos — carregados do .env automaticamente
    const allowedBucketsEnv = Deno.env.get('R2_ALLOWED_BUCKETS') ?? ''
    const allowed = allowedBucketsEnv
      .split(',')
      .map((b) => b.trim())
      .filter((b) => b.length > 0)

    console.log('🪣 Buckets permitidos:', allowed)

    if (allowed.length > 0 && !allowed.includes(bucket)) {
      throw new Error(`Bucket not allowed: ${bucket}`)
    }

    // 5. Converter para PATH RELATIVO (obrigatório)
    const cleanedKey = cleanKey(key)
    console.log('🔑 Key limpa:', cleanedKey)

    // 6. Gerar URL de upload
    if (action === 'upload') {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: cleanedKey,
        ContentType: contentType || 'image/jpeg',
      })

      const signedUrl = await getSignedUrl(R2, command, { expiresIn: 300 })
      console.log('✅ URL assinada gerada para upload')

      return new Response(
        JSON.stringify({
          uploadUrl: signedUrl,
          key: cleanedKey,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // 7. Deletar arquivo
    if (action === 'delete') {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: cleanedKey,
      })

      await R2.send(command)
      console.log('✅ Arquivo deletado:', cleanedKey)

      return new Response(
        JSON.stringify({ success: true, key: cleanedKey }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      )
    }

    throw new Error('Invalid action')

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('❌ Erro na Edge Function storage-r2:', errorMessage)
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })
  }
})

/**
 * Remove domínio e devolve só o path relativo
 * Funciona com URLs completas, paths com barra inicial, etc.
 */
function cleanKey(input: string): string {
  try {
    // Remove domínio e query params se vier URL completa
    if (input.startsWith('http')) {
      const url = new URL(input)
      return url.pathname.replace(/^\/+/, '')
    }

    // remove possíveis barras iniciais
    return input.replace(/^\/+/, '')
  } catch {
    // fallback seguro
    return input.replace(/^\/+/, '')
  }
}
