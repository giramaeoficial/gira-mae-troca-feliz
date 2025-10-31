import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ShoppingBag, Users, Wallet } from 'lucide-react';

interface PadraoUsoProps {
  dados: {
    percentual_gasto_itens: number;
    percentual_transferido_p2p: number;
    saldo_atual: number;
    categorias_favoritas: string[];
  };
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--muted))'];

export default function PadraoUso({ dados }: PadraoUsoProps) {
  const dadosGrafico = [
    { name: 'Itens', value: dados.percentual_gasto_itens },
    { name: 'Transferências P2P', value: dados.percentual_transferido_p2p },
    { name: 'Saldo', value: 100 - dados.percentual_gasto_itens - dados.percentual_transferido_p2p }
  ];

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      {/* Gráfico de Pizza */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Uso</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Detalhes */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes de Uso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Saldo Atual */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Wallet className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Saldo Atual</p>
              <p className="text-lg font-semibold">{dados.saldo_atual} Girinhas</p>
            </div>
          </div>

          {/* Gasto em Itens */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Gasto em Itens</p>
              <p className="text-lg font-semibold">{dados.percentual_gasto_itens.toFixed(1)}%</p>
            </div>
          </div>

          {/* Transferências P2P */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Transferências P2P</p>
              <p className="text-lg font-semibold">{dados.percentual_transferido_p2p.toFixed(1)}%</p>
            </div>
          </div>

          {/* Categorias Favoritas */}
          {dados.categorias_favoritas && dados.categorias_favoritas.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Categorias Favoritas</p>
              <div className="flex flex-wrap gap-2">
                {dados.categorias_favoritas.map((categoria, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    {categoria}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
