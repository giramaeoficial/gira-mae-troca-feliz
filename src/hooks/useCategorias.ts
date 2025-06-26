
import { useQuery } from '@tanstack/react-query';

interface Categoria {
  nome: string;
  subcategorias: string[];
}

export const useCategorias = () => {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: async (): Promise<Categoria[]> => {
      // Return mock data for now since we don't have the actual categorias table
      return [
        {
          nome: 'roupas',
          subcategorias: ['camiseta', 'vestido', 'calça', 'short']
        },
        {
          nome: 'calçados',
          subcategorias: ['tênis', 'sandália', 'sapato']
        },
        {
          nome: 'brinquedos',
          subcategorias: ['boneca', 'carrinho', 'jogo', 'pelúcia']
        },
        {
          nome: 'acessórios',
          subcategorias: ['chapéu', 'óculos', 'bolsa', 'cinto']
        }
      ];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
