
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, RefreshCw, Sparkles } from 'lucide-react';
import { useGirinhasSystem } from '../hooks/useGirinhasSystem';

const CotacaoWidget: React.FC = () => {
  const { cotacao, historico, loadingCotacao, recalcularCotacao, refetchCotacao } = useGirinhasSystem();

  if (loadingCotacao) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!cotacao) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Erro ao carregar cotação</p>
          <Button variant="outline" size="sm" onClick={() => refetchCotacao()} className="mt-2">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Calcular tendência baseada no histórico
  const tendencia = historico && historico.length >= 2 
    ? historico[0].cotacao > historico[1].cotacao ? 'up' : 'down'
    : 'neutral';

  const TrendIcon = tendencia === 'up' ? TrendingUp : TrendingDown;
  const trendColor = tendencia === 'up' ? 'text-green-500' : 'text-red-500';

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Cotação Girinha
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => recalcularCotacao()}
            className="hover:bg-white/50"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-purple-600">
              R$ {cotacao.cotacao_atual.toFixed(4)}
            </p>
            <p className="text-sm text-gray-500">por Girinha</p>
          </div>
          <div className="text-right">
            <div className={`flex items-center gap-1 ${trendColor}`}>
              <TrendIcon className="w-4 h-4" />
              <span className="text-sm font-medium">
                {tendencia === 'up' ? 'Alta' : tendencia === 'down' ? 'Baixa' : 'Estável'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/60 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Volume 24h</p>
            <p className="font-semibold text-gray-800">{cotacao.volume_24h}</p>
          </div>
          <div className="bg-white/60 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Status</p>
            <Badge variant="outline" className="text-xs">
              {cotacao.cotacao_atual >= 1.25 ? 'Alta' : 
               cotacao.cotacao_atual <= 0.85 ? 'Baixa' : 'Normal'}
            </Badge>
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center">
          Última atualização: {new Date(cotacao.updated_at).toLocaleTimeString('pt-BR')}
        </div>
      </CardContent>
    </Card>
  );
};

export default CotacaoWidget;
