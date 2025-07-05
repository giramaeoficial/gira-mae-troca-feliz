
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Gift, Star } from 'lucide-react';
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
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-pink-500/5">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-primary to-pink-500 rounded-full flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              🎯 Sua Primeira Missão: "Primeiros Passos"
              <Badge variant="secondary" className="text-xs">
                MISSÃO #1
              </Badge>
            </CardTitle>
            <p className="text-gray-600 text-sm mt-1">
              Todas as mães da GiraMãe começam por aqui! Complete sua primeira missão.
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-white/60 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-primary" />
            <h4 className="font-semibold text-gray-800">Meta da Missão:</h4>
          </div>
          <p className="text-gray-700 text-sm">
            Publique <span className="font-bold text-primary">2 itens</span> na comunidade para desbloquear o acesso completo à plataforma
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Progresso atual: {itensPublicados} de {itensNecessarios} itens
            </span>
            <span className="text-sm font-bold text-primary">
              {progressoPercentual}%
            </span>
          </div>
          
          <Progress 
            value={progressoPercentual} 
            className="h-3"
          />
          
          <div className="text-xs text-gray-500 text-center">
            {missaoCompleta 
              ? "🎉 Missão completada! Você pode coletar sua recompensa" 
              : `Ainda faltam ${itensNecessarios - itensPublicados} ${itensNecessarios - itensPublicados === 1 ? 'item' : 'itens'} para completar`
            }
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-green-600" />
            <h4 className="font-semibold text-green-800">Recompensa ao Completar:</h4>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-600 text-white">
              +{recompensaGirinhas} Girinhas
            </Badge>
            <span className="text-green-700 text-sm">
              {missaoCompleta 
                ? "Disponível para coleta!" 
                : "Será creditada após completar a missão"
              }
            </span>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-blue-600" />
            <h4 className="font-semibold text-blue-800">Por que essa missão?</h4>
          </div>
          <p className="text-blue-700 text-sm">
            Compartilhando itens, você contribui para a economia circular da nossa comunidade 
            e ajuda outras mães a encontrarem o que precisam.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MissaoPactoEntrada;
