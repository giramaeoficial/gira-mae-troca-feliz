import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Clock, Coins, TrendingUp, CheckCircle, UserPlus } from 'lucide-react';
import { useGestaoPrograma } from '@/hooks/parcerias/useGestaoPrograma';
import { useValidacoes } from '@/hooks/parcerias/useValidacoes';
import CardMetrica from '@/components/admin/parcerias/shared/CardMetrica';
import LoadingSpinner from '@/components/loading/LoadingSpinner';

export default function GestaoPrograma() {
  const { programaId } = useParams<{ programaId: string }>();
  const navigate = useNavigate();
  
  const { programa, metricas, loading } = useGestaoPrograma(programaId!);
  const { validacoesPendentes, loading: loadingValidacoes } = useValidacoes(programaId!);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!programa) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 text-center">
          <p className="text-lg">Programa não encontrado</p>
          <Button className="mt-4" onClick={() => navigate('/admin/parcerias')}>
            Voltar
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/parcerias')}
            className="w-fit"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{programa.nome}</h1>
              <p className="text-muted-foreground mt-1">
                {programa.parcerias_organizacoes?.nome} • {programa.parcerias_organizacoes?.cidade}/{programa.parcerias_organizacoes?.estado}
              </p>
            </div>
            <Badge variant={programa.ativo ? 'default' : 'secondary'} className="w-fit">
              {programa.ativo ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <CardMetrica
            titulo="Beneficiários"
            valor={metricas?.total_beneficiarios_aprovados || 0}
            icone={Users}
            cor="green"
          />
          <CardMetrica
            titulo="Validações Pendentes"
            valor={metricas?.validacoes_pendentes || 0}
            icone={Clock}
            cor="orange"
          />
          <CardMetrica
            titulo="Créditos Mês"
            valor={metricas?.creditos_mes_atual?.toLocaleString('pt-BR') || '0'}
            icone={Coins}
            cor="yellow"
          />
          <CardMetrica
            titulo="Créditos Total"
            valor={metricas?.creditos_total?.toLocaleString('pt-BR') || '0'}
            icone={TrendingUp}
            cor="blue"
          />
          <CardMetrica
            titulo="Taxa Aprovação"
            valor={`${metricas?.taxa_aprovacao.toFixed(1)}%` || '0%'}
            icone={CheckCircle}
            cor="purple"
          />
          <CardMetrica
            titulo="Novos no Mês"
            valor={metricas?.novos_beneficiarios_mes || 0}
            icone={UserPlus}
            cor="emerald"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="visao-geral" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="validacoes">
              Validações {metricas?.validacoes_pendentes! > 0 && `(${metricas?.validacoes_pendentes})`}
            </TabsTrigger>
            <TabsTrigger value="participantes">Participantes</TabsTrigger>
            <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="visao-geral" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Visão Geral do Programa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Descrição</h4>
                    <p className="text-muted-foreground">{programa.descricao || 'Sem descrição'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Valor do Crédito</h4>
                    <p className="text-muted-foreground">
                      {programa.valor_credito ? `${programa.valor_credito} Girinhas` : 'Não definido'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="validacoes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Validações Pendentes ({validacoesPendentes.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingValidacoes ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : validacoesPendentes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma validação pendente no momento
                  </p>
                ) : (
                  <div className="space-y-3">
                    {validacoesPendentes.map((validacao) => (
                      <Card key={validacao.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{validacao.profiles?.nome}</p>
                              <p className="text-sm text-muted-foreground">{validacao.profiles?.email}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Solicitado em {new Date(validacao.data_solicitacao).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <Badge variant="secondary">Pendente</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="participantes">
            <Card>
              <CardHeader>
                <CardTitle>Participantes Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Em desenvolvimento
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuracoes">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Programa</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Em desenvolvimento
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
