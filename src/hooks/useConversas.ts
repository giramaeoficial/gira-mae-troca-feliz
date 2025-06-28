
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ✅ MANTENDO interfaces EXATAMENTE IGUAIS
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
  const [conversas, setConversas] = useState<ConversaCompleta[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversaAtiva, setConversaAtiva] = useState<ConversaCompleta | null>(null);

  // ✅ NOVA IMPLEMENTAÇÃO OTIMIZADA: 1 request ao invés de 31
  const carregarConversas = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // ✅ UMA ÚNICA CHAMADA RPC que retorna tudo processado
      const { data: conversasCompletas, error } = await supabase.rpc(
        'buscar_conversas_completas', 
        { p_user_id: user.id }
      );

      if (error) throw error;

      // ✅ Dados já vêm formatados da function, apenas setamos no state
      setConversas(conversasCompletas || []);

    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      toast.error("Erro ao carregar conversas");
    } finally {
      setLoading(false);
    }
  };

  // ✅ MANTENDO criarConversa EXATAMENTE IGUAL
  const criarConversa = async (outroUsuarioId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .rpc('obter_ou_criar_conversa_livre', { 
          p_usuario1_id: user.id, 
          p_usuario2_id: outroUsuarioId 
        });

      if (error) throw error;

      await carregarConversas();
      return data;
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      toast.error("Erro ao criar conversa");
      return null;
    }
  };

  // ✅ MANTENDO marcarComoLida EXATAMENTE IGUAL
  const marcarComoLida = async (conversaId: string) => {
    try {
      // Since 'lida' column doesn't exist, we'll just log this action
      // In a real implementation, you might want to create a separate table for read receipts
      console.log(`Marking conversation ${conversaId} as read by user ${user?.id}`);
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  // ✅ MANTENDO useEffect IGUAL
  useEffect(() => {
    if (user) {
      carregarConversas();
    }
  }, [user]);

  // ✅ MANTENDO return EXATAMENTE IGUAL - todas as funcionalidades preservadas
  return {
    conversas,
    conversaAtiva,
    loading,
    isLoading: loading,
    criarConversa,
    marcarComoLida,
    refetch: carregarConversas,
    setConversaAtiva
  };
};
