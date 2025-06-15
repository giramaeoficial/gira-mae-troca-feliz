
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  reserva_id: string;
  usuario1_id: string;
  usuario2_id: string;
  created_at: string;
}

export const useChat = (reservaId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [conversa, setConversa] = useState<Conversa | null>(null);
  const [loading, setLoading] = useState(true);
  const [enviandoMensagem, setEnviandoMensagem] = useState(false);

  // Buscar ou criar conversa
  const buscarConversa = async () => {
    if (!user || !reservaId) return;

    try {
      setLoading(true);
      
      // Usar função RPC para buscar ou criar conversa
      const { data: conversaId, error: conversaError } = await supabase
        .rpc('obter_ou_criar_conversa', {
          p_reserva_id: reservaId
        });

      if (conversaError) throw conversaError;

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
      const { error } = await supabase
        .from('mensagens')
        .insert({
          conversa_id: conversa.id,
          remetente_id: user.id,
          conteudo: conteudo.trim(),
          tipo
        });

      if (error) throw error;

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

  // Buscar conversa quando o componente monta
  useEffect(() => {
    buscarConversa();
  }, [user, reservaId]);

  return {
    mensagens,
    conversa,
    loading,
    enviandoMensagem,
    enviarMensagem,
    refetch: buscarConversa
  };
};
