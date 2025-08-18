import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Organizacao, Programa } from './useParceriasSociais';

interface Validacao {
  id: string;
  status: string;
  dados_usuario: any;
  documentos: any;
  data_solicitacao: string;
  data_validacao?: string;
  motivo_rejeicao?: string;
  total_creditos_recebidos: number;
}

export function useProgramaDetalhes(organizacaoCodigo: string, programaCodigo: string) {
  const [programa, setPrograma] = useState<Programa | null>(null);
  const [organizacao, setOrganizacao] = useState<Organizacao | null>(null);
  const [validacao, setValidacao] = useState<Validacao | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadProgramaDetalhes();
  }, [organizacaoCodigo, programaCodigo, user]);

  const loadProgramaDetalhes = async () => {
    try {
      setLoading(true);

      // Buscar organização
      const { data: orgData, error: orgError } = await supabase
        .from('parcerias_organizacoes')
        .select('*')
        .eq('codigo', organizacaoCodigo)
        .eq('ativo', true)
        .single();

      if (orgError) throw orgError;

      // Buscar programa
      const { data: progData, error: progError } = await supabase
        .from('parcerias_programas')
        .select('*')
        .eq('codigo', programaCodigo)
        .eq('organizacao_id', orgData.id)
        .eq('ativo', true)
        .single();

      if (progError) throw progError;

      setOrganizacao(orgData);
      setPrograma(progData);

      // Se usuário logado, buscar validação
      if (user) {
        const { data: validData } = await supabase
          .from('parcerias_usuarios_validacao')
          .select('*')
          .eq('user_id', user.id)
          .eq('programa_id', progData.id)
          .eq('ativo', true)
          .maybeSingle();

        setValidacao(validData);
      }
    } catch (err: any) {
      toast({
        title: "Erro ao carregar programa",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const solicitarValidacao = async (dadosUsuario: Record<string, string>, documentos: File[]) => {
    if (!user || !programa) return;

    try {
      // Upload dos documentos
      const documentosUpload = await Promise.all(
        documentos.map(async (file) => {
          const fileName = `${user.id}/${programa.id}/${Date.now()}_${file.name}`;
          const { data, error } = await supabase.storage
            .from('documentos-parcerias')
            .upload(fileName, file);
          
          if (error) throw error;
          
          return {
            nome: file.name,
            tipo: file.name.split('.').pop(),
            url: data.path,
            size: file.size
          };
        })
      );

      // Criar validação
      const { error } = await supabase
        .from('parcerias_usuarios_validacao')
        .insert({
          user_id: user.id,
          programa_id: programa.id,
          dados_usuario: dadosUsuario,
          documentos: documentosUpload,
          status: 'pendente'
        });

      if (error) throw error;

      toast({
        title: "Solicitação enviada!",
        description: "Sua solicitação foi enviada para análise."
      });

      await loadProgramaDetalhes();
    } catch (err: any) {
      toast({
        title: "Erro ao enviar solicitação",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  return {
    programa,
    organizacao,
    validacao,
    loading,
    solicitarValidacao,
    refetch: loadProgramaDetalhes
  };
}