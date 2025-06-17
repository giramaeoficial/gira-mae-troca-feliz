
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConversaCompleta {
  id: string;
  reserva_id: string | null;
  usuario1_id: string;
  usuario2_id: string;
  created_at: string;
  updated_at: string;
  participante: {
    id: string;
    nome: string;
    username: string;
    avatar_url: string | null;
  };
  ultimaMensagem?: {
    conteudo: string;
    created_at: string;
    remetente_id: string;
  } | null;
  item?: {
    id: string;
    titulo: string;
    fotos: string[];
    valor_girinhas: number;
  } | null;
  naoLidas: number;
}

export const useConversas = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversas, setConversas] = useState<ConversaCompleta[]>([]);
  const [loading, setLoading] = useState(false);

  const carregarConversas = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Buscar conversas do usuário
      const { data: conversasData, error: conversasError } = await supabase
        .from('conversas')
        .select(`
          *,
          reservas:reserva_id (
            id,
            item_id,
            itens:item_id (
              id,
              titulo,
              fotos,
              valor_girinhas
            )
          )
        `)
        .or(`usuario1_id.eq.${user.id},usuario2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (conversasError) throw conversasError;

      // Para cada conversa, buscar dados do participante e última mensagem
      const conversasCompletas = await Promise.all(
        (conversasData || []).map(async (conversa) => {
          // Determinar quem é o outro participante
          const outroUsuarioId = conversa.usuario1_id === user.id 
            ? conversa.usuario2_id 
            : conversa.usuario1_id;

          // Buscar dados do participante
          const { data: participanteData } = await supabase
            .from('profiles')
            .select('id, nome, username, avatar_url')
            .eq('id', outroUsuarioId)
            .single();

          // Buscar última mensagem
          const { data: ultimaMensagemData } = await supabase
            .from('mensagens')
            .select('conteudo, created_at, remetente_id')
            .eq('conversa_id', conversa.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Contar mensagens não lidas
          const { count: naoLidas } = await supabase
            .from('mensagens')
            .select('id', { count: 'exact' })
            .eq('conversa_id', conversa.id)
            .neq('remetente_id', user.id);

          return {
            id: conversa.id,
            reserva_id: conversa.reserva_id,
            usuario1_id: conversa.usuario1_id,
            usuario2_id: conversa.usuario2_id,
            created_at: conversa.created_at,
            updated_at: conversa.updated_at,
            participante: participanteData || {
              id: outroUsuarioId,
              nome: 'Usuário',
              username: 'usuario',
              avatar_url: null,
            },
            ultimaMensagem: ultimaMensagemData,
            item: conversa.reservas?.itens || null,
            naoLidas: naoLidas || 0,
          };
        })
      );

      setConversas(conversasCompletas);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      toast({
        title: "Erro ao carregar conversas",
        description: "Não foi possível carregar suas conversas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      carregarConversas();
    }
  }, [user]);

  return {
    conversas,
    loading,
    refetch: carregarConversas
  };
};
