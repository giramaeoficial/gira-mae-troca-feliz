
import { TipoTransacaoEnum } from '@/types/transacao.types';

// Formatação limpa dos tipos de transação
export const formatarTipoTransacao = (tipo: string): string => {
  const mapeamento: Record<string, string> = {
    // Créditos
    'compra': 'Compra',
    'bonus_cadastro': 'Bônus de Cadastro',
    'bonus_diario': 'Bônus Diário',
    'bonus_troca_concluida': 'Troca Concluída',
    'missao': 'Missão',
    'recebido_item': 'Recebido',
    'transferencia_p2p_entrada': 'Transferência Recebida',
    'reembolso': 'Reembolso',
    
    // Débitos
    'bloqueio_reserva': 'Bloqueio Reserva',
    'transferencia_p2p_saida': 'Transferência Enviada',
    'taxa_transferencia': 'Taxa Transferência',
    'taxa_extensao_validade': 'Taxa Extensão',
    'queima_expiracao': 'Expiração',
    'queima_administrativa': 'Queima Admin'
  };

  return mapeamento[tipo] || tipo;
};

// Tipos que ADICIONAM saldo
export const isTransacaoPositiva = (tipo: string): boolean => {
  const tiposPositivos: string[] = [
    'compra',
    'bonus_cadastro',
    'bonus_diario',
    'bonus_troca_concluida',
    'missao',
    'recebido_item',
    'transferencia_p2p_entrada',
    'reembolso'
  ];
  
  return tiposPositivos.includes(tipo);
};

// Cores baseadas em ADIÇÃO/DEDUÇÃO
export const getCorTipo = (tipo: string): string => {
  if (isTransacaoPositiva(tipo)) {
    return 'text-green-600 bg-green-50 border-green-200';
  } else {
    return 'text-red-600 bg-red-50 border-red-200';
  }
};

// Função para criar transação com tipo validado
export const criarTransacaoValidada = async (
  userId: string,
  tipo: TipoTransacaoEnum,
  valor: number,
  descricao: string,
  metadados: Record<string, any> = {}
): Promise<string> => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  const { data, error } = await supabase.rpc('criar_transacao_validada', {
    p_user_id: userId,
    p_tipo: tipo,
    p_valor: valor,
    p_descricao: descricao,
    p_metadados: metadados
  });

  if (error) throw error;
  return data;
};
