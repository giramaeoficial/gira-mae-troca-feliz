
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy, History, TrendingUp, Heart, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/shared/Header";
import PacoteCard from "@/components/girinhas/PacoteCard";
import MetaCard from "@/components/girinhas/MetaCard";
import CompraHistoricoCard from "@/components/girinhas/CompraHistoricoCard";
import PromocaoEspecial from "@/components/girinhas/PromocaoEspecial";
import InfoTaxas from "@/components/girinhas/InfoTaxas";
import BeneficiosGirinhas from "@/components/girinhas/BeneficiosGirinhas";
import EstatisticasPlataforma from "@/components/girinhas/EstatisticasPlataforma";
import { usePacotesGirinhas } from "@/hooks/usePacotesGirinhas";
import { useMetas } from "@/hooks/useMetas";
import { useComprasGirinhas } from "@/hooks/useComprasGirinhas";
import { useCarteira } from "@/hooks/useCarteira";
import { useTrocas } from "@/hooks/useTrocas";

const SistemaGirinhas = () => {
  const { toast } = useToast();
  const [loadingCompra, setLoadingCompra] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("comprar");
  
  const { pacotes, loading: loadingPacotes } = usePacotesGirinhas();
  const { metas, loading: loadingMetas, getProgressoMeta, getProximaMeta, getMetasConquistadas, getTotalBonusRecebido } = useMetas();
  const { compras, loading: loadingCompras, simularCompra } = useComprasGirinhas();
  const { saldo } = useCarteira();
  const { trocas } = useTrocas();

  const trocasConfirmadas = trocas.filter(t => t.status === 'confirmada').length;
  const proximaMeta = getProximaMeta(trocasConfirmadas);
  const metasConquistadas = getMetasConquistadas();

  const handleComprarPacote = async (pacoteId: string) => {
    setLoadingCompra(pacoteId);
    
    try {
      const sucesso = await simularCompra(pacoteId);
      
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
    } finally {
      setLoadingCompra(null);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
      <Header activePage="sistema-girinhas" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-600 bg-clip-text text-transparent">
            <Sparkles className="h-10 w-10 text-yellow-500 animate-spin" />
            Sistema de Girinhas
            <Heart className="h-8 w-8 text-pink-500 animate-pulse" />
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            💖 A moeda do carinho que conecta mães! Troque itens, ganhe bônus e faça parte da maior comunidade de mães do Brasil!
          </p>
          <div className="flex items-center justify-center gap-4 text-lg">
            <div className="bg-green-100 px-4 py-2 rounded-full">
              <span className="text-green-700 font-semibold">✅ 100% Seguro</span>
            </div>
            <div className="bg-blue-100 px-4 py-2 rounded-full">
              <span className="text-blue-700 font-semibold">🎁 Bônus Frequentes</span>
            </div>
            <div className="bg-purple-100 px-4 py-2 rounded-full">
              <span className="text-purple-700 font-semibold">🏆 Sistema de Metas</span>
            </div>
          </div>
        </div>

        {/* Benefícios e Estatísticas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <BeneficiosGirinhas />
          <EstatisticasPlataforma />
        </div>

        {/* Promoções Especiais */}
        <PromocaoEspecial />

        {/* Resumo da Carteira */}
        <Card className="mb-8 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 border-purple-300 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-purple-700">
              <TrendingUp className="h-6 w-6" />
              💼 Sua Carteira GiraMãe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center bg-white/60 p-6 rounded-xl">
                <div className="text-4xl font-bold text-primary mb-2 flex items-center justify-center gap-2">
                  <Sparkles className="h-8 w-8 text-yellow-500" />
                  {saldo.toFixed(0)}
                </div>
                <p className="text-lg font-medium text-purple-700">Girinhas Disponíveis</p>
                <p className="text-sm text-purple-600">≈ R$ {saldo.toFixed(2)} em valor</p>
              </div>
              <div className="text-center bg-white/60 p-6 rounded-xl">
                <div className="text-4xl font-bold text-green-600 mb-2 flex items-center justify-center gap-2">
                  <Trophy className="h-8 w-8" />
                  {metasConquistadas.length}
                </div>
                <p className="text-lg font-medium text-green-700">Metas Conquistadas</p>
                <p className="text-sm text-green-600">Continue assim! 🎯</p>
              </div>
              <div className="text-center bg-white/60 p-6 rounded-xl">
                <div className="text-4xl font-bold text-orange-600 mb-2 flex items-center justify-center gap-2">
                  <Gift className="h-8 w-8" />
                  {getTotalBonusRecebido()}
                </div>
                <p className="text-lg font-medium text-orange-700">Bônus Recebidos</p>
                <p className="text-sm text-orange-600">Economia total! 💰</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/60 p-2 rounded-xl shadow-lg">
            <TabsTrigger value="comprar" className="flex items-center gap-2 text-lg py-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Sparkles className="h-5 w-5" />
              Comprar Girinhas
            </TabsTrigger>
            <TabsTrigger value="metas" className="flex items-center gap-2 text-lg py-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
              <Trophy className="h-5 w-5" />
              Metas e Conquistas
            </TabsTrigger>
            <TabsTrigger value="historico" className="flex items-center gap-2 text-lg py-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
              <History className="h-5 w-5" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comprar" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-4 text-purple-700">💎 Escolha seu Pacote de Girinhas</h2>
              <p className="text-lg text-gray-600 mb-4">
                Quanto mais você compra, mais você economiza! Todas as Girinhas têm validade infinita.
              </p>
            </div>
            
            {loadingPacotes ? (
              <div className="text-center text-xl">Carregando pacotes incríveis...</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {pacotes.map((pacote) => (
                    <PacoteCard
                      key={pacote.id}
                      pacote={pacote}
                      onComprar={handleComprarPacote}
                      loading={loadingCompra === pacote.id}
                    />
                  ))}
                </div>
                
                <InfoTaxas />
              </>
            )}
          </TabsContent>

          <TabsContent value="metas" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-4 text-yellow-700">🏆 Suas Conquistas e Metas</h2>
              <p className="text-lg text-gray-600">
                Complete trocas e desbloqueie distintivos especiais com bônus incríveis!
              </p>
            </div>

            {proximaMeta && (
              <Card className="mb-6 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-yellow-700 text-xl flex items-center gap-2">
                    🎯 Próxima Meta
                    <Badge className="bg-yellow-100 text-yellow-800 animate-pulse">
                      Quase lá!
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Trophy className="h-12 w-12 text-yellow-500" />
                    <div>
                      <p className="text-xl font-bold text-yellow-700">
                        Distintivo {proximaMeta.tipo_meta.charAt(0).toUpperCase() + proximaMeta.tipo_meta.slice(1)}
                      </p>
                      <p className="text-yellow-600 text-lg">
                        Faltam apenas {proximaMeta.trocas_necessarias - trocasConfirmadas} trocas para ganhar 
                        <span className="font-bold text-green-600"> +{proximaMeta.girinhas_bonus} Girinhas!</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {loadingMetas ? (
              <div className="text-center text-xl">Carregando suas conquistas...</div>
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
              <h2 className="text-3xl font-bold mb-4 text-blue-700">📊 Histórico de Compras</h2>
              <p className="text-lg text-gray-600">
                Acompanhe todas as suas aquisições de Girinhas.
              </p>
            </div>
            
            {loadingCompras ? (
              <div className="text-center text-xl">Carregando histórico...</div>
            ) : compras.length === 0 ? (
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardContent className="text-center py-12">
                  <History className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-blue-700 mb-2">Primeira vez aqui?</h3>
                  <p className="text-blue-600 mb-6 text-lg">Comece comprando seu primeiro pacote de Girinhas!</p>
                  <Button 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 text-lg" 
                    onClick={() => handleTabChange("comprar")}
                  >
                    🚀 Comprar Girinhas Agora
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
