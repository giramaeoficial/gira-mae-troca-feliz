
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type TrocaComDetalhes = Tables<'reservas'> & {
  itens?: {
    titulo: string;
    fotos: string[] | null;
    valor_girinhas: number;
  } | null;
  profiles_reservador?: {
    nome: string;
    avatar_url: string | null;
  } | null;
  profiles_vendedor?: {
    nome: string;
    avatar_url: string | null;
  } | null;
  avaliacoes?: {
    rating: number;
    comentario: string | null;
  }[] | null;
};

export const useTrocas = () => {
  const { user } = useAuth();
  const [trocas, setTrocas] = useState<TrocaComDetalhes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrocas = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar trocas confirmadas do usuário
      const { data: trocasData, error: trocasError } = await supabase
        .from('reservas')
        .select(`
          *,
          itens (
            titulo,
            fotos,
            valor_girinhas
          )
        `)
        .or(`usuario_reservou.eq.${user.id},usuario_item.eq.${user.id}`)
        .eq('status', 'confirmada')
        .order('updated_at', { ascending: false });

      if (trocasError) throw trocasError;

      // Para cada troca, buscar os perfis dos usuários e avaliações
      const trocasComDetalhes = await Promise.all(
        (trocasData || []).map(async (troca) => {
          // Buscar perfil do reservador
          const { data: perfilReservador } = await supabase
            .from('profiles')
            .select('nome, avatar_url')
            .eq('id', troca.usuario_reservou)
            .single();

          // Buscar perfil do vendedor
          const { data: perfilVendedor } = await supabase
            .from('profiles')
            .select('nome, avatar_url')
            .eq('id', troca.usuario_item)
            .single();

          // Buscar avaliações desta reserva
          const { data: avaliacoes } = await supabase
            .from('avaliacoes')
            .select('rating, comentario')
            .eq('reserva_id', troca.id);

          return {
            ...troca,
            profiles_reservador: perfilReservador,
            profiles_vendedor: perfilVendedor,
            avaliacoes: avaliacoes || []
          };
        })
      );

      setTrocas(trocasComDetalhes);
    } catch (err) {
      console.error('Erro ao buscar trocas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const getTotalTrocas = () => {
    return trocas.length;
  };

  const getTotalGirinhasRecebidas = () => {
    return trocas
      .filter(troca => troca.usuario_item === user?.id)
      .reduce((total, troca) => total + Number(troca.valor_girinhas), 0);
  };

  const getTotalGirinhasGastas = () => {
    return trocas
      .filter(troca => troca.usuario_reservou === user?.id)
      .reduce((total, troca) => total + Number(troca.valor_girinhas), 0);
  };

  const getMediaAvaliacoes = () => {
    const todasAvaliacoes = trocas.flatMap(troca => troca.avaliacoes || []);
    if (todasAvaliacoes.length === 0) return 0;
    
    const soma = todasAvaliacoes.reduce((acc, avaliacao) => acc + avaliacao.rating, 0);
    return Math.round((soma / todasAvaliacoes.length) * 100) / 100;
  };

  useEffect(() => {
    fetchTrocas();
  }, [user]);

  return {
    trocas,
    loading,
    error,
    refetch: fetchTrocas,
    getTotalTrocas,
    getTotalGirinhasRecebidas,
    getTotalGirinhasGastas,
    getMediaAvaliacoes
  };
};
