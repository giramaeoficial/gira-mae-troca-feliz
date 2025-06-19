
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const EmissionChart = () => {
  // Query para dados de emissão de Girinhas
  const { data: emissionData } = useQuery({
    queryKey: ['admin-emission-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compras_girinhas')
        .select('created_at, girinhas_recebidas, valor_pago')
        .eq('status', 'aprovado')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const groupedData = data?.reduce((acc, compra) => {
        const date = format(new Date(compra.created_at), 'yyyy-MM-dd');
        
        if (!acc[date]) {
          acc[date] = {
            data: format(new Date(compra.created_at), 'dd/MM', { locale: ptBR }),
            girinhasEmitidas: 0,
            valorArrecadado: 0
          };
        }
        
        acc[date].girinhasEmitidas += compra.girinhas_recebidas;
        acc[date].valorArrecadado += Number(compra.valor_pago);
        
        return acc;
      }, {} as Record<string, any>);

      return Object.values(groupedData || {}).slice(-30);
    }
  });

  // Query para proporção Girinhas/Mães
  const { data: proportionData } = useQuery({
    queryKey: ['admin-girinhas-maes-proportion'],
    queryFn: async () => {
      const [
        { data: compras },
        { count: totalMaes }
      ] = await Promise.all([
        supabase.from('compras_girinhas').select('girinhas_recebidas').eq('status', 'aprovado'),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
      ]);

      const totalGirinhas = compras?.reduce((sum, c) => sum + c.girinhas_recebidas, 0) || 0;
      const proporacao = totalMaes ? (totalGirinhas / totalMaes).toFixed(2) : '0.00';

      return {
        totalGirinhas,
        totalMaes: totalMaes || 0,
        proporacao: Number(proporacao)
      };
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Emissão de Girinhas (Admin)</CardTitle>
          <CardDescription>
            Histórico de emissão e arrecadação nos últimos 30 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emissionData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="data" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'girinhasEmitidas' ? `${value} Girinhas` : `R$ ${Number(value).toFixed(2)}`,
                    name === 'girinhasEmitidas' ? 'Girinhas Emitidas' : 'Valor Arrecadado'
                  ]}
                  labelFormatter={(label) => `Data: ${label}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="girinhasEmitidas" 
                  fill="#3b82f6" 
                  name="girinhasEmitidas"
                />
                <Bar 
                  dataKey="valorArrecadado" 
                  fill="#10b981" 
                  name="valorArrecadado"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Girinhas por Mãe (Admin)</CardTitle>
          <CardDescription>
            Proporção de Girinhas em circulação por usuária
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {proportionData?.proporacao || '0.00'}
              </div>
              <p className="text-sm text-muted-foreground">Girinhas por Mãe</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-900">
                  {proportionData?.totalGirinhas?.toLocaleString() || '0'}
                </div>
                <p className="text-sm text-blue-600">Total de Girinhas</p>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-900">
                  {proportionData?.totalMaes?.toLocaleString() || '0'}
                </div>
                <p className="text-sm text-green-600">Total de Mães</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Distribuição</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Média por usuária</span>
                  <span className="text-sm font-medium">{proportionData?.proporacao || '0.00'} Girinhas</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{width: `${Math.min((proportionData?.proporacao || 0) / 100 * 100, 100)}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmissionChart;
