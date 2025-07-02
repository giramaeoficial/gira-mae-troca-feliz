
import { TipoTransacaoEnum } from '@/types/transacao.types';

// ✅ MAPEAMENTO ATUALIZADO para compatibilidade com tipos antigos
export const formatarTipoTransacao = (tipo: string): string => {
  const mapeamento: Record<string, string> = {
    // Créditos
    'compra': 'Compra',
    'bonus_cadastro': 'Bônus de Cadastro',
    'bonus_indicacao_cadastro': 'Indicação - Cadastro',
    'bonus_indicacao_primeiro_item': 'Indicação - Primeiro Item',
    'bonus_indicacao_primeira_compra': 'Indicação - Primeira Compra',
    'bonus_troca_concluida': 'Troca Concluída',
    'bonus_avaliacao': 'Avaliação',
    'bonus_diario': 'Bônus Diário',
    'bonus_meta_bronze': 'Meta Bronze',
    'bonus_meta_prata': 'Meta Prata',
    'bonus_meta_ouro': 'Meta Ouro',
    'bonus_meta_diamante': 'Meta Diamante',
    'missao': 'Missão',
    'recebido_item': 'Recebido',
    'transferencia_p2p_entrada': 'Transferência Recebida',
    'reembolso': 'Reembolso',
    
    // Débitos
    'bloqueio_reserva': 'Bloqueio Reserva',
    'transferencia_p2p_saida': 'Transferência Enviada',
    'taxa_transferencia': 'Taxa Transferência',
    'taxa_extensao_validade': 'Taxa Extensão',
    'taxa_marketplace': 'Taxa Marketplace',
    'queima_expiracao': 'Expiração',
    'queima_administrativa': 'Queima Admin',
    
    // Compatibilidade com tipos antigos (fallback)
    'bonus': 'Bônus',
    'gasto': 'Gasto',
    'taxa': 'Taxa',
    'queima': 'Queima',
    'recebido': 'Recebido',
    'extensao_validade': 'Extensão Validade'
  };

  return mapeamento[tipo] || tipo;
};

// ✅ DEFINIÇÃO ATUALIZADA: Quais tipos ADICIONAM (+) saldo
export const isTransacaoPositiva = (tipo: string): boolean => {
  const tiposPositivos: string[] = [
    'compra',
    'bonus_cadastro',
    'bonus_indicacao_cadastro',
    'bonus_indicacao_primeiro_item',
    'bonus_indicacao_primeira_compra',
    'bonus_troca_concluida',
    'bonus_avaliacao',
    'bonus_diario',
    'bonus_meta_bronze',
    'bonus_meta_prata',
    'bonus_meta_ouro',
    'bonus_meta_diamante',
    'missao',
    'recebido_item',
    'transferencia_p2p_entrada',
    'reembolso',
    
    // Compatibilidade com tipos antigos
    'bonus',
    'recebido'
  ];
  
  return tiposPositivos.includes(tipo);
};

// ✅ CORES baseadas em ADIÇÃO/DEDUÇÃO
export const getCorTipo = (tipo: string): string => {
  if (isTransacaoPositiva(tipo)) {
    return 'text-green-600 bg-green-50 border-green-200';
  } else {
    return 'text-red-600 bg-red-50 border-red-200';
  }
};

// ✅ FUNÇÃO para mapear tipos antigos para novos (compatibilidade)
export const mapearTipoAntigo = (tipoAntigo: string, descricao?: string): TipoTransacaoEnum => {
  // Mapeamentos diretos
  const mapeamentoDireto: Record<string, TipoTransacaoEnum> = {
    'compra': 'compra',
    'missao': 'missao',
    'recebido': 'recebido_item',
    'transferencia_p2p_entrada': 'transferencia_p2p_entrada',
    'transferencia_p2p_saida': 'transferencia_p2p_saida',
    'reembolso': 'reembolso',
    'gasto': 'bloqueio_reserva',
    'extensao_validade': 'taxa_extensao_validade'
  };

  if (mapeamentoDireto[tipoAntigo]) {
    return mapeamentoDireto[tipoAntigo];
  }

  // Mapeamentos baseados em descrição
  if (tipoAntigo === 'bonus' && descricao) {
    const desc = descricao.toLowerCase();
    if (desc.includes('cadastro')) return 'bonus_cadastro';
    if (desc.includes('indicação') && desc.includes('cadastr')) return 'bonus_indicacao_cadastro';
    if (desc.includes('primeiro item')) return 'bonus_indicacao_primeiro_item';
    if (desc.includes('primeira compra')) return 'bonus_indicacao_primeira_compra';
    if (desc.includes('troca')) return 'bonus_troca_concluida';
    if (desc.includes('avaliação')) return 'bonus_avaliacao';
    if (desc.includes('diário')) return 'bonus_diario';
    if (desc.includes('bronze')) return 'bonus_meta_bronze';
    if (desc.includes('prata')) return 'bonus_meta_prata';
    if (desc.includes('ouro')) return 'bonus_meta_ouro';
    if (desc.includes('diamante')) return 'bonus_meta_diamante';
    return 'bonus_cadastro'; // fallback
  }

  if (tipoAntigo === 'taxa' && descricao) {
    const desc = descricao.toLowerCase();
    if (desc.includes('transferência')) return 'taxa_transferencia';
    if (desc.includes('extensão')) return 'taxa_extensao_validade';
    return 'taxa_transferencia'; // fallback
  }

  if (tipoAntigo === 'queima' && descricao) {
    const desc = descricao.toLowerCase();
    if (desc.includes('expiração')) return 'queima_expiracao';
    return 'queima_administrativa';
  }

  // Fallback seguro
  return 'bonus_cadastro';
};

// ✅ FUNÇÃO para criar transação com tipo validado
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
