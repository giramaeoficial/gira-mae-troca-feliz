
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
import { useTiposTransacao } from '@/hooks/useTiposTransacao';
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

  const { obterConfigTipo } = useTiposTransacao();
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

      {/* Como funciona o sistema de indicações */}
      <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border-purple-200 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Gift className="w-6 h-6" />
            Mãe, vem ver que vantagem! 💜
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-6 text-lg">
            Indica uma amiga e vocês duas ganham! É como aquele "ganha-ganha" que a gente adora 😍
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Para você que indica */}
            <div className="bg-white rounded-lg p-4 border border-purple-100">
              <h3 className="font-semibold text-purple-700 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Para você que indica:
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">👥</div>
                  <div>
                    <p className="font-medium text-gray-800">
                      +{obterConfigTipo('bonus_indicacao_cadastro')?.valor_padrao || 10} Girinhas
                    </p>
                    <p className="text-sm text-gray-600">quando ela se cadastrar</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">📦</div>
                  <div>
                    <p className="font-medium text-gray-800">
                      +{obterConfigTipo('bonus_indicacao_primeiro_item')?.valor_padrao || 10} Girinhas
                    </p>
                    <p className="text-sm text-gray-600">quando ela publicar o primeiro item</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🛍️</div>
                  <div>
                    <p className="font-medium text-gray-800">
                      +{obterConfigTipo('bonus_indicacao_primeira_compra')?.valor_padrao || 30} Girinhas
                    </p>
                    <p className="text-sm text-gray-600">quando ela fizer a primeira compra</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-700">
                  Total possível: até {
                    (parseFloat(String(obterConfigTipo('bonus_indicacao_cadastro')?.valor_padrao || '10')) +
                     parseFloat(String(obterConfigTipo('bonus_indicacao_primeiro_item')?.valor_padrao || '10')) +
                     parseFloat(String(obterConfigTipo('bonus_indicacao_primeira_compra')?.valor_padrao || '30'))).toFixed(0)
                  } Girinhas por amiga! 🎉
                </p>
              </div>
            </div>

            {/* Para sua amiga */}
            <div className="bg-white rounded-lg p-4 border border-pink-100">
              <h3 className="font-semibold text-pink-700 mb-3 flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Para sua amiga:
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🎁</div>
                  <div>
                    <p className="font-medium text-gray-800">
                      +{obterConfigTipo('bonus_indicacao_cadastro_indicado')?.valor_padrao || 25} Girinhas
                    </p>
                    <p className="text-sm text-gray-600">de boas-vindas no cadastro</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💝</div>
                  <div>
                    <p className="font-medium text-gray-800">Entrada VIP</p>
                    <p className="text-sm text-gray-600">direto na comunidade mais querida das mães</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-pink-50 rounded-lg">
                <p className="text-sm font-medium text-pink-700">
                  Ela já começa com {obterConfigTipo('bonus_indicacao_cadastro_indicado')?.valor_padrao || 25} Girinhas! 💖
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-2xl">✨</div>
              <p className="font-semibold text-orange-800">Dica de mãe experiente:</p>
            </div>
            <p className="text-orange-700">
              Quanto mais amigas você indicar, mais Girinhas você ganha! É uma renda extra 
              que vem das suas conexões mesmo. Compartilha nos grupos das mães, no WhatsApp da escola... 
              Todo mundo ganha! 💪
            </p>
          </div>
        </CardContent>
      </Card>

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
