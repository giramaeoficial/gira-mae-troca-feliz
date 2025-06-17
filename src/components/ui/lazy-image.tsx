
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
  placeholder,
  transform
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const currentImg = imgRef.current;
    
    if (!currentImg) return;

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

    observerRef.current.observe(currentImg);

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // Melhorar a lógica de URL da imagem
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
    setHasError(true);
    onError?.();
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {(!isLoaded || !isInView) && (
        <div 
          className={cn(
            'absolute inset-0 bg-gray-200 animate-pulse',
            skeletonClassName
          )}
        >
          {placeholder && (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              {placeholder}
            </div>
          )}
        </div>
      )}

      {isInView && (
        <img
          ref={imgRef}
          src={hasError ? placeholder : imageUrl}
          alt={alt}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default LazyImage;
