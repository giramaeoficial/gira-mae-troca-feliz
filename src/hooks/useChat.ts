
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMentions } from '@/hooks/useMentions';

interface Mensagem {
  id: string;
  conteudo: string;
  remetente_id: string;
  created_at: string;
  tipo: string;
  remetente?: {
    nome: string;
    avatar_url: string | null;
  };
}

interface Conversa {
  id: string;
  reserva_id: string | null;
  usuario1_id: string;
  usuario2_id: string;
  created_at: string;
}

export const useChat = (reservaId?: string, outroUsuarioId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { processarMencoes } = useMentions();
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [conversa, setConversa] = useState<Conversa | null>(null);
  const [loading, setLoading] = useState(false);
  const [enviandoMensagem, setEnviandoMensagem] = useState(false);

  // Verificar se devemos buscar conversa
  const shouldFetchConversation = Boolean(user && (reservaId || outroUsuarioId));

  // Buscar ou criar conversa
  const buscarConversa = async () => {
    if (!user || (!reservaId && !outroUsuarioId)) return;

    try {
      setLoading(true);
      let conversaId: string;

      if (reservaId) {
        // Conversa baseada em reserva
        const { data, error } = await supabase
          .rpc('obter_ou_criar_conversa', { p_reserva_id: reservaId });

        if (error) throw error;
        conversaId = data;
      } else if (outroUsuarioId) {
        // Conversa livre entre usuários
        const { data, error } = await supabase
          .rpc('obter_ou_criar_conversa_livre', { 
            p_usuario1_id: user.id, 
            p_usuario2_id: outroUsuarioId 
          });

        if (error) throw error;
        conversaId = data;
      } else {
        throw new Error('É necessário fornecer reservaId ou outroUsuarioId');
      }

      // Buscar dados da conversa
      const { data: conversaData, error: conversaDataError } = await supabase
        .from('conversas')
        .select('*')
        .eq('id', conversaId)
        .single();

      if (conversaDataError) throw conversaDataError;

      setConversa(conversaData);
      await carregarMensagens(conversaId);
    } catch (error) {
      console.error('Erro ao buscar conversa:', error);
      toast({
        title: "Erro ao carregar chat",
        description: "Não foi possível carregar a conversa.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar mensagens da conversa
  const carregarMensagens = async (conversaId: string) => {
    try {
      const { data, error } = await supabase
        .from('mensagens')
        .select(`
          *,
          remetente:profiles!mensagens_remetente_id_fkey (
            nome,
            avatar_url
          )
        `)
        .eq('conversa_id', conversaId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMensagens(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  // Enviar mensagem
  const enviarMensagem = async (conteudo: string, tipo: string = 'texto') => {
    if (!user || !conversa || !conteudo.trim()) return false;

    setEnviandoMensagem(true);
    try {
      const { data, error } = await supabase
        .from('mensagens')
        .insert({
          conversa_id: conversa.id,
          remetente_id: user.id,
          conteudo: conteudo.trim(),
          tipo
        })
        .select()
        .single();

      if (error) throw error;

      // Processar menções na mensagem
      if (data) {
        await processarMencoes(data.id, conteudo);
      }

      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setEnviandoMensagem(false);
    }
  };

  // Configurar realtime para novas mensagens
  useEffect(() => {
    if (!conversa) return;

    const channel = supabase
      .channel('mensagens-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensagens',
          filter: `conversa_id=eq.${conversa.id}`
        },
        async (payload) => {
          // Buscar dados completos da nova mensagem
          const { data: novaMensagem } = await supabase
            .from('mensagens')
            .select(`
              *,
              remetente:profiles!mensagens_remetente_id_fkey (
                nome,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (novaMensagem) {
            setMensagens(prev => [...prev, novaMensagem]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversa]);

  // Buscar conversa quando o componente monta (apenas se devemos buscar)
  useEffect(() => {
    if (shouldFetchConversation) {
      buscarConversa();
    } else {
      // Reset dos estados quando não devemos buscar conversa
      setMensagens([]);
      setConversa(null);
      setLoading(false);
    }
  }, [user, reservaId, outroUsuarioId, shouldFetchConversation]);

  return {
    mensagens,
    conversa,
    loading,
    enviandoMensagem,
    enviarMensagem,
    refetch: shouldFetchConversation ? buscarConversa : () => {}
  };
};
