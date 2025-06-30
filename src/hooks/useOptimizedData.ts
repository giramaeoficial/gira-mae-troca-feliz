
import { useQueryClient } from '@tanstack/react-query';
import { useUserData } from '@/contexts/UserDataContext';
import { useAuth } from '@/hooks/useAuth';

/**
 * ✅ HOOK OTIMIZADO - Centraliza acesso aos dados do usuário
 * Busca primeiro no contexto global/cache antes de fazer novas requisições
 */
export const useOptimizedUserData = () => {
  const { user } = useAuth();
  const { userData, isLoading, error } = useUserData();
  const queryClient = useQueryClient();

  // ✅ MÉTODO OTIMIZADO - Buscar favoritos primeiro no cache do feed
  const getFavoritos = (): string[] => {
    // Tentar pegar do cache do feed primeiro
    const feedCache = queryClient.getQueryData(['feed-item', user?.id]);
    if (feedCache && (feedCache as any).feedData?.favoritos) {
      return (feedCache as any).feedData.favoritos;
    }
    
    // Fallback: retornar array vazio se não tem no cache
    return [];
  };

  // ✅ MÉTODO OTIMIZADO - Buscar reservas primeiro no cache do feed
  const getReservas = () => {
    const feedCache = queryClient.getQueryData(['feed-item', user?.id]);
    if (feedCache && (feedCache as any).feedData?.reservas_usuario) {
      return (feedCache as any).feedData.reservas_usuario;
    }
    
    return [];
  };

  // ✅ MÉTODO OTIMIZADO - Buscar filas primeiro no cache do feed
  const getFilasEspera = () => {
    const feedCache = queryClient.getQueryData(['feed-item', user?.id]);
    if (feedCache && (feedCache as any).feedData?.filas_espera) {
      return (feedCache as any).feedData.filas_espera;
    }
    
    return {};
  };

  // ✅ MÉTODO OTIMIZADO - Verificar se item é favorito
  const isFavorito = (itemId: string): boolean => {
    const favoritos = getFavoritos();
    return favoritos.includes(itemId);
  };

  // ✅ MÉTODO OTIMIZADO - Verificar se tem reserva ativa
  const hasActiveReservation = (itemId: string): boolean => {
    const reservas = getReservas();
    return reservas.some((r: any) => 
      r.item_id === itemId && 
      ['pendente', 'confirmada'].includes(r.status)
    );
  };

  // ✅ MÉTODO OTIMIZADO - Obter info da fila
  const getFilaInfo = (itemId: string) => {
    const filas = getFilasEspera();
    return filas[itemId] || { total_fila: 0, posicao_usuario: 0 };
  };

  return {
    // Dados do usuário do contexto global
    profile: userData?.profile || null,
    carteira: userData?.carteira || null,
    filhos: userData?.filhos || [],
    escolasIds: userData?.escolasIds || [],
    saldo: userData?.carteira?.saldo_atual || 0,
    
    // Estados
    isLoading,
    error,
    
    // Métodos otimizados
    getFavoritos,
    getReservas,
    getFilasEspera,
    isFavorito,
    hasActiveReservation,
    getFilaInfo,
    
    // Helper para verificar escola em comum
    hasCommonSchool: (itemSchools: string[] = []) => {
      const userSchools = userData?.escolasIds || [];
      return userSchools.length > 0 && itemSchools.length > 0;
    }
  };
};
