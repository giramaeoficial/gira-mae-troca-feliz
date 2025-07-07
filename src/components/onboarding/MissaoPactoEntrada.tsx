import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Zap, Heart, Lightbulb, CheckCircle2 } from 'lucide-react';
import { usePactoEntrada } from '@/hooks/usePactoEntrada';

const MissaoPactoEntrada = () => {
  const { 
    itensPublicados, 
    itensNecessarios, 
    itensRestantes,
    missaoCompleta, 
    recompensaGirinhas,
    progressoPercentual,
    isLoading 
  } = usePactoEntrada();

  if (isLoading) {
    return (
      <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 shadow-lg">
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
            <h4 className="font-semibold text-gray-800">💝 Por que esta missão existe:</h4>
          </div>
          <p className="text-gray-700 text-sm mb-2">
            Para manter nossa comunidade <strong>ativa e justa</strong>, todas as mães 
            contribuem anunciando itens para venda por Girinhas.
          </p>
          <p className="text-xs text-gray-600">
            (Não precisa vender, apenas anunciar com fotos reais)
          </p>
        </div>

        {/* Progresso Visual */}
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
          
          <div className="text-center">
            {missaoCompleta ? (
              <div className="flex items-center justify-center gap-2 text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">🎉 Missão completada! Colete sua recompensa</span>
              </div>
            ) : (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-blue-700 text-sm font-medium">
                  Ainda faltam <strong>{itensRestantes} {itensRestantes === 1 ? 'item' : 'itens'}</strong> para completar
                </p>
                <p className="text-blue-600 text-xs mt-1">
                  Você está quase lá! Continue anunciando 💪
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recompensa */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-green-600" />
            <h4 className="font-semibold text-green-800">🎁 Recompensa de Boas-vindas:</h4>
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

        {/* Dicas Motivacionais */}
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-purple-600" />
            <h4 className="font-semibold text-purple-800">💡 Toda casa com crianças tem itens:</h4>
          </div>
          <div className="grid grid-cols-2 gap-2 text-purple-700 text-xs">
            <div className="flex items-center gap-1">
              <span>✅</span>
              <span>Roupas que não servem</span>
            </div>
            <div className="flex items-center gap-1">
              <span>✅</span>
              <span>Brinquedos esquecidos</span>
            </div>
            <div className="flex items-center gap-1">
              <span>✅</span>
              <span>Livros já lidos</span>
            </div>
            <div className="flex items-center gap-1">
              <span>✅</span>
              <span>Sapatos pequenos</span>
            </div>
          </div>
        </div>

        {/* Garantias de Segurança */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-blue-600" />
            <h4 className="font-semibold text-blue-800">🛡️ Ambiente seguro e confiável:</h4>
          </div>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Todas as fotos são verificadas pela nossa equipe</li>
            <li>• Sistema de avaliações entre mães</li>
            <li>• Suporte ativo para qualquer dúvida</li>
          </ul>
        </div>

        {/* Footer motivacional */}
        <div className="text-center bg-yellow-50 rounded-lg p-3 border border-yellow-200">
          <p className="text-yellow-800 text-sm font-medium">
            📱 Super rápido: cada item leva apenas 3 minutos para cadastrar
          </p>
          <p className="text-yellow-700 text-xs mt-1">
            💪 Milhares de mães já completaram esta missão!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MissaoPactoEntrada;
