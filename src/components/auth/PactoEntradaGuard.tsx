
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

  const { data: missaoCompleta, isLoading } = useQuery({
    queryKey: ['missao-primeiros-passos', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;

      // Verificar se a missão "Primeiros Passos" existe e está completa
      const { data, error } = await supabase
        .from('missoes_usuarios')
        .select(`
          status,
          missoes!inner(titulo, condicoes)
        `)
        .eq('user_id', user.id)
        .eq('missoes.titulo', 'Primeiros Passos')
        .eq('status', 'completa')
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar missão:', error);
        return false;
      }

      return !!data;
    },
    enabled: !!user?.id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Se a missão não foi completada, redirecionar para onboarding
  if (!missaoCompleta) {
    return <Navigate to="/conceito-comunidade" replace />;
  }

  return <>{children}</>;
};

export default PactoEntradaGuard;
