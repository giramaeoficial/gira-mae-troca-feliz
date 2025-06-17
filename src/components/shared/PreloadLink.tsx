
import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { usePreloadRoute } from '@/hooks/usePreloadRoute';

interface PreloadLinkProps extends LinkProps {
  children: React.ReactNode;
  preloadDelay?: number;
}

const PreloadLink: React.FC<PreloadLinkProps> = ({ 
  to, 
  children, 
  preloadDelay = 100,
  ...props 
}) => {
  const { preloadRoute } = usePreloadRoute();
  let preloadTimer: NodeJS.Timeout | null = null;

  const handleMouseEnter = () => {
    // Delay pequeno para evitar preloads desnecessários em hover rápido
    preloadTimer = setTimeout(() => {
      const path = typeof to === 'string' ? to : to.pathname;
      if (path) {
        preloadRoute(path);
      }
    }, preloadDelay);
  };

  const handleMouseLeave = () => {
    if (preloadTimer) {
      clearTimeout(preloadTimer);
      preloadTimer = null;
    }
  };

  return (
    <Link
      to={to}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </Link>
  );
};

export default PreloadLink;
