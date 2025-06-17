
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { extractMentions } from '@/utils/mentionUtils';

export const useMentions = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Processar menções em uma mensagem
  const processarMencoes = async (mensagemId: string, conteudo: string) => {
    if (!user) return;

    try {
      const mentions = extractMentions(conteudo);
      
      if (mentions.length === 0) return;

      // Buscar IDs dos usuários mencionados
      const usernames = mentions.map(m => m.username);
      const { data: usuarios, error: usersError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('username', usernames);

      if (usersError) throw usersError;

      // Inserir registros de menções
      const mencoesData = usuarios?.map(usuario => ({
        mensagem_id: mensagemId,
        usuario_mencionado_id: usuario.id
      })) || [];

      if (mencoesData.length > 0) {
        const { error: mentionsError } = await supabase
          .from('mencoes_mensagens')
          .insert(mencoesData);

        if (mentionsError) throw mentionsError;

        console.log(`Processadas ${mencoesData.length} menções`);
      }
    } catch (error) {
      console.error('Erro ao processar menções:', error);
      toast({
        title: "Erro ao processar menções",
        description: "As menções podem não ter sido registradas corretamente.",
        variant: "destructive",
      });
    }
  };

  // Buscar usuários mencionados por ID
  const buscarUsuariosPorId = async (userIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, username, avatar_url')
        .in('id', userIds);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar usuários mencionados:', error);
      return [];
    }
  };

  return {
    processarMencoes,
    buscarUsuariosPorId
  };
};
