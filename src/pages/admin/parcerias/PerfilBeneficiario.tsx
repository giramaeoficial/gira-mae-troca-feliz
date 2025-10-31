import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Mail, Phone, Calendar, Coins, TrendingUp } from 'lucide-react';
import { usePerfilBeneficiario } from '@/hooks/parcerias/usePerfilBeneficiario';
import LoadingSpinner from '@/components/loading/LoadingSpinner';

export default function PerfilBeneficiario() {
  const { programaId, userId } = useParams<{ programaId: string; userId: string }>();
  const navigate = useNavigate();
  
  const { perfil, loading } = usePerfilBeneficiario(userId!, programaId!);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 text-center">
          <p className="text-lg">Beneficiário não encontrado</p>
          <Button className="mt-4" onClick={() => navigate(`/admin/parcerias/${programaId}`)}>
            Voltar
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/admin/parcerias/${programaId}`)}
          className="w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        {/* Perfil */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={perfil.avatar_url} />
                <AvatarFallback className="text-lg">
                  {perfil.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{perfil.nome}</h2>
                  <Badge variant={perfil.status === 'ativo' ? 'default' : 'destructive'}>
                    {perfil.status}
                  </Badge>
                </div>
                
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {perfil.email}
                  </div>
                  {perfil.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {perfil.telefone}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Aprovado em {new Date(perfil.data_aprovacao).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo Financeiro */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Recebido</p>
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-yellow-500" />
                  <p className="text-2xl font-bold">
                    {perfil.resumo_financeiro.total_creditos_recebidos.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Créditos Mês Atual</p>
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-green-500" />
                  <p className="text-2xl font-bold">
                    {perfil.resumo_financeiro.creditos_mes_atual.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Média Mensal</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <p className="text-2xl font-bold">
                    {perfil.resumo_financeiro.media_mensal.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Saldo Atual</p>
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-purple-500" />
                  <p className="text-2xl font-bold">
                    {perfil.padrao_uso.saldo_atual.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Histórico de Créditos */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Créditos ({perfil.historico_creditos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {perfil.historico_creditos.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum crédito recebido ainda
              </p>
            ) : (
              <div className="space-y-2">
                {perfil.historico_creditos.map((credito) => (
                  <div 
                    key={credito.id}
                    className="flex justify-between items-center p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">
                        {new Date(credito.mes_referencia).toLocaleDateString('pt-BR', { 
                          year: 'numeric', 
                          month: 'long' 
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Creditado em {credito.data_creditacao ? new Date(credito.data_creditacao).toLocaleDateString('pt-BR') : 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        +{credito.valor_creditado.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
