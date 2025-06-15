
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy, History, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/shared/Header";
import PacoteCard from "@/components/girinhas/PacoteCard";
import MetaCard from "@/components/girinhas/MetaCard";
import CompraHistoricoCard from "@/components/girinhas/CompraHistoricoCard";
import { usePacotesGirinhas } from "@/hooks/usePacotesGirinhas";
import { useMetas } from "@/hooks/useMetas";
import { useComprasGirinhas } from "@/hooks/useComprasGirinhas";
import { useCarteira } from "@/hooks/useCarteira";
import { useTrocas } from "@/hooks/useTrocas";

const SistemaGirinhas = () => {
  const { toast } = useToast();
  const [loadingCompra, setLoadingCompra] = useState<string | null>(null);
  
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
          title: "Compra realizada! 🎉",
          description: "As Girinhas foram adicionadas à sua carteira.",
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

  return (
    <div className="min-h-screen bg-background">
      <Header activePage="sistema-girinhas" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-yellow-500" />
            Sistema de Girinhas
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ganhe e use Girinhas para trocar itens, conquistar metas e fazer parte da comunidade GiraMãe!
          </p>
        </div>

        {/* Resumo da Carteira */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resumo da Carteira
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{saldo.toFixed(0)}</p>
                <p className="text-sm text-muted-foreground">Girinhas Disponíveis</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{metasConquistadas.length}</p>
                <p className="text-sm text-muted-foreground">Metas Conquistadas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{getTotalBonusRecebido()}</p>
                <p className="text-sm text-muted-foreground">Bônus Recebidos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="comprar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="comprar" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Comprar Girinhas
            </TabsTrigger>
            <TabsTrigger value="metas" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Metas e Conquistas
            </TabsTrigger>
            <TabsTrigger value="historico" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comprar" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Compre Girinhas</h2>
              <p className="text-muted-foreground mb-6">
                Escolha o pacote ideal para você e tenha Girinhas para trocar itens incríveis!
              </p>
              
              {loadingPacotes ? (
                <div className="text-center">Carregando pacotes...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {pacotes.map((pacote) => (
                    <PacoteCard
                      key={pacote.id}
                      pacote={pacote}
                      onComprar={handleComprarPacote}
                      loading={loadingCompra === pacote.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="metas" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Metas e Conquistas</h2>
              <p className="text-muted-foreground mb-6">
                Complete trocas e ganhe distintivos especiais com bônus de Girinhas!
              </p>

              {proximaMeta && (
                <Card className="mb-6 border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-primary">🎯 Próxima Meta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-medium">
                      Distintivo {proximaMeta.tipo_meta.charAt(0).toUpperCase() + proximaMeta.tipo_meta.slice(1)}
                    </p>
                    <p className="text-muted-foreground">
                      Você está a {proximaMeta.trocas_necessarias - trocasConfirmadas} trocas de conquistar +{proximaMeta.girinhas_bonus} Girinhas!
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {loadingMetas ? (
                <div className="text-center">Carregando metas...</div>
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
            </div>
          </TabsContent>

          <TabsContent value="historico" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Histórico de Compras</h2>
              <p className="text-muted-foreground mb-6">
                Veja todas as suas compras de Girinhas anteriores.
              </p>
              
              {loadingCompras ? (
                <div className="text-center">Carregando histórico...</div>
              ) : compras.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Você ainda não fez nenhuma compra de Girinhas.</p>
                    <Button className="mt-4" onClick={() => document.querySelector('[value="comprar"]')?.click()}>
                      Comprar Girinhas
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
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SistemaGirinhas;
