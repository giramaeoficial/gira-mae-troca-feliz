import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from '@/components/loading/LoadingSpinner';

interface PactoEntradaGuardProps {
  children: React.ReactNode;
}

const PactoEntradaGuard: React.FC<PactoEntradaGuardProps> = ({ children }) => {
  const { user } = useAuth();

  const { data: missaoStatus, isLoading } = useQuery({
    queryKey: ['pacto-entrada-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return { missaoCompleta: false, itensPublicados: 0 };

      // Buscar quantos itens o usuário já publicou
      const { data: itens, error: itensError } = await supabase
        .from('itens')
        .select('id')
        .eq('publicado_por', user.id);

      if (itensError) {
        console.error('Erro ao buscar itens publicados:', itensError);
        return { missaoCompleta: false, itensPublicados: 0 };
      }

      const itensPublicados = itens?.length || 0;
      const missaoCompleta = itensPublicados >= 2;

      // Se completou a missão, verificar se existe registro na tabela missoes_usuarios
      if (missaoCompleta) {
        const { data: missaoUsuario, error: missaoError } = await supabase
          .from('missoes_usuarios')
          .select(`
            status,
            missoes!inner(titulo)
          `)
          .eq('user_id', user.id)
          .eq('missoes.titulo', 'Primeiros Passos')
          .maybeSingle();

        if (missaoError) {
          console.warn('Erro ao verificar missão Primeiros Passos:', missaoError);
        }

        // Se não existe registro, criar automaticamente
        if (!missaoUsuario) {
          const { data: missao } = await supabase
            .from('missoes')
            .select('id')
            .eq('titulo', 'Primeiros Passos')
            .eq('ativo', true)
            .maybeSingle();

          if (missao) {
            await supabase
              .from('missoes_usuarios')
              .upsert({
                user_id: user.id,
                missao_id: missao.id,
                progresso_atual: itensPublicados,
                progresso_necessario: 2,
                status: 'completa',
                data_completada: new Date().toISOString()
              });
          }
        }
      }

      return {
        missaoCompleta,
        itensPublicados
      };
    },
    enabled: !!user?.id,
    refetchOnWindowFocus: false,
    staleTime: 30000 // Cache por 30 segundos
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center space-y-4">
          <LoadingSpinner />
          <p className="text-gray-600">Verificando sua missão...</p>
        </div>
      </div>
    );
  }

  // Se a missão não foi completada, redirecionar para o onboarding
  if (!missaoStatus?.missaoCompleta) {
    // Se ainda não publicou nenhum item, vai para o conceito
    if (!missaoStatus?.itensPublicados || missaoStatus.itensPublicados === 0) {
      return <Navigate to="/conceito-comunidade" replace />;
    }
    
    // Se já publicou pelo menos 1 item, vai direto para publicar o segundo
    return <Navigate to="/publicar-primeiro-item" replace />;
  }

  // Missão completa - permitir acesso
  return <>{children}</>;
};

export default PactoEntradaGuard;
