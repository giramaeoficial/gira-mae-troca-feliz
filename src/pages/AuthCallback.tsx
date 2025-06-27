
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!user) return;

      try {
        // Verificar status do cadastro do usuário
        const { data, error } = await supabase
          .from('profiles')
          .select('cadastro_status, cadastro_step')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao verificar perfil:', error);
          // Se não encontrou perfil, provavelmente é primeira vez
          navigate('/cadastro');
          return;
        }

        // Redirecionar baseado no status
        if (data.cadastro_status === 'completo') {
          toast({
            title: "Login realizado!",
            description: "Bem-vinda de volta!",
          });
          navigate('/feed');
        } else {
          // Cadastro incompleto, continuar de onde parou
          navigate('/cadastro');
        }
      } catch (error) {
        console.error('Erro no callback de auth:', error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro durante o login. Tente novamente.",
          variant: "destructive",
        });
        navigate('/auth');
      }
    };

    // Pequeno delay para garantir que o user foi carregado
    const timer = setTimeout(handleAuthCallback, 1000);
    
    return () => clearTimeout(timer);
  }, [user, navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Finalizando login...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
