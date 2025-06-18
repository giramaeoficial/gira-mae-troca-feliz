
import Header from "@/components/shared/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, History, ShoppingCart, Send, Sparkles, TrendingUp } from "lucide-react";
import { useCarteira } from "@/hooks/useCarteira";
import CotacaoWidget from "@/modules/girinhas/components/CotacaoWidget";
import TransferenciaP2P from "@/modules/girinhas/components/TransferenciaP2P";
import CompraComImpacto from "@/modules/girinhas/components/CompraComImpacto";

const Carteira = () => {
  const { carteira, transacoes, loading, saldo, totalRecebido, totalGasto } = useCarteira();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando carteira...</p>
          </div>
        </main>
      </div>
    );
  }

  const formatarTipoTransacao = (tipo: string) => {
    const tipos = {
      'recebido': 'Recebido',
      'gasto': 'Gasto',
      'bonus': 'Bônus',
      'compra': 'Compra',
      'queima': 'Queima',
      'transferencia_p2p_saida': 'Transferência Enviada',
      'transferencia_p2p_entrada': 'Transferência Recebida',
      'taxa': 'Taxa'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  const getCorTipo = (tipo: string) => {
    if (['recebido', 'bonus', 'transferencia_p2p_entrada'].includes(tipo)) {
      return 'text-green-600 bg-green-50';
    }
    if (['gasto', 'queima', 'transferencia_p2p_saida', 'taxa'].includes(tipo)) {
      return 'text-red-600 bg-red-50';
    }
    return 'text-blue-600 bg-blue-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Wallet className="w-8 h-8 text-primary" />
              Minha Carteira
            </h1>
            <p className="text-gray-600">Gerencie suas Girinhas, veja cotações e faça transferências</p>
          </div>

          {/* Widgets superiores */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Saldo atual */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/10 to-purple-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Saldo Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary mb-2">
                    {saldo}
                  </p>
                  <p className="text-gray-600">Girinhas disponíveis</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="text-center p-2 bg-white/50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Recebido</p>
                    <p className="font-bold text-green-600">{totalRecebido}</p>
                  </div>
                  <div className="text-center p-2 bg-white/50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Gasto</p>
                    <p className="font-bold text-red-600">{totalGasto}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Widget de cotação */}
            <CotacaoWidget />

            {/* Estatísticas rápidas */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-white/60 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Transações este mês</p>
                  <p className="font-bold text-gray-800">
                    {transacoes.filter(t => 
                      new Date(t.created_at).getMonth() === new Date().getMonth()
                    ).length}
                  </p>
                </div>
                <div className="bg-white/60 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Última movimentação</p>
                  <p className="font-bold text-gray-800">
                    {transacoes.length > 0 
                      ? new Date(transacoes[0].created_at).toLocaleDateString('pt-BR')
                      : 'Nenhuma'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs principais */}
          <Tabs defaultValue="historico" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="historico" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Histórico
              </TabsTrigger>
              <TabsTrigger value="comprar" className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Comprar
              </TabsTrigger>
              <TabsTrigger value="transferir" className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Transferir
              </TabsTrigger>
            </TabsList>

            <TabsContent value="historico">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Histórico de Transações</CardTitle>
                </CardHeader>
                <CardContent>
                  {transacoes.length === 0 ? (
                    <div className="text-center py-8">
                      <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhuma transação encontrada</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {transacoes.map((transacao) => (
                        <div
                          key={transacao.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getCorTipo(transacao.tipo)}`}>
                              {formatarTipoTransacao(transacao.tipo)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{transacao.descricao}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(transacao.created_at).toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${
                              ['recebido', 'bonus', 'transferencia_p2p_entrada'].includes(transacao.tipo)
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }`}>
                              {['recebido', 'bonus', 'transferencia_p2p_entrada'].includes(transacao.tipo) ? '+' : '-'}
                              {Number(transacao.valor).toFixed(2)}
                            </p>
                            {transacao.cotacao_utilizada && (
                              <p className="text-xs text-gray-500">
                                Cotação: R$ {Number(transacao.cotacao_utilizada).toFixed(4)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comprar">
              <CompraComImpacto />
            </TabsContent>

            <TabsContent value="transferir">
              <TransferenciaP2P />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Carteira;
