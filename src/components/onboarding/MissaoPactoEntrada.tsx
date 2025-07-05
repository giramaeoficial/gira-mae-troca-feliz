
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Zap, AlertTriangle } from 'lucide-react';
import { usePactoEntrada } from '@/hooks/usePactoEntrada';

const MissaoPactoEntrada = () => {
  const { 
    itensPublicados, 
    itensNecessarios, 
    missaoCompleta, 
    recompensaGirinhas,
    isLoading 
  } = usePactoEntrada();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressoPercentual = Math.round((itensPublicados / itensNecessarios) * 100);

  return (
    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              🎯 MISSÃO OBRIGATÓRIA #1
              <Badge variant="destructive" className="text-xs">
                OBRIGATÓRIA
              </Badge>
            </CardTitle>
            <p className="text-gray-600 text-sm mt-1">
              Primeira e única missão obrigatória da plataforma
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-white/60 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-orange-600" />
            <h4 className="font-semibold text-gray-800">A REAL sobre esta missão:</h4>
          </div>
          <p className="text-gray-700 text-sm mb-2">
            <strong>TODOS</strong> aqui contribuem anunciando itens para venda por Girinhas. 
            Com você não será diferente!
          </p>
          <p className="text-xs text-gray-600">
            Anuncie <strong>2 itens reais</strong> com fotos para ter acesso completo
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Progresso: {itensPublicados} de {itensNecessarios} itens anunciados
            </span>
            <span className="text-sm font-bold text-orange-600">
              {progressoPercentual}%
            </span>
          </div>
          
          <Progress 
            value={progressoPercentual} 
            className="h-3"
          />
          
          <div className="text-xs text-center">
            {missaoCompleta 
              ? "🎉 Missão completada! Colete sua recompensa" 
              : `Ainda faltam ${itensNecessarios - itensPublicados} ${itensNecessarios - itensPublicados === 1 ? 'item' : 'itens'} para completar`
            }
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-green-600" />
            <h4 className="font-semibold text-green-800">Recompensa:</h4>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-600 text-white">
              +{recompensaGirinhas} Girinhas
            </Badge>
            <span className="text-green-700 text-sm">
              = R$ {recompensaGirinhas},00 para usar na plataforma
            </span>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <h4 className="font-semibold text-red-800">Regras importantes:</h4>
          </div>
          <ul className="text-red-700 text-sm space-y-1">
            <li>• Fotos obrigatórias (sem foto, sem anúncio)</li>
            <li>• Itens reais apenas (tolerância zero para fake)</li>
            <li>• Descrições honestas sobre o estado</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default MissaoPactoEntrada;
