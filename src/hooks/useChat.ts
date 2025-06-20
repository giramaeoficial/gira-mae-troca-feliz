
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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

export const useChat = (conversaId?: string) => {
  const { user } = useAuth();
  const { processarMencoes } = useMentions();
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [conversa, setConversa] = useState<Conversa | null>(null);
  const [loading, setLoading] = useState(false);
  const [enviandoMensagem, setEnviandoMensagem] = useState(false);

  // Carregar mensagens da conversa
  const carregarMensagens = async (conversaId: string) => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // Buscar dados da conversa
  const buscarConversa = async (conversaId: string) => {
    try {
      const { data, error } = await supabase
        .from('conversas')
        .select('*')
        .eq('id', conversaId)
        .single();

      if (error) throw error;
      setConversa(data);
    } catch (error) {
      console.error('Erro ao buscar conversa:', error);
    }
  };

  // Enviar mensagem
  const enviarMensagem = async (conteudo: string, tipo: string = 'texto') => {
    if (!user || !conversaId || !conteudo.trim()) return false;

    setEnviandoMensagem(true);
    try {
      const { data, error } = await supabase
        .from('mensagens')
        .insert({
          conversa_id: conversaId,
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
      toast.error("Erro ao enviar mensagem");
      return false;
    } finally {
      setEnviandoMensagem(false);
    }
  };

  const marcarMensagensComoLidas = async (conversaId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('mensagens')
        .update({ lida: true })
        .eq('conversa_id', conversaId)
        .neq('remetente_id', user.id);
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
    }
  };

  // Configurar realtime para novas mensagens
  useEffect(() => {
    if (!conversaId) return;

    const channel = supabase
      .channel('mensagens-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensagens',
          filter: `conversa_id=eq.${conversaId}`
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
  }, [conversaId]);

  // Carregar dados quando a conversa muda
  useEffect(() => {
    if (conversaId && user) {
      buscarConversa(conversaId);
      carregarMensagens(conversaId);
    } else {
      setMensagens([]);
      setConversa(null);
    }
  }, [conversaId, user]);

  return {
    mensagens,
    conversa,
    loading,
    isLoading: loading,
    enviandoMensagem,
    enviarMensagem,
    marcarMensagensComoLidas,
    refetch: conversaId ? () => carregarMensagens(conversaId) : () => {}
  };
};
