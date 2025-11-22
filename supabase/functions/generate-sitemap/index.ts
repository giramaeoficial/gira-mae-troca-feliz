import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar posts publicados
    const { data: posts, error: postsError } = await supabase.rpc('blog_get_posts', {
      p_filters: { status: 'published' },
      p_pagination: { page: 1, page_size: 1000 }
    });

    if (postsError) {
      console.error('Erro ao buscar posts:', postsError);
      throw postsError;
    }

    // Buscar categorias
    const { data: categories, error: categoriesError } = await supabase.rpc('blog_get_categories');
    
    if (categoriesError) {
      console.error('Erro ao buscar categorias:', categoriesError);
    }

    // Buscar tags
    const { data: tags, error: tagsError } = await supabase.rpc('blog_get_tags');
    
    if (tagsError) {
      console.error('Erro ao buscar tags:', tagsError);
    }

    // Gerar URLs dos posts
    const postUrls = (posts || []).map((post: any) => `
  <url>
    <loc>https://giramae.com.br/blog/${post.slug}</loc>
    <lastmod>${new Date(post.updated_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

    // Gerar URLs das categorias
    const categoryUrls = (categories || []).map((cat: any) => `
  <url>
    <loc>https://giramae.com.br/blog/categoria/${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');

    // Gerar URLs das tags
    const tagUrls = (tags || []).map((tag: any) => `
  <url>
    <loc>https://giramae.com.br/blog/tag/${tag.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('');

    // Gerar sitemap completo
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>https://giramae.com.br</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Blog Home -->
  <url>
    <loc>https://giramae.com.br/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Blog Categorias -->
  <url>
    <loc>https://giramae.com.br/blog/categorias</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Blog Posts -->
  ${postUrls}
  
  <!-- Categories -->
  ${categoryUrls}
  
  <!-- Tags -->
  ${tagUrls}
  
  <!-- Páginas Principais -->
  <url>
    <loc>https://giramae.com.br/sobre</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://giramae.com.br/como-funciona</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://giramae.com.br/faq</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://giramae.com.br/contato</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://giramae.com.br/termos</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://giramae.com.br/privacidade</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>`;

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
      },
    });
  } catch (error) {
    console.error('Erro ao gerar sitemap:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
