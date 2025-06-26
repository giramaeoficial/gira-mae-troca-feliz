
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIndicacoes } from '@/hooks/useIndicacoes';
import { useConfiguracoesBonus } from '@/hooks/useConfiguracoesBonus';
import { Users, Gift, Share2, Trophy, Check, Clock } from 'lucide-react';

const PaginaIndicacoes = () => {
  const { 
    indicacoes, 
    indicados, 
    loading, 
    compartilharIndicacao,
    obterEstatisticas
  } = useIndicacoes();
  
  const { obterValorBonus } = useConfiguracoesBonus();
  const [estatisticas, setEstatisticas] = useState<any>(null);

  useEffect(() => {
    const carregarEstatisticas = async () => {
      const stats = await obterEstatisticas();
      setEstatisticas(stats);
    };
    carregarEstatisticas();
  }, [indicacoes]);

  const calcularBonusTotal = (indicacao: any) => {
    let total = 0;
    if (indicacao.bonus_cadastro_pago) total += obterValorBonus('indicacao_cadastro');
    if (indicacao.bonus_primeiro_item_pago) total += obterValorBonus('indicacao_primeiro_item');
    if (indicacao.bonus_primeira_compra_pago) total += obterValorBonus('indicacao_primeira_compra');
    return total;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando indicações...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">💫 Sistema de Indicações</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Convide suas amigas para o GiraMãe e ganhe Girinhas quando elas se engajarem!
        </p>
      </div>

      {/* Card de Estatísticas */}
      {estatisticas && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-600" />
              Suas Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{estatisticas.totalIndicacoes}</div>
              <div className="text-sm text-gray-600">Amigas Indicadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">+{estatisticas.totalBonusRecebido}</div>
              <div className="text-sm text-gray-600">Girinhas Ganhas</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card de Compartilhamento */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-purple-600" />
            Compartilhar Indicação
          </CardTitle>
          <CardDescription>
            Compartilhe o GiraMãe e ganhe Girinhas conforme sua amiga se engaja!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold mb-3">🎁 Como funciona:</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-green-500" />
                <span><strong>+{obterValorBonus('indicacao_cadastro')} Girinhas</strong> quando sua amiga completa o cadastro</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-blue-500" />
                <span><strong>+{obterValorBonus('indicacao_primeiro_item')} Girinhas</strong> quando ela publica o primeiro item</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-purple-500" />
                <span><strong>+{obterValorBonus('indicacao_primeira_compra')} Girinhas</strong> quando ela faz a primeira reserva confirmada</span>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={compartilharIndicacao}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            size="lg"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar Link de Indicação
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Minhas Indicações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Minhas Indicações ({indicacoes.length})
            </CardTitle>
            <CardDescription>
              Amigas que você indicou para o GiraMãe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {indicacoes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Você ainda não fez nenhuma indicação
              </p>
            ) : (
              indicacoes.map((indicacao) => (
                <div key={indicacao.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{indicacao.profiles?.nome || 'Amiga indicada'}</p>
                      <p className="text-sm text-gray-500">
                        Indicada em {new Date(indicacao.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      +{calcularBonusTotal(indicacao)} Girinhas
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className={`flex items-center gap-1 ${indicacao.bonus_cadastro_pago ? 'text-green-600' : 'text-gray-400'}`}>
                      {indicacao.bonus_cadastro_pago ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      Cadastro
                    </div>
                    <div className={`flex items-center gap-1 ${indicacao.bonus_primeiro_item_pago ? 'text-green-600' : 'text-gray-400'}`}>
                      {indicacao.bonus_primeiro_item_pago ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      1º Item
                    </div>
                    <div className={`flex items-center gap-1 ${indicacao.bonus_primeira_compra_pago ? 'text-green-600' : 'text-gray-400'}`}>
                      {indicacao.bonus_primeira_compra_pago ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      1ª Reserva
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quem me indicou */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-gold-600" />
              Quem me indicou ({indicados.length})
            </CardTitle>
            <CardDescription>
              Mães que te trouxeram para o GiraMãe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {indicados.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Você chegou aqui por conta própria! 🌟
              </p>
            ) : (
              indicados.map((indicacao) => (
                <div key={indicacao.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{indicacao.profiles?.nome || 'Mãe indicadora'}</p>
                      <p className="text-sm text-gray-500">Te indicou em {new Date(indicacao.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="secondary">
                      Indicadora
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaginaIndicacoes;
