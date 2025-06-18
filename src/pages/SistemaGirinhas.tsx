import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Trophy, History, TrendingUp, Heart, Gift, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/shared/Header";
import PacoteCard from "@/components/girinhas/PacoteCard";
import MetaCard from "@/components/girinhas/MetaCard";
import CompraHistoricoCard from "@/components/girinhas/CompraHistoricoCard";
import { usePacotesGirinhas } from "@/hooks/usePacotesGirinhas";
import { useMetas } from "@/hooks/useMetas";
import { useComprasGirinhas } from "@/hooks/useComprasGirinhas";
import { useCarteira } from "@/contexts/CarteiraContext";
import { useTrocas } from "@/hooks/useTrocas";

const SistemaGirinhas = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("comprar");
  
  const { pacotes, loading: loadingPacotes, comprarGirinhas, isPacoteLoading } = usePacotesGirinhas();
  const { metas, loading: loadingMetas, getProgressoMeta, getProximaMeta, getMetasConquistadas, getTotalBonusRecebido } = useMetas();
  const { compras, loading: loadingCompras } = useComprasGirinhas();
  const { saldo, comprarPacote } = useCarteira(); // ✅ Usando do context centralizado
  const { trocas } = useTrocas();

  const trocasConfirmadas = trocas.filter(t => t.status === 'confirmada').length;
  const proximaMeta = getProximaMeta(trocasConfirmadas);
  const metasConquistadas = getMetasConquistadas();

  const handleComprarPacote = async (pacoteId: string) => {
    try {
      const sucesso = await comprarGirinhas(pacoteId);
      
      if (sucesso) {
        toast({
          title: "🎉 Compra realizada com sucesso!",
          description: "As Girinhas foram adicionadas à sua carteira. Agora você pode fazer trocas incríveis!",
        });
      }
    } catch (error) {
      toast({
        title: "Erro na compra",
        description: "Não foi possível processar a compra. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
      <Header activePage="sistema-girinhas" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section - Simplificado */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-purple-700">
            ✨ Sistema de Girinhas
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            A moeda que conecta mães! Compre Girinhas, faça trocas e ganhe bônus incríveis.
          </p>
        </div>

        {/* Carteira - Destaque Principal */}
        <Card className="mb-8 bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-2xl text-purple-700">
              <Wallet className="h-6 w-6" />
              Sua Carteira
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white/70 p-4 rounded-xl">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {saldo.toFixed(0)} 
                  <Sparkles className="inline h-6 w-6 ml-1 text-yellow-500" />
                </div>
                <p className="text-purple-700 font-medium">Girinhas Disponíveis</p>
                <p className="text-sm text-purple-600">≈ R$ {saldo.toFixed(2)}</p>
              </div>
              
              <div className="bg-white/70 p-4 rounded-xl">
                <div className="text-3xl font-bold text-green-600 mb-2 flex items-center justify-center gap-1">
                  <Trophy className="h-6 w-6" />
                  {metasConquistadas.length}
                </div>
                <p className="text-green-700 font-medium">Metas Conquistadas</p>
                <p className="text-sm text-green-600">Continue assim! 🎯</p>
              </div>
              
              <div className="bg-white/70 p-4 rounded-xl">
                <div className="text-3xl font-bold text-orange-600 mb-2 flex items-center justify-center gap-1">
                  <Gift className="h-6 w-6" />
                  {getTotalBonusRecebido()}
                </div>
                <p className="text-orange-700 font-medium">Bônus Recebidos</p>
                <p className="text-sm text-orange-600">Economia total! 💰</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefícios Resumidos */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <Heart className="h-8 w-8 text-pink-500 mx-auto mb-2" />
                <p className="font-semibold text-gray-800">Trocas Justas</p>
                <p className="text-sm text-gray-600">1 Girinha = R$ 1,00</p>
              </div>
              <div>
                <Gift className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <p className="font-semibold text-gray-800">5 Girinhas GRÁTIS</p>
                <p className="text-sm text-gray-600">Ao se cadastrar</p>
              </div>
              <div>
                <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="font-semibold text-gray-800">Metas e Bônus</p>
                <p className="text-sm text-gray-600">Complete desafios</p>
              </div>
              <div>
                <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="font-semibold text-gray-800">Mais Economia</p>
                <p className="text-sm text-gray-600">Até 15% de desconto</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 p-2 rounded-xl shadow-md">
            <TabsTrigger value="comprar" className="flex items-center gap-2 py-3 rounded-lg">
              <Sparkles className="h-4 w-4" />
              Comprar Girinhas
            </TabsTrigger>
            <TabsTrigger value="metas" className="flex items-center gap-2 py-3 rounded-lg">
              <Trophy className="h-4 w-4" />
              Metas e Conquistas
            </TabsTrigger>
            <TabsTrigger value="historico" className="flex items-center gap-2 py-3 rounded-lg">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comprar" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2 text-purple-700">💎 Pacotes de Girinhas</h2>
              <p className="text-gray-600">
                Quanto mais você compra, mais você economiza!
              </p>
            </div>
            
            {loadingPacotes ? (
              <div className="text-center text-xl">Carregando pacotes...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {pacotes.map((pacote) => (
                  <PacoteCard
                    key={pacote.id}
                    pacote={pacote}
                    onComprar={handleComprarPacote}
                    isLoading={isPacoteLoading(pacote.id)}
                  />
                ))}
              </div>
            )}

            {/* Info sobre taxas simplificada */}
            <Card className="bg-blue-50 border-blue-200 mt-6">
              <CardContent className="py-4">
                <div className="text-center">
                  <p className="text-blue-700 font-medium mb-2">
                    💡 Taxa de 5% sobre trocas (em reais)
                  </p>
                  <p className="text-sm text-blue-600">
                    Exemplo: Item de 20 Girinhas = Taxa de R$ 1,00
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metas" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2 text-yellow-700">🏆 Suas Conquistas</h2>
              <p className="text-gray-600">
                Complete trocas e desbloqueie distintivos especiais!
              </p>
            </div>

            {proximaMeta && (
              <Card className="mb-6 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50">
                <CardHeader>
                  <CardTitle className="text-yellow-700 flex items-center gap-2">
                    🎯 Próxima Meta
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Quase lá!
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Trophy className="h-10 w-10 text-yellow-500" />
                    <div>
                      <p className="text-lg font-bold text-yellow-700">
                        Distintivo {proximaMeta.tipo_meta.charAt(0).toUpperCase() + proximaMeta.tipo_meta.slice(1)}
                      </p>
                      <p className="text-yellow-600">
                        Faltam apenas {proximaMeta.trocas_necessarias - trocasConfirmadas} trocas para ganhar 
                        <span className="font-bold text-green-600"> +{proximaMeta.girinhas_bonus} Girinhas!</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {loadingMetas ? (
              <div className="text-center text-xl">Carregando conquistas...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {metas.map((meta) => (
                  <MetaCard
                    key={meta.id}
                    meta={meta}
                    trocasRealizadas={trocasConfirmadas}
                    progresso={getProgressoMeta(meta, trocasConfirmadas)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="historico" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2 text-blue-700">📊 Histórico de Compras</h2>
              <p className="text-gray-600">
                Acompanhe suas aquisições de Girinhas.
              </p>
            </div>
            
            {loadingCompras ? (
              <div className="text-center text-xl">Carregando histórico...</div>
            ) : compras.length === 0 ? (
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardContent className="text-center py-12">
                  <History className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-blue-700 mb-2">Primeira vez aqui?</h3>
                  <p className="text-blue-600 mb-6">Comece comprando seu primeiro pacote de Girinhas!</p>
                  <Button 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-2" 
                    onClick={() => handleTabChange("comprar")}
                  >
                    🚀 Comprar Girinhas
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {compras.map((compra) => (
                  <CompraHistoricoCard key={compra.id} compra={compra} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SistemaGirinhas;
