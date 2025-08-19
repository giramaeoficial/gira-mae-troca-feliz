
import React, { useMemo } from 'react';
import Header from "@/components/shared/Header";
import QuickNav from "@/components/shared/QuickNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, History, ShoppingCart, Send, Sparkles, TrendingUp, Calendar, Clock } from "lucide-react";
import { useCarteira } from "@/hooks/useCarteira";
import { useGirinhasExpiracaoSegura } from "@/hooks/useGirinhasExpiracaoSegura";
import CotacaoWidget from "@/modules/girinhas/components/CotacaoWidget";
import TransferenciaP2P from "@/modules/girinhas/components/TransferenciaP2P";
import CompraComImpacto from "@/modules/girinhas/components/CompraComImpacto";
import ValidadeGirinhasSegura from "@/components/carteira/ValidadeGirinhasSegura";
import BonusDiarioWidget from '@/components/carteira/BonusDiarioWidget';
import { useConfigSistema } from "@/hooks/useConfigSistema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";


const Carteira = () => {
  const { carteira, transacoes, loading, saldo, totalRecebido, totalGasto } = useCarteira();
  const { expiracao } = useGirinhasExpiracaoSegura();
  const { taxaTransferencia, taxaTransacao } = useConfigSistema();

  // ✅ Performance: Memoizar cálculos que dependem de transacoes
  const transacoesEsteMes = useMemo(() => 
    transacoes.filter(t => 
      new Date(t.created_at).getMonth() === new Date().getMonth()
    ).length,
    [transacoes]
  );

  const ultimaMovimentacao = useMemo(() => 
    transacoes.length > 0 
      ? format(new Date(transacoes[0].created_at), 'dd/MM/yyyy', { locale: ptBR })
      : 'Nenhuma',
    [transacoes]
  );

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
        <QuickNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 pb-32 md:pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Wallet className="w-8 h-8 text-primary" />
              Minha Carteira
            </h1>
            <p className="text-gray-600">Gerencie suas Girinhas com sistema seguro de extensão de validade</p>
          </div>

          {/* Widget de Bônus Diário - Destacado no topo */}
          <div className="mb-6">
            <BonusDiarioWidget />
          </div>

          {/* Widgets superiores */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Saldo atual com informação de expiração */}
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
                    {saldo.toFixed(2)}
                  </p>
                  <p className="text-gray-600">Girinhas com sistema seguro</p>
                  
                  {/* Informação de expiração no saldo */}
                  {expiracao.total_expirando_7_dias > 0 && (
                    <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700 font-medium flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {expiracao.total_expirando_7_dias.toFixed(2)} expirando em 7 dias
                      </p>
                    </div>
                  )}
                  {expiracao.total_expirando_30_dias > 0 && expiracao.total_expirando_7_dias === 0 && (
                    <div className="mt-3 p-2 bg-yellow-100 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-700 font-medium flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {expiracao.total_expirando_30_dias.toFixed(2)} expirando em 30 dias
                      </p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="text-center p-2 bg-white/50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Ganho</p>
                    <p className="font-bold text-green-600">{totalRecebido.toFixed(2)}</p>
                  </div>
                  <div className="text-center p-2 bg-white/50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Usado</p>
                    <p className="font-bold text-red-600">{totalGasto.toFixed(2)}</p>
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
                    {transacoesEsteMes}
                  </p>
                </div>
                <div className="bg-white/60 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Última movimentação</p>
                  <p className="font-bold text-gray-800">
                    {ultimaMovimentacao}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs principais */}
          <Tabs defaultValue="historico" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="historico" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Histórico
              </TabsTrigger>
              <TabsTrigger value="validades" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Validades
              </TabsTrigger>
              <TabsTrigger value="comprar" className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Comprar
              </TabsTrigger>
              <TabsTrigger value="transferir" className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Transferir ({taxaTransferencia}%)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="historico">
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
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
                            <div className={`px-2 py-1 rounded-full text-xs font-medium border ${
                              transacao.config?.sinal === 1
                                ? 'text-green-600 bg-green-50 border-green-200'
                                : 'text-red-600 bg-red-50 border-red-200'
                            }`}>
                              {transacao.config?.descricao_pt || transacao.descricao || transacao.tipo}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{transacao.descricao}</p>
                              <p className="text-sm text-gray-500">
                                {format(new Date(transacao.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                              </p>
                              {/* Mostrar data de expiração para compras */}
                              {transacao.tipo === 'compra' && transacao.data_expiracao && (
                                <p className="text-xs text-blue-600 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Expira em: {format(new Date(transacao.data_expiracao), 'dd/MM/yyyy', { locale: ptBR })}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${
                              transacao.config?.sinal === 1
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }`}>
                              {transacao.config?.sinal === 1 ? '+' : '-'}
                              {Number(transacao.valor).toFixed(2)}
                            </p>
                            {transacao.cotacao_utilizada && (
                              <p className="text-xs text-gray-500">
                                Cotação: R$ {Number(transacao.cotacao_utilizada).toFixed(2)}
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

            <TabsContent value="validades">
              <ValidadeGirinhasSegura />
            </TabsContent>

            <TabsContent value="comprar">
              <CompraComImpacto />
            </TabsContent>

            <TabsContent value="transferir">
              <div className="space-y-4">
                {/* Info sobre taxas atuais */}
                <Card className="border-0 shadow-lg bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Send className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Informações das Taxas</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-600">Taxa de Transferência P2P:</span>
                        <span className="font-bold text-blue-800 ml-2">{taxaTransferencia}%</span>
                      </div>
                      <div>
                        <span className="text-blue-600">Taxa de Transação:</span>
                        <span className="font-bold text-blue-800 ml-2">{taxaTransacao}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      * Taxas configuradas pelo sistema para manter a economia equilibrada
                    </p>
                  </CardContent>
                </Card>
                
                <TransferenciaP2P />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <QuickNav />
    </div>
  );
};

export default Carteira;
