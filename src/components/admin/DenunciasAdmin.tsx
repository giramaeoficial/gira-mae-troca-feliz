import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Eye, Clock, CheckCircle, X, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Denuncia {
  id: string;
  item_id: string;
  motivo: string;
  descricao?: string;
  status: 'pendente' | 'analisada' | 'rejeitada' | 'aceita';
  created_at: string;
  updated_at: string;
  data_analise?: string;
  observacoes_admin?: string;
  itens?: {
    titulo: string;
    status: string;
    publicado_por: string;
  };
  denunciante?: {
    nome: string;
    email: string;
  };
  analisada_por_admin?: {
    nome: string;
  };
}

interface DenunciaRaw extends Omit<Denuncia, 'itens' | 'denunciante' | 'analisada_por_admin'> {
  itens: {
    titulo: string;
    status: string;
    publicado_por: string;
  } | null;
  denunciante: {
    nome: string;
    email: string;
  } | null;
  analisada_por_admin: {
    nome: string;
  } | null;
}

const motivosLabels = {
  produto_inadequado: 'Produto inadequado ou perigoso',
  preco_abusivo: 'Preço abusivo',
  descricao_enganosa: 'Descrição enganosa',
  fotos_inadequadas: 'Fotos inadequadas',
  spam: 'Spam ou repetição excessiva',
  conteudo_ofensivo: 'Conteúdo ofensivo',
  outro: 'Outro motivo'
};

const statusLabels = {
  pendente: 'Pendente',
  analisada: 'Analisada',
  rejeitada: 'Rejeitada',
  aceita: 'Aceita'
};

const statusColors = {
  pendente: 'bg-yellow-100 text-yellow-800',
  analisada: 'bg-blue-100 text-blue-800',
  rejeitada: 'bg-red-100 text-red-800',
  aceita: 'bg-green-100 text-green-800'
};

