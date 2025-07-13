// src/hooks/useRotaUsuario.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useEffect, useCallback } from 'react';

// ====================================================================
// INTERFACES
// ====================================================================

interface RotaUsuarioResult {
  rota_destino: string;
  pode_acessar: boolean;
  motivo: string;
  dados_debug: {
    user_id: string;
    cadastro_status: string;
    telefone_verificado: boolean;
    termos_aceitos: boolean;
    politica_aceita: boolean;
    endereco_completo: boolean;
    cidade: string;
    estado: string;
    cidade_liberada: boolean;
    cidade_liberada_em?: string;
    itens_publicados: number;
    is_admin: boolean;
    timestamp_decisao: string;
    decisao?: string;
  };
  timestamp_decisao: string;
}

interface UseRotaUsuarioReturn {
  rotaDestino: string;
  podeAcessar: boolean;
  motivo: string;
  dadosDebug: RotaUsuarioResult['dados_debug'];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  invalidateCache: () => void;
}

// ====================================================================
// HOOK PRINCIPAL
// ====================================================================

export const useRotaUsuario = (): UseRotaUsuarioReturn => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ====================================================================
  // QUERY PRINCIPAL
  // ====================================================================
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['rota-usuario', user?.id],
    queryFn: async (): Promise<RotaUsuarioResult> => {
      console.log('🔍 useRotaUsuario - Executando query para usuário:', user?.id);

      // Se não está logado, retornar estado não autenticado
      if (!user?.id) {
        console.log('❌ Usuário não autenticado');
        return {
          rota_destino: '/auth',
          pode_acessar: false,
          motivo: 'nao_autenticado',
          dados_debug: {
            user_id: '',
            cadastro_status: '',
            telefone_verificado: false,
            termos_aceitos: false,
            politica_aceita: false,
            endereco_completo: false,
            cidade: '',
            estado: '',
            cidade_liberada: false,
            itens_publicados: 0,
            is_admin: false,
            timestamp_decisao: new Date().toISOString(),
            decisao: 'Usuário não autenticado'
          },
          timestamp_decisao: new Date().toISOString()
        };
      }

      try {
        // Chamar function do banco
        const { data: resultado, error: rpcError } = await supabase
          .rpc('determinar_rota_usuario');

        if (rpcError) {
          console.error('❌ Erro na RPC determinar_rota_usuario:', rpcError);
          throw new Error(`Erro ao determinar rota: ${rpcError.message}`);
        }

        if (!resultado || resultado.length === 0) {
          console.error('❌ Function não retornou dados');
          throw new Error('Function não retornou dados válidos');
        }

        const rotaData = resultado[0] as RotaUsuarioResult;

        console.log('✅ Rota determinada com sucesso:', {
          rota: rotaData.rota_destino,
          pode_acessar: rotaData.pode_acessar,
          motivo: rotaData.motivo,
          timestamp: rotaData.timestamp_decisao
        });

        // Log detalhado para debug
        console.log('🔍 Debug completo:', rotaData.dados_debug);

        return rotaData;

      } catch (error: any) {
        console.error('❌ Erro inesperado em useRotaUsuario:', error);
        
        // Em caso de erro, retornar estado seguro
        return {
          rota_destino: '/auth',
          pode_acessar: false,
          motivo: 'erro_sistema',
          dados_debug: {
            user_id: user.id,
            cadastro_status: 'erro',
            telefone_verificado: false,
            termos_aceitos: false,
            politica_aceita: false,
            endereco_completo: false,
            cidade: '',
            estado: '',
            cidade_liberada: false,
            itens_publicados: 0,
            is_admin: false,
            timestamp_decisao: new Date().toISOString(),
            decisao: `Erro no sistema: ${error.message}`
          },
          timestamp_decisao: new Date().toISOString()
        };
      }
    },
    enabled: true, // Sempre habilitado, mesmo sem user (retorna estado não autenticado)
    staleTime: 0, // Dados sempre atuais
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: (failureCount, error) => {
      // Retry apenas para erros de rede, não para erros de lógica
      if (error?.message?.includes('Erro ao determinar rota')) {
        return failureCount < 2;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000)
  });

  // ====================================================================
  // INVALIDAÇÃO DE CACHE
  // ====================================================================
  const invalidateCache = useCallback(() => {
    console.log('🔄 Invalidando cache de rota do usuário');
    queryClient.invalidateQueries({ queryKey: ['rota-usuario'] });
    
    // Invalidar outros caches relacionados (se existirem)
    queryClient.invalidateQueries({ queryKey: ['cidade-liberada'] });
    queryClient.invalidateQueries({ queryKey: ['pacto-entrada-status'] });
    queryClient.invalidateQueries({ queryKey: ['regiao'] });
  }, [queryClient]);

  // ====================================================================
  // LISTENER PARA NOTIFICAÇÕES DO BANCO
  // ====================================================================
  useEffect(() => {
    if (!user?.id) return;

    // Escutar notificações de invalidação de cache do banco
    const channel = supabase
      .channel('routing_cache_invalidate')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'profiles',
          filter: `id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('🔔 Mudança detectada no perfil, invalidando cache:', payload);
          invalidateCache();
        }
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'cidades_config'
        }, 
        (payload) => {
          console.log('🔔 Mudança detectada em cidades_config, invalidando cache:', payload);
          invalidateCache();
        }
      )
      .subscribe();

    return () => {
      console.log('🔇 Desconectando listener de cache');
      supabase.removeChannel(channel);
    };
  }, [user?.id, invalidateCache]);

  // ====================================================================
  // EXTRAÇÃO DE DADOS SEGURA
  // ====================================================================
  const rotaDestino = data?.rota_destino || '/auth';
  const podeAcessar = data?.pode_acessar || false;
  const motivo = data?.motivo || 'loading';
  const dadosDebug = data?.dados_debug || {
    user_id: user?.id || '',
    cadastro_status: '',
    telefone_verificado: false,
    termos_aceitos: false,
    politica_aceita: false,
    endereco_completo: false,
    cidade: '',
    estado: '',
    cidade_liberada: false,
    itens_publicados: 0,
    is_admin: false,
    timestamp_decisao: new Date().toISOString()
  };

  // ====================================================================
  // LOG DE STATUS (apenas em development)
  // ====================================================================
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && data) {
      console.log('📊 useRotaUsuario - Status atual:', {
        usuario: user?.id || 'não logado',
        rota_destino: rotaDestino,
        pode_acessar: podeAcessar,
        motivo: motivo,
        loading: isLoading,
        timestamp: new Date().toISOString()
      });
    }
  }, [data, user?.id, rotaDestino, podeAcessar, motivo, isLoading]);

  // ====================================================================
  // RETORNO DO HOOK
  // ====================================================================
  return {
    rotaDestino,
    podeAcessar,
    motivo,
    dadosDebug,
    loading: isLoading,
    error: error as Error | null,
    refetch,
    invalidateCache
  };
};

// ====================================================================
// HOOK AUXILIAR PARA VERIFICAR ROTA ESPECÍFICA
// ====================================================================

interface UseCanAccessRouteReturn {
  canAccess: boolean;
  correctRoute: string;
  reason: string;
  loading: boolean;
}

export const useCanAccessRoute = (targetRoute: string): UseCanAccessRouteReturn => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['can-access-route', user?.id, targetRoute],
    queryFn: async () => {
      if (!user?.id) {
        return {
          pode_acessar: false,
          rota_correta: '/auth',
          motivo: 'nao_autenticado'
        };
      }

      try {
        const { data: resultado, error } = await supabase
          .rpc('pode_acessar_rota', {
            p_rota_tentativa: targetRoute
          });

        if (error) {
          console.error('❌ Erro ao verificar acesso à rota:', error);
          return {
            pode_acessar: false,
            rota_correta: '/auth',
            motivo: 'erro_sistema'
          };
        }

        return resultado[0];
      } catch (error) {
        console.error('❌ Erro inesperado ao verificar rota:', error);
        return {
          pode_acessar: false,
          rota_correta: '/auth',
          motivo: 'erro_sistema'
        };
      }
    },
    enabled: !!user?.id && !!targetRoute,
    staleTime: 30000, // 30 segundos (pode cachear um pouco mais)
    retry: 1
  });

  return {
    canAccess: data?.pode_acessar || false,
    correctRoute: data?.rota_correta || '/auth',
    reason: data?.motivo || 'loading',
    loading: isLoading
  };
};

// ====================================================================
// UTILITÁRIOS AUXILIARES
// ====================================================================

// Helper para verificar se usuário pode acessar qualquer rota protegida
export const useHasFullAccess = () => {
  const { podeAcessar, motivo } = useRotaUsuario();
  return {
    hasFullAccess: podeAcessar,
    reason: motivo
  };
};

// Helper para verificar motivos específicos
export const useRoutingReason = () => {
  const { motivo, dadosDebug } = useRotaUsuario();
  
  return {
    isAdmin: dadosDebug.is_admin,
    isCityReleased: dadosDebug.cidade_liberada,
    isMissionComplete: dadosDebug.itens_publicados >= 2,
    isOnboardingComplete: dadosDebug.telefone_verificado && dadosDebug.termos_aceitos && dadosDebug.politica_aceita && dadosDebug.endereco_completo,
    currentReason: motivo,
    debugData: dadosDebug
  };
};
