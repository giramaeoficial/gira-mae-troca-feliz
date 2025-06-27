
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Gift, 
  Share2, 
  TrendingUp, 
  Calendar,
  Trophy,
  Copy,
  CheckCircle
} from 'lucide-react';
import { useIndicacoes } from '@/hooks/useIndicacoes';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const PaginaIndicacoes = () => {
  const { 
    indicacoes, 
    indicados, 
    loading, 
    error, 
    compartilharIndicacao,
    obterEstatisticas 
  } = useIndicacoes();

  const [estatisticas, setEstatisticas] = React.useState<any>(null);

  React.useEffect(() => {
    const carregarEstatisticas = async () => {
      const stats = await obterEstatisticas();
      setEstatisticas(stats);
    };
    carregarEstatisticas();
  }, [obterEstatisticas]);

  const handleCompartilhar = async () => {
    try {
      await compartilharIndicacao();
      toast.success('Link de indicação copiado!', {
        description: 'Compartilhe com suas amigas para ganharem bônus juntas!'
      });
    } catch (error) {
      toast.error('Erro ao compartilhar link');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando indicações...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600 text-center">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <Users className="w-16 h-16 text-purple-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema de Indicações</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Indique amigas para o GiraMãe e ganhe bônus quando elas se cadastrarem, 
          publicarem o primeiro item ou fizerem a primeira compra!
        </p>
      </div>

      {/* Estatísticas */}
      {estatisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{estatisticas.totalIndicacoes}</p>
                  <p className="text-gray-600 text-sm">Indicações Feitas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Gift className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{estatisticas.totalBonusRecebido}</p>
                  <p className="text-gray-600 text-sm">Girinhas Ganhas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{estatisticas.bonusCadastro}</p>
                  <p className="text-gray-600 text-sm">Cadastros</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{estatisticas.bonusPrimeiraCompra}</p>
                  <p className="text-gray-600 text-sm">Primeiras Compras</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Compartilhar Link */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-purple-600" />
            Compartilhar Link de Indicação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">
            Compartilhe seu link de indicação e ganhe bônus quando suas amigas se juntarem ao GiraMãe!
          </p>
          <Button onClick={handleCompartilhar} className="w-full md:w-auto">
            <Copy className="w-4 h-4 mr-2" />
            Compartilhar Link
          </Button>
        </CardContent>
      </Card>

      {/* Minhas Indicações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Minhas Indicações ({indicacoes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {indicacoes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Nenhuma indicação ainda</p>
              <p>Compartilhe seu link para começar a indicar amigas!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {indicacoes.map((indicacao) => (
                <div key={indicacao.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={indicacao.profiles?.avatar_url || ''} />
                      <AvatarFallback>
                        {indicacao.profiles?.nome?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{indicacao.profiles?.nome || 'Usuário'}</p>
                      <p className="text-sm text-gray-600">
                        Indicado em {format(new Date(indicacao.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {indicacao.bonus_cadastro_pago && (
                      <Badge variant="default">Cadastro ✓</Badge>
                    )}
                    {indicacao.bonus_primeiro_item_pago && (
                      <Badge variant="secondary">1º Item ✓</Badge>
                    )}
                    {indicacao.bonus_primeira_compra_pago && (
                      <Badge variant="outline">1ª Compra ✓</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quem me indicou */}
      {indicados.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Quem me indicou
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {indicados.map((indicacao) => (
                <div key={indicacao.id} className="flex items-center gap-3 p-4 border rounded-lg">
                  <Avatar>
                    <AvatarImage src={indicacao.profiles?.avatar_url || ''} />
                    <AvatarFallback>
                      {indicacao.profiles?.nome?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{indicacao.profiles?.nome || 'Usuário'}</p>
                    <p className="text-sm text-gray-600">
                      Te indicou em {format(new Date(indicacao.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaginaIndicacoes;
