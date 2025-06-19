
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useGirinhasAdmin } from "@/modules/girinhas/hooks/useGirinhasAdmin";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CotacaoChart = () => {
  const { historico, cotacao } = useGirinhasAdmin();

  const chartData = historico?.slice(-30).map(item => ({
    data: format(new Date(item.created_at), 'dd/MM', { locale: ptBR }),
    cotacao: Number(item.cotacao),
    volume: item.volume_periodo || 0
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução da Cotação (Admin)</CardTitle>
        <CardDescription>
          Histórico de preços das Girinhas nos últimos 30 dias
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Cotação Atual</p>
              <p className="text-2xl font-bold text-blue-900">
                R$ {cotacao?.cotacao_atual?.toFixed(4) || '1.0000'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600 font-medium">Volume 24h</p>
              <p className="text-lg font-semibold text-blue-900">
                {cotacao?.volume_24h?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
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
                domain={['dataMin - 0.01', 'dataMax + 0.01']}
                tickFormatter={(value) => `R$ ${value.toFixed(2)}`}
              />
              <Tooltip 
                formatter={(value) => [`R$ ${Number(value).toFixed(4)}`, 'Cotação']}
                labelFormatter={(label) => `Data: ${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="cotacao" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-xs text-gray-500">Mínimo</p>
            <p className="font-semibold">R$ 0.80</p>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-xs text-gray-500">Atual</p>
            <p className="font-semibold">R$ {cotacao?.cotacao_atual?.toFixed(2) || '1.00'}</p>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-xs text-gray-500">Máximo</p>
            <p className="font-semibold">R$ 1.30</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CotacaoChart;
