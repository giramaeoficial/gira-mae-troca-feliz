
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, Coins, DollarSign, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePrecoManual } from "@/hooks/usePrecoManual";

const MetricsOverview = () => {
  const { precoManual } = usePrecoManual();

  // Query para estatísticas reais
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { count: totalTransactions },
        { data: comprasGirinhas },
        { data: totalQueimas }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('transacoes').select('*', { count: 'exact', head: true }),
        supabase.from('transacoes').select('valor, valor_real').eq('tipo', 'compra'),
        supabase.from('queimas_girinhas').select('quantidade')
      ]);

      const totalArrecadado = comprasGirinhas?.reduce((sum, compra) => sum + Number(compra.valor_real || 0), 0) || 0;
      const girinhasEmitidas = comprasGirinhas?.reduce((sum, compra) => sum + Number(compra.valor), 0) || 0;
      const girinhasQueimadas = totalQueimas?.reduce((sum, q) => sum + Number(q.quantidade), 0) || 0;
      const girinhasCirculacao = girinhasEmitidas - girinhasQueimadas;

      return {
        totalUsers: totalUsers || 0,
        totalTransactions: totalTransactions || 0,
        totalArrecadado,
        girinhasEmitidas,
        girinhasQueimadas,
        girinhasCirculacao
      };
    },
    refetchInterval: 30000,
  });

  const metrics = [
    {
      title: "Preço Manual Atual",
      value: `R$ ${precoManual.toFixed(2)}`,
      change: "Fixo",
      trend: "neutral",
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
      title: "Transações Totais",
      value: stats?.totalTransactions?.toLocaleString() || "0",
      change: "+15.3%",
      trend: "up",
      icon: Activity,
      description: "Todas as transações"
    },
    {
      title: "Total Arrecadado",
      value: `R$ ${stats?.totalArrecadado?.toLocaleString(undefined, {minimumFractionDigits: 2}) || '0.00'}`,
      change: "+15.7%",
      trend: "up",
      icon: TrendingUp,
      description: "Receita da emissão"
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
                  variant={metric.trend === "up" ? "default" : metric.trend === "down" ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {metric.trend === "up" ? "↗" : metric.trend === "down" ? "↘" : "•"} {metric.change}
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
