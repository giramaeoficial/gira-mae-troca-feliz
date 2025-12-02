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
  placeholder?: string; // Esta prop não será mais muito usada, mas mantive pela interface
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
  // placeholder = "📷", // Removido pois não usaremos mais o emoji
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
    if (src.startsWith('http') || src.startsWith('blob:') || src.startsWith('data:')) {
      return src;
    }
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

  // Se deu erro, mostrar fallback (Mantive o original, mas você pode querer mudar o ícone aqui também)
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
          <span className="text-4xl mb-2 block">⚠️</span>
          <span className="text-sm">Erro na imagem</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden', className)}>
      
      {/* --- MUDANÇA AQUI ---
         Spinner de Carregamento (Logotipo Girando).
         Mostra sempre que a imagem final ainda não terminou de carregar (!isLoaded).
         Isso substitui tanto o "Skeleton loading" quanto o "Placeholder inicial".
      */}
      {!isLoaded && (
        <div 
          className={cn(
            // Usei um fundo cinza bem claro para destacar o logo.
            // Removi o 'animate-pulse' do fundo, pois o logo já estará animado.
            'absolute inset-0 bg-gray-50 flex items-center justify-center',
            skeletonClassName
          )}
        >
          {/* O Logotipo Giratório */}
          <img 
            src="/giramae_logo.png"
            alt="Carregando..."
            // animate-spin: faz girar
            // w-12 h-12: define um tamanho fixo para o spinner (ajuste conforme necessário)
            // opacity-60: deixa um pouco translúcido para não ficar muito agressivo
            className="animate-spin w-12 h-12 object-contain opacity-60"
          />
        </div>
      )}

      {/* Imagem real - só renderiza se estiver em view (para economizar banda) */}
      {isInView && (
        <img
          ref={imgRef}
          src={imageUrl}
          alt={alt}
          className={cn(
            // A transição de opacidade fará o spinner desaparecer suavemente quando a imagem aparecer
            'transition-opacity duration-500 w-full h-full object-cover absolute inset-0',
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