export const DenunciasAdmin: React.FC = () => {
  const [filtroStatus, setFiltroStatus] = useState<string>('todas');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar denúncias
  const { data: denuncias = [], isLoading } = useQuery({
    queryKey: ['denuncias-admin', filtroStatus],
    queryFn: async () => {
      let query = supabase
        .from('denuncias')
        .select(`
          *,
          itens:item_id!inner (titulo, status, publicado_por),
          denunciante:denunciante_id!inner (nome, email),
          analisada_por_admin:analisada_por (nome)
        `)
        .order('created_at', { ascending: false });

      if (filtroStatus !== 'todas') {
        query = query.eq('status', filtroStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []) as any[];
    }
  });

  // Estatísticas
  const estatisticas = {
    total: denuncias.length,
    pendentes: denuncias.filter(d => d.status === 'pendente').length,
    analisadas: denuncias.filter(d => d.status === 'analisada').length,
    rejeitadas: denuncias.filter(d => d.status === 'rejeitada').length,
    aceitas: denuncias.filter(d => d.status === 'aceita').length
  };

  // Atualizar status da denúncia
  const atualizarStatus = useMutation({
    mutationFn: async ({ id, status, observacoes }: { 
      id: string; 
      status: string; 
      observacoes?: string 
    }) => {
      const { error } = await supabase
        .from('denuncias')
        .update({
          status,
          data_analise: new Date().toISOString(),
          analisada_por: (await supabase.auth.getUser()).data.user?.id,
          observacoes_admin: observacoes
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['denuncias-admin'] });
      toast({
        title: "Status atualizado",
        description: "A denúncia foi atualizada com sucesso."
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a denúncia.",
        variant: "destructive"
      });
    }
  });

  const DenunciaCard: React.FC<{ denuncia: Denuncia }> = ({ denuncia }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <CardTitle className="text-lg">
              {motivosLabels[denuncia.motivo as keyof typeof motivosLabels] || denuncia.motivo}
            </CardTitle>
          </div>
          <Badge className={statusColors[denuncia.status]}>
            {statusLabels[denuncia.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Item denunciado */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Item denunciado:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/detalhes/${denuncia.item_id}`, '_blank')}
              className="h-7 px-2 text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Ver
            </Button>
          </div>
          <p className="text-sm font-medium">{denuncia.itens?.titulo}</p>
          <p className="text-xs text-gray-600 mt-1">
            Status do item: {denuncia.itens?.status}
          </p>
        </div>

        {/* Descrição */}
        {denuncia.descricao && (
          <div>
            <span className="text-sm font-medium text-gray-700">Descrição:</span>
            <p className="text-sm text-gray-600 mt-1">{denuncia.descricao}</p>
          </div>
        )}

        {/* Informações */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Denunciante:</span>
            <p className="text-gray-600">
              {denuncia.denunciante?.nome} ({denuncia.denunciante?.email})
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Data:</span>
            <p className="text-gray-600">
              {format(new Date(denuncia.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </p>
          </div>
        </div>

        {/* Observações admin */}
        {denuncia.observacoes_admin && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <span className="text-sm font-medium text-blue-700">Observações da análise:</span>
            <p className="text-sm text-blue-600 mt-1">{denuncia.observacoes_admin}</p>
            {denuncia.analisada_por_admin?.nome && (
              <p className="text-xs text-blue-500 mt-2">
                Analisada por: {denuncia.analisada_por_admin.nome}
              </p>
            )}
          </div>
        )}

        {/* Ações (apenas para pendentes) */}
        {denuncia.status === 'pendente' && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={() => atualizarStatus.mutate({ 
                id: denuncia.id, 
                status: 'analisada',
                observacoes: 'Denúncia analisada - sem ação necessária'
              })}
              disabled={atualizarStatus.isPending}
              className="flex-1 sm:flex-none"
            >
              <Eye className="w-4 h-4 mr-1" />
              Marcar como Analisada
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => atualizarStatus.mutate({ 
                id: denuncia.id, 
                status: 'rejeitada',
                observacoes: 'Denúncia rejeitada - não procede'
              })}
              disabled={atualizarStatus.isPending}
              className="flex-1 sm:flex-none text-red-600 border-red-300 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-1" />
              Rejeitar
            </Button>
            <Button
              size="sm"
              onClick={() => atualizarStatus.mutate({ 
                id: denuncia.id, 
                status: 'aceita',
                observacoes: 'Denúncia procedente - ação tomada'
              })}
              disabled={atualizarStatus.isPending}
              className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Aceitar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{estatisticas.total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{estatisticas.pendentes}</div>
            <div className="text-sm text-gray-500">Pendentes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{estatisticas.rejeitadas}</div>
            <div className="text-sm text-gray-500">Rejeitadas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{estatisticas.aceitas}</div>
            <div className="text-sm text-gray-500">Aceitas</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Tabs value={filtroStatus} onValueChange={setFiltroStatus}>
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5">
          <TabsTrigger value="todas" className="text-xs sm:text-sm">Todas</TabsTrigger>
          <TabsTrigger value="pendente" className="text-xs sm:text-sm">Pendentes</TabsTrigger>
          <TabsTrigger value="analisada" className="text-xs sm:text-sm">Analisadas</TabsTrigger>
          <TabsTrigger value="rejeitada" className="text-xs sm:text-sm">Rejeitadas</TabsTrigger>
          <TabsTrigger value="aceita" className="text-xs sm:text-sm">Aceitas</TabsTrigger>
        </TabsList>

        <TabsContent value={filtroStatus} className="mt-6">
          {denuncias.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma denúncia encontrada
                </h3>
                <p className="text-gray-500">
                  {filtroStatus === 'todas' 
                    ? 'Não há denúncias no sistema.'
                    : `Não há denúncias com status "${statusLabels[filtroStatus as keyof typeof statusLabels]}".`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {denuncias.map((denuncia) => (
                <DenunciaCard key={denuncia.id} denuncia={denuncia} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};