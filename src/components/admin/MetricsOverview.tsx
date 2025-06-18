
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, Coins, DollarSign, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useGirinhasSystem } from "@/modules/girinhas/hooks/useGirinhasSystem";

const MetricsOverview = () => {
  const { cotacao } = useGirinhasSystem();

  // Query para estatísticas gerais
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { count: totalTransactions },
        { data: totalGirinhas },
        { data: totalQueimas }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('transacoes').select('*', { count: 'exact', head: true }),
        supabase.from('transacoes').select('valor').eq('tipo', 'compra'),
        supabase.from('queimas_girinhas').select('quantidade')
      ]);

      const girinhasEmitidas = totalGirinhas?.reduce((sum, t) => sum + Number(t.valor), 0) || 0;
      const girinhasQueimadas = totalQueimas?.reduce((sum, q) => sum + Number(q.quantidade), 0) || 0;
      const girinhasCirculacao = girinhasEmitidas - girinhasQueimadas;

      return {
        totalUsers: totalUsers || 0,
        totalTransactions: totalTransactions || 0,
        girinhasEmitidas,
        girinhasQueimadas,
        girinhasCirculacao,
        receitaTotal: girinhasEmitidas * (cotacao?.cotacao_atual || 1)
      };
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  const metrics = [
    {
      title: "Preço de Emissão",
      value: `R$ ${cotacao?.cotacao_atual?.toFixed(4) || '1.0000'}`,
      change: "+0.25%",
      trend: "up",
      icon: DollarSign,
      description: "Por Girinha"
    },
    {
      title: "Girinhas em Circulação",
      value: stats?.girinhasCirculacao?.toLocaleString() || "0",
      change: "+12.5%",
      trend: "up", 
      icon: Coins,
      description: "Total ativo"
    },
    {
      title: "Mães Ativas",
      value: stats?.totalUsers?.toLocaleString() || "0",
      change: "+8.2%",
      trend: "up",
      icon: Users,
      description: "Usuárias registradas"
    },
    {
      title: "Volume 24h",
      value: cotacao?.volume_24h?.toLocaleString() || "0",
      change: "-3.1%",
      trend: "down",
      icon: Activity,
      description: "Girinhas negociadas"
    },
    {
      title: "Total Arrecadado",
      value: `R$ ${stats?.receitaTotal?.toLocaleString(undefined, {minimumFractionDigits: 2}) || '0.00'}`,
      change: "+15.7%",
      trend: "up",
      icon: TrendingUp,
      description: "Receita total"
    },
    {
      title: "Girinhas Queimadas",
      value: stats?.girinhasQueimadas?.toLocaleString() || "0",
      change: "+5.4%",
      trend: "up",
      icon: TrendingDown,
      description: "Total deflacionado"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric) => {
        const IconComponent = metric.icon;
        return (
          <Card key={metric.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <IconComponent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant={metric.trend === "up" ? "default" : "destructive"}
                  className="text-xs"
                >
                  {metric.trend === "up" ? "↗" : "↘"} {metric.change}
                </Badge>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MetricsOverview;
