import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
  structuredData?: object;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = "GiraMãe - Troca de Roupas Infantis entre Mães | Brechó Online Sustentável",
  description = "Plataforma de troca de roupas infantis entre mães em Canoas/RS. Economia circular com moeda virtual Girinhas. Brechó online sustentável para roupas, brinquedos e calçados infantis.",
  keywords = "troca roupas infantis, brechó online, economia circular mães, sustentabilidade infantil, roupas usadas criança, GiraMãe, Girinhas, Canoas RS",
  image = "https://giramae.com.br/og-image.jpg",
  url = "https://giramae.com.br",
  type = "website",
  noindex = false,
  structuredData
}) => {
  const fullTitle = title.includes('GiraMãe') ? title : `${title} | GiraMãe`;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:site_name" content="GiraMãe" />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional Meta Tags */}
      <meta name="author" content="GiraMãe" />
      <meta name="theme-color" content="#E879F9" />
      <meta name="geo.region" content="BR-RS" />
      <meta name="geo.placename" content="Canoas" />
      <meta name="geo.position" content="-29.9177;-51.1794" />
      
      {/* Performance Hints */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://mkuuwnqiaeguuexeeicw.supabase.co" />
      <link rel="dns-prefetch" href="https://lovable.dev" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
