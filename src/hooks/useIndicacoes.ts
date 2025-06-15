import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRecompensas } from '@/components/recompensas/ProviderRecompensas';

interface Indicacao {
  id: string;
  indicador_id: string;
  indicado_id: string;
  bonus_cadastro_pago: boolean;
  bonus_primeiro_item_pago: boolean;
  bonus_primeira_compra_pago: boolean;
  data_cadastro_indicado?: string;
  data_primeiro_item?: string;
  data_primeira_compra?: string;
  created_at: string;
  profiles?: {
    nome: string;
    email: string;
  } | null;
}

export const useIndicacoes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { mostrarRecompensa } = useRecompensas();
  const [indicacoes, setIndicacoes] = useState<Indicacao[]>([]);
  const [indicados, setIndicados] = useState<Indicacao[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIndicacoes = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Buscar indicações feitas pelo usuário
      const { data: minhasIndicacoes, error: error1 } = await supabase
        .from('indicacoes')
        .select(`
          *,
          profiles!indicacoes_indicado_id_fkey (nome, email)
        `)
        .eq('indicador_id', user.id)
        .order('created_at', { ascending: false });

      if (error1) throw error1;

      // Buscar indicações onde o usuário foi indicado
      const { data: meusIndicadores, error: error2 } = await supabase
        .from('indicacoes')
        .select(`
          *,
          profiles!indicacoes_indicador_id_fkey (nome, email)
        `)
        .eq('indicado_id', user.id)
        .order('created_at', { ascending: false });

      if (error2) throw error2;

      // Filtrar e mapear dados válidos
      const indicacoesValidas = (minhasIndicacoes || []).map(item => ({
        ...item,
        profiles: item.profiles && typeof item.profiles === 'object' && 'nome' in item.profiles 
          ? item.profiles as { nome: string; email: string }
          : null
      }));

      const indicadosValidos = (meusIndicadores || []).map(item => ({
        ...item,
        profiles: item.profiles && typeof item.profiles === 'object' && 'nome' in item.profiles 
          ? item.profiles as { nome: string; email: string }
          : null
      }));

      setIndicacoes(indicacoesValidas);
      setIndicados(indicadosValidos);
    } catch (error) {
      console.error('Erro ao buscar indicações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as indicações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const registrarIndicacao = async (emailIndicado: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Buscar ID do usuário pelo email
      const { data: perfilIndicado, error: searchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', emailIndicado.toLowerCase())
        .single();

      if (searchError || !perfilIndicado) {
        toast({
          title: "Usuário não encontrado",
          description: "Não encontramos nenhum usuário com este email.",
          variant: "destructive",
        });
        return false;
      }

      if (perfilIndicado.id === user.id) {
        toast({
          title: "Erro",
          description: "Você não pode indicar a si mesmo.",
          variant: "destructive",
        });
        return false;
      }

      // Registrar indicação usando a função do banco
      const { data, error } = await supabase.rpc('registrar_indicacao', {
        p_indicador_id: user.id,
        p_indicado_id: perfilIndicado.id
      });

      if (error) throw error;

      if (data) {
        toast({
          title: "✨ Indicação registrada!",
          description: "Você receberá bônus quando esta pessoa se engajar na plataforma.",
        });
        
        await fetchIndicacoes();
        return true;
      } else {
        toast({
          title: "Indicação já existe",
          description: "Você já indicou este usuário anteriormente.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Erro ao registrar indicação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar a indicação.",
        variant: "destructive",
      });
      return false;
    }
  };

  const gerarLinkIndicacao = () => {
    if (!user) return '';
    
    const baseUrl = window.location.origin;
    return `${baseUrl}/cadastro?ref=${user.id}`;
  };

  const compartilharIndicacao = async () => {
    const link = gerarLinkIndicacao();
    const texto = `🌟 Oi! Você precisa conhecer o GiraMãe! É uma plataforma incrível onde mães trocam roupas, brinquedos e itens infantis usando uma moeda virtual chamada Girinha. É sustentável, econômico e divertido! Use meu link e ganhe bônus para começar: ${link}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Venha para o GiraMãe!',
          text: texto,
          url: link
        });
      } catch (error) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      // Fallback para copiar para clipboard
      try {
        await navigator.clipboard.writeText(texto);
        toast({
          title: "Link copiado!",
          description: "O link de indicação foi copiado para sua área de transferência.",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível copiar o link.",
          variant: "destructive",
        });
      }
    }
  };

  // Monitorar bônus de indicação em tempo real
  useEffect(() => {
    if (!user) return;

    const transacoesChannel = supabase
      .channel('indicacoes-bonus')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transacoes',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const transacao = payload.new as any;
          
          if (transacao.tipo === 'bonus' && transacao.descricao?.includes('indicação')) {
            setTimeout(() => {
              if (transacao.descricao.includes('Novo cadastro')) {
                mostrarRecompensa({
                  tipo: 'indicacao',
                  valor: transacao.valor,
                  descricao: 'Parabéns! Sua indicação se cadastrou na plataforma!'
                });
              } else if (transacao.descricao.includes('Primeiro item')) {
                mostrarRecompensa({
                  tipo: 'indicacao',
                  valor: transacao.valor,
                  descricao: 'Incrível! Sua indicação publicou o primeiro item!'
                });
              } else if (transacao.descricao.includes('Primeira compra')) {
                mostrarRecompensa({
                  tipo: 'indicacao',
                  valor: transacao.valor,
                  descricao: 'Fantástico! Sua indicação fez a primeira compra!'
                });
              }
            }, 1000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(transacoesChannel);
    };
  }, [user, mostrarRecompensa]);

  useEffect(() => {
    fetchIndicacoes();
  }, [user]);

  return {
    indicacoes,
    indicados,
    loading,
    registrarIndicacao,
    gerarLinkIndicacao,
    compartilharIndicacao,
    refetch: fetchIndicacoes
  };
};
