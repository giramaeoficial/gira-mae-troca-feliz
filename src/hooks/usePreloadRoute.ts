
import { lazy } from 'react';

// Cache para componentes já carregados
const routeCache = new Map();

// Mapeamento de rotas para imports
const routeImports = {
  '/feed': () => import('../pages/Feed'),
  '/perfil': () => import('../pages/Perfil'),
  '/sistema-girinhas': () => import('../pages/SistemaGirinhas'),
  '/carteira': () => import('../pages/Carteira'),
  '/reservas': () => import('../pages/MinhasReservas'),
  '/publicar': () => import('../pages/PublicarItem'),
  '/indicacoes': () => import('../pages/Indicacoes'),
};

export const usePreloadRoute = () => {
  const preloadRoute = (path: string) => {
    // Verifica se já está em cache
    if (routeCache.has(path)) {
      return routeCache.get(path);
    }

    // Verifica se existe import para esta rota
    const importFn = routeImports[path as keyof typeof routeImports];
    if (!importFn) {
      console.warn(`No preload import found for route: ${path}`);
      return;
    }

    // Inicia o preload
    const preloadPromise = importFn()
      .then((module) => {
        console.log(`Route ${path} preloaded successfully`);
        return module;
      })
      .catch((error) => {
        console.error(`Failed to preload route ${path}:`, error);
        // Remove do cache em caso de erro para permitir retry
        routeCache.delete(path);
      });

    // Armazena no cache
    routeCache.set(path, preloadPromise);
    return preloadPromise;
  };

  const clearCache = () => {
    routeCache.clear();
  };

  return { preloadRoute, clearCache };
};
