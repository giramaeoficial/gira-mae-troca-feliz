import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { name } = req.query;
  
  // Usa variável de ambiente para determinar o projeto Supabase
  const supabaseProjectId = process.env.VITE_SUPABASE_PROJECT_ID;
  
  if (!supabaseProjectId) {
    return res.status(500).json({ error: 'VITE_SUPABASE_PROJECT_ID not configured' });
  }

  // Mapeia os nomes válidos de sitemap
  const validSitemaps = ['index', 'posts', 'categories', 'tags', 'static'];
  const sitemapName = Array.isArray(name) ? name[0] : name;
  
  if (!sitemapName || !validSitemaps.includes(sitemapName)) {
    return res.status(404).json({ error: 'Sitemap not found' });
  }

  const functionName = sitemapName === 'index' ? 'sitemap-index' : `sitemap-${sitemapName}`;
  const supabaseUrl = `https://${supabaseProjectId}.supabase.co/functions/v1/${functionName}`;

  try {
    const response = await fetch(supabaseUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/xml',
      },
    });

    if (!response.ok) {
      throw new Error(`Supabase responded with ${response.status}`);
    }

    const xml = await response.text();

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('X-Supabase-Project', supabaseProjectId);
    
    return res.status(200).send(xml);
  } catch (error) {
    console.error('Sitemap proxy error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch sitemap',
      project: supabaseProjectId 
    });
  }
}
