
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { getImageUrl, ImageSize } from '@/utils/supabaseStorage';

interface LazyImageProps {
  src: string;
  alt: string;
  bucket?: string;
  size?: ImageSize;
  className?: string;
  skeletonClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: string;
  transform?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg';
  };
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  bucket = 'itens',
  size = 'medium',
  className,
  skeletonClassName,
  onLoad,
  onError,
  placeholder = "📷",
  transform
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const currentContainer = containerRef.current;
    
    if (!currentContainer) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px'
      }
    );

    observerRef.current.observe(currentContainer);

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // Processar URL da imagem
  const getProcessedImageUrl = () => {
    // Se for uma URL completa (HTTP ou blob), usar diretamente
    if (src.startsWith('http') || src.startsWith('blob:') || src.startsWith('data:')) {
      return src;
    }
    
    // Se for um caminho relativo do Supabase, processar com bucket
    return getImageUrl(bucket, src, size, transform);
  };

  const imageUrl = getProcessedImageUrl();

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    console.error('Erro ao carregar imagem:', imageUrl);
    setHasError(true);
    onError?.();
  };

  // Se deu erro, mostrar fallback
  if (hasError) {
    return (
      <div 
        ref={containerRef}
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-400',
          className
        )}
      >
        <div className="text-center">
          <span className="text-4xl mb-2 block">📷</span>
          <span className="text-sm">Imagem não encontrada</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden', className)}>
      {/* Skeleton loading - só mostra se não carregou ainda */}
      {!isLoaded && isInView && (
        <div 
          className={cn(
            'absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center',
            skeletonClassName
          )}
        >
          <div className="text-gray-400 text-sm">
            {placeholder}
          </div>
        </div>
      )}

      {/* Placeholder inicial antes de entrar em view */}
      {!isInView && (
        <div 
          className={cn(
            'absolute inset-0 bg-gray-100 flex items-center justify-center',
            skeletonClassName
          )}
        >
          <div className="text-gray-400 text-2xl">
            📷
          </div>
        </div>
      )}

      {/* Imagem real - só renderiza se estiver em view */}
      {isInView && (
        <img
          ref={imgRef}
          src={imageUrl}
          alt={alt}
          className={cn(
            'transition-opacity duration-300 w-full h-full object-cover',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default LazyImage;
