
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ShoppingCart } from 'lucide-react';

const CotacaoWidget: React.FC = () => {
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Girinha
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preço fixo */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-bold text-purple-600">
              R$ 1,00
            </p>
            <p className="text-xs text-gray-500">Preço fixo por Girinha</p>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              <ShoppingCart className="w-3 h-3 mr-1" />
              Disponível
            </Badge>
          </div>
        </div>

        <div className="bg-white/60 rounded-lg p-3">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 mb-1">
              Moeda da comunidade GiraMãe
            </p>
            <p className="text-xs text-gray-500">
              Use para trocar roupas, brinquedos e muito mais!
            </p>
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center">
          Sistema simples • Sem complicações
        </div>
      </CardContent>
    </Card>
  );
};

export default CotacaoWidget;
