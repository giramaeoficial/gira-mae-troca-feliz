
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRecompensas } from '@/components/recompensas/ProviderRecompensas';
import { useConfiguracoesBonus } from '@/hooks/useConfiguracoesBonus';
import { TipoTransacaoEnum } from '@/types/transacao.types';

interface Bonificacao {
  id: string;
  tipo: 'troca_concluida' | 'avaliacao' | 'indicacao' | 'meta_conquistada' | 'cadastro';
  valor: number;
  descricao: string;
  processada: boolean;
  created_at: string;
}

export const useBonificacoes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { mostrarRecompensa } = useRecompensas();
  const { obterValorBonus } = useConfiguracoesBonus();
  const [bonificacoesPendentes, setBonificacoesPendentes] = useState<Bonificacao[]>([]);
  const [loading, setLoading] = useState(false);

  // Função para processar bônus de troca concluída
  const processarBonusTrocaConcluida = async (reservaId: string) => {
    if (!user) return;

    try {
      // Verificar se a reserva foi confirmada
      const { data: reserva, error: reservaError } = await supabase
        .from('reservas')
        .select('*')
        .eq('id', reservaId)
        .single();

      if (reservaError || !reserva) return;

      if (reserva.status === 'confirmada') {
        // Verificar se já foi processado
        const { data: transacaoExistente } = await supabase
          .from('transacoes')
          .select('id')
          .eq('user_id', user.id)
          .eq('item_id', reserva.item_id)
          .eq('tipo', 'bonus_troca_concluida' as TipoTransacaoEnum)
          .eq('descricao', 'Bônus por troca concluída');

        if (!transacaoExistente || transacaoExistente.length === 0) {
          // Obter valor parametrizado
          const valorBonus = obterValorBonus('bonus_troca_concluida');
          
          if (valorBonus > 0) {
            // ✅ CORREÇÃO: Usar função validada
            const transacaoId = await supabase.rpc('criar_transacao_validada', {
              p_user_id: user.id,
              p_tipo: 'bonus_troca_concluida' as TipoTransacaoEnum,
              p_valor: valorBonus,
              p_descricao: 'Bônus por troca concluída',
              p_metadados: {
                item_id: reserva.item_id,
                reserva_id: reservaId,
                tipo_bonus: 'troca_concluida'
              }
            });

            if (transacaoId) {
              // Mostrar notificação visual
              mostrarRecompensa({
                tipo: 'troca',
                valor: valorBonus,
                descricao: 'Troca concluída com sucesso! Continue trocando para ganhar mais.'
              });

              // Toast de backup
              toast({
                title: "🎉 Troca concluída!",
                description: `Você ganhou ${valorBonus} Girinha${valorBonus > 1 ? 's' : ''} por completar uma troca!`,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao processar bônus de troca:', error);
    }
  };

  // Função para processar bônus de avaliação
  const processarBonusAvaliacao = async () => {
    if (!user) return;

    try {
      // Verificar avaliações feitas hoje que ainda não foram bonificadas
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      const { data: avaliacoes, error } = await supabase
        .from('avaliacoes')
        .select('id, created_at')
        .eq('avaliador_id', user.id)
        .gte('created_at', hoje.toISOString());

      if (error || !avaliacoes) return;

      for (const avaliacao of avaliacoes) {
        // Verificar se já foi bonificado
        const { data: bonusExistente } = await supabase
          .from('transacoes')
          .select('id')
          .eq('user_id', user.id)
          .eq('tipo', 'bonus_avaliacao' as TipoTransacaoEnum)
          .gte('created_at', avaliacao.created_at);

        if (!bonusExistente || bonusExistente.length === 0) {
          const valorBonus = obterValorBonus('bonus_avaliacao');
          
          if (valorBonus > 0) {
            await supabase.rpc('criar_transacao_validada', {
              p_user_id: user.id,
              p_tipo: 'bonus_avaliacao' as TipoTransacaoEnum,
              p_valor: valorBonus,
              p_descricao: 'Bônus por fazer avaliação',
              p_metadados: {
                avaliacao_id: avaliacao.id,
                tipo_bonus: 'avaliacao'
              }
            });

            // Mostrar notificação visual
            mostrarRecompensa({
              tipo: 'avaliacao',
              valor: valorBonus,
              descricao: 'Obrigada por avaliar! Sua opinião ajuda nossa comunidade.'
            });

            // Toast de backup
            toast({
              title: "⭐ Bônus de avaliação!",
              description: `Você ganhou ${valorBonus} Girinha${valorBonus > 1 ? 's' : ''} por avaliar uma troca!`,
            });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao processar bônus de avaliação:', error);
    }
  };

  // Função para processar bônus de indicação
  const processarBonusIndicacao = async (indicadoId: string) => {
    if (!user) return;

    try {
      // Verificar se o usuário indicado completou o perfil
      const { data: perfilIndicado } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', indicadoId)
        .single();

      if (perfilIndicado && perfilIndicado.nome && perfilIndicado.telefone) {
        // Verificar se já foi bonificado
        const { data: bonusExistente } = await supabase
          .from('transacoes')
          .select('id')
          .eq('user_id', user.id)
          .eq('tipo', 'bonus_indicacao_cadastro' as TipoTransacaoEnum)
          .eq('descricao', `Bônus por indicação - ${perfilIndicado.nome}`);

        if (!bonusExistente || bonusExistente.length === 0) {
          const valorBonus = obterValorBonus('indicacao_cadastro');
          
          if (valorBonus > 0) {
            await supabase.rpc('criar_transacao_validada', {
              p_user_id: user.id,
              p_tipo: 'bonus_indicacao_cadastro' as TipoTransacaoEnum,
              p_valor: valorBonus,
              p_descricao: `Bônus por indicação - ${perfilIndicado.nome}`,
              p_metadados: {
                indicado_id: indicadoId,
                tipo_bonus: 'indicacao_cadastro'
              }
            });

            // Mostrar notificação visual
            mostrarRecompensa({
              tipo: 'indicacao',
              valor: valorBonus,
              descricao: `${perfilIndicado.nome} se juntou à comunidade graças a você!`
            });

            // Toast de backup
            toast({
              title: "👥 Bônus de indicação!",
              description: `Você ganhou ${valorBonus} Girinha${valorBonus > 1 ? 's' : ''} por indicar uma nova mãe!`,
            });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao processar bônus de indicação:', error);
    }
  };

  // Função para verificar metas e dar bônus
  const verificarEProcessarMetas = async () => {
    if (!user) return;

    try {
      // Contar trocas confirmadas do usuário
      const { data: trocas, error: trocasError } = await supabase
        .from('reservas')
        .select('id')
        .or(`usuario_reservou.eq.${user.id},usuario_item.eq.${user.id}`)
        .eq('status', 'confirmada');

      if (trocasError || !trocas) return;

      const totalTrocas = trocas.length;

      // Buscar metas não conquistadas
      const { data: metas, error: metasError } = await supabase
        .from('metas_usuarios')
        .select('*')
        .eq('user_id', user.id)
        .eq('conquistado', false)
        .lte('trocas_necessarias', totalTrocas);

      if (metasError || !metas) return;

      for (const meta of metas) {
        // Marcar meta como conquistada
        const { error: updateError } = await supabase
          .from('metas_usuarios')
          .update({
            conquistado: true,
            data_conquista: new Date().toISOString(),
            trocas_realizadas: totalTrocas
          })
          .eq('id', meta.id);

        if (!updateError) {
          // ✅ CORREÇÃO: Usar tipo específico da meta
          let tipoMeta: TipoTransacaoEnum;
          switch (meta.tipo_meta) {
            case 'bronze':
              tipoMeta = 'bonus_meta_bronze';
              break;
            case 'prata':
              tipoMeta = 'bonus_meta_prata';
              break;
            case 'ouro':
              tipoMeta = 'bonus_meta_ouro';
              break;
            case 'diamante':
              tipoMeta = 'bonus_meta_diamante';
              break;
            default:
              tipoMeta = 'bonus_meta_bronze';
          }

          // Dar bônus da meta
          await supabase.rpc('criar_transacao_validada', {
            p_user_id: user.id,
            p_tipo: tipoMeta,
            p_valor: meta.girinhas_bonus,
            p_descricao: `Meta conquistada: ${meta.tipo_meta.toUpperCase()}`,
            p_metadados: {
              meta_id: meta.id,
              tipo_meta: meta.tipo_meta,
              trocas_realizadas: totalTrocas
            }
          });

          // Mostrar notificação visual especial para metas
          mostrarRecompensa({
            tipo: 'meta',
            valor: meta.girinhas_bonus,
            descricao: `Parabéns! Você conquistou o distintivo ${meta.tipo_meta.toUpperCase()}!`,
            meta: meta.tipo_meta
          });

          // Toast de celebração
          toast({
            title: `🏆 Meta ${meta.tipo_meta.toUpperCase()} conquistada!`,
            description: `Incrível! Você ganhou ${meta.girinhas_bonus} Girinhas!`,
          });
        }
      }
    } catch (error) {
      console.error('Erro ao verificar metas:', error);
    }
  };

  // Função para dar bônus de cadastro
  const processarBonusCadastro = async () => {
    if (!user) return;

    try {
      // Verificar se já recebeu bônus de cadastro
      const { data: bonusExistente } = await supabase
        .from('transacoes')
        .select('id')
        .eq('user_id', user.id)
        .eq('tipo', 'bonus_cadastro' as TipoTransacaoEnum)
        .eq('descricao', 'Bônus de boas-vindas');

      if (!bonusExistente || bonusExistente.length === 0) {
        const valorBonus = obterValorBonus('bonus_cadastro');
        
        if (valorBonus > 0) {
          await supabase.rpc('criar_transacao_validada', {
            p_user_id: user.id,
            p_tipo: 'bonus_cadastro' as TipoTransacaoEnum,
            p_valor: valorBonus,
            p_descricao: 'Bônus de boas-vindas',
            p_metadados: {
              tipo_bonus: 'cadastro'
            }
          });

          // Mostrar notificação visual especial de boas-vindas
          mostrarRecompensa({
            tipo: 'cadastro',
            valor: valorBonus,
            descricao: 'Bem-vinda à comunidade GiraMãe! Aqui você faz parte de algo especial.'
          });

          // Toast de boas-vindas
          toast({
            title: "🎁 Bem-vinda ao GiraMãe!",
            description: `Você ganhou ${valorBonus} Girinha${valorBonus > 1 ? 's' : ''} de boas-vindas! Explore e comece a trocar.`,
          });
        }
      }
    } catch (error) {
      console.error('Erro ao processar bônus de cadastro:', error);
    }
  };

  // Verificar bonificações pendentes no carregamento
  useEffect(() => {
    if (user) {
      verificarEProcessarMetas();
    }
  }, [user]);

  return {
    bonificacoesPendentes,
    loading,
    processarBonusTrocaConcluida,
    processarBonusAvaliacao,
    processarBonusIndicacao,
    processarBonusCadastro,
    verificarEProcessarMetas
  };
};
