import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ShoppingBag, Users, Wallet } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PadraoUsoProps {
  userId: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

export default function PadraoUso({ userId }: PadraoUsoProps) {
  const { data: carteira, isLoading } = useQuery({
    queryKey: ['padrao-uso', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('carteiras')
        .select('saldo_atual, total_gasto, total_recebido')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Padrão de Uso</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!carteira) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Padrão de Uso</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Dados não disponíveis
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalRecebido = carteira.total_recebido || 0;
  const totalGasto = carteira.total_gasto || 0;
  const saldoAtual = carteira.saldo_atual || 0;

  const dadosGrafico = [
    { name: 'Gasto', value: totalGasto },
    { name: 'Saldo', value: saldoAtual },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Padrão de Uso</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Gráfico */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosGrafico}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosGrafico.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Estatísticas */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Wallet className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Recebido</p>
                <p className="text-2xl font-bold">{totalRecebido.toLocaleString('pt-BR')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <ShoppingBag className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Gasto</p>
                <p className="text-2xl font-bold">{totalGasto.toLocaleString('pt-BR')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Wallet className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Saldo Atual</p>
                <p className="text-2xl font-bold">{saldoAtual.toLocaleString('pt-BR')}</p>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Taxa de Utilização</p>
              <p className="text-xl font-bold">
                {totalRecebido > 0 ? ((totalGasto / totalRecebido) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
