
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Coins, 
  DollarSign, 
  Activity,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart as RechartsPieChart,
  Cell,
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  Pie
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { usePrecoManual } from "@/hooks/usePrecoManual";

const MetricsOverview = () => {
  const { precoManual } = usePrecoManual();

  // Query para estatísticas básicas
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

  // Query para dados temporais (últimos 30 dias)
  const { data: chartData } = useQuery({
    queryKey: ['admin-chart-data'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: transacoesDiarias } = await supabase
        .from('transacoes')
        .select('created_at, tipo, valor')
        .gte('created_at', thirtyDaysAgo.toISOString());

      const { data: usuariosDiarios } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Agrupar por dia
      const diasData = {};
      for (let i = 0; i < 30; i++) {
        const data = new Date();
        data.setDate(data.getDate() - i);
        const dateKey = data.toISOString().split('T')[0];
        diasData[dateKey] = {
          date: dateKey,
          usuarios: 0,
          transacoes: 0,
          volume: 0,
          compras: 0,
          queimas: 0
        };
      }

      transacoesDiarias?.forEach(transacao => {
        const dateKey = transacao.created_at.split('T')[0];
        if (diasData[dateKey]) {
          diasData[dateKey].transacoes += 1;
          diasData[dateKey].volume += Number(transacao.valor);
          if (transacao.tipo === 'compra') {
            diasData[dateKey].compras += Number(transacao.valor);
          }
          // Note: 'queima' é registrado na tabela queimas_girinhas, não em transacoes
        }
      });

      usuariosDiarios?.forEach(usuario => {
        const dateKey = usuario.created_at.split('T')[0];
        if (diasData[dateKey]) {
          diasData[dateKey].usuarios += 1;
        }
      });

      return Object.values(diasData).reverse();
    },
    refetchInterval: 60000,
  });

  // Query para distribuição de tipos de transação
  const { data: transactionTypes } = useQuery({
    queryKey: ['transaction-types'],
    queryFn: async () => {
      const { data } = await supabase
        .from('transacoes')
        .select('tipo, valor');

      const tipos: Record<string, { count: number; volume: number }> = {};
      data?.forEach(transacao => {
        if (!tipos[transacao.tipo]) {
          tipos[transacao.tipo] = { count: 0, volume: 0 };
        }
        tipos[transacao.tipo].count += 1;
        tipos[transacao.tipo].volume += Number(transacao.valor);
      });

      return Object.entries(tipos).map(([tipo, tipoData]) => ({
        name: tipo,
        value: tipoData.count,
        volume: tipoData.volume
      }));
    },
    refetchInterval: 60000,
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
      title: "Total Arrecadado",
      value: `R$ ${stats?.totalArrecadado?.toLocaleString(undefined, {minimumFractionDigits: 2}) || '0.00'}`,
      change: "+15.7%",
      trend: "up",
      icon: TrendingUp,
      description: "Receita da emissão"
    }
  ];

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <Card key={metric.title}>
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

      {/* Gráficos */}
      <Tabs defaultValue="volume" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="volume" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Volume
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="gap-2">
            <LineChart className="h-4 w-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="tipos" className="gap-2">
            <PieChart className="h-4 w-4" />
            Tipos
          </TabsTrigger>
          <TabsTrigger value="saude" className="gap-2">
            <Activity className="h-4 w-4" />
            Saúde
          </TabsTrigger>
        </TabsList>

        <TabsContent value="volume" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Volume de Transações (30 dias)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                      formatter={(value, name) => [value, name === 'volume' ? 'Volume' : name]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="volume" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Compras vs Queimas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                    />
                    <Bar dataKey="compras" fill="hsl(var(--chart-1))" name="Compras" />
                    <Bar dataKey="queimas" fill="hsl(var(--chart-2))" name="Queimas" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usuarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Novos Usuários e Transações Diárias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsLineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="usuarios" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={2}
                    name="Novos Usuários"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="transacoes" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2}
                    name="Transações"
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tipos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Distribuição por Tipo de Transação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsPieChart>
                  <Tooltip 
                    formatter={(value, name) => [value, `${name} (${value} transações)`]}
                  />
                  <Pie
                    data={transactionTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {transactionTypes?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saude" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Taxa de Circulação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats ? ((stats.girinhasCirculacao / stats.girinhasEmitidas) * 100).toFixed(1) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Girinhas ativas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Taxa de Queima</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {stats ? ((stats.girinhasQueimadas / stats.girinhasEmitidas) * 100).toFixed(1) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Do total emitido</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Engajamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats ? (stats.totalTransactions / Math.max(stats.totalUsers, 1)).toFixed(1) : 0}
                </div>
                <p className="text-xs text-muted-foreground">Transações por usuário</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MetricsOverview;
