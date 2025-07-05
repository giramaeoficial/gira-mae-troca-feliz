
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  Gift, 
  ArrowRight, 
  CheckCircle, 
  Camera,
  Sparkles,
  Trophy
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePactoEntrada } from '@/hooks/usePactoEntrada';

const MissaoPactoEntrada: React.FC = () => {
  const { status, coletarRecompensaPacto } = usePactoEntrada();

  const handleColetarRecompensa = async () => {
    await coletarRecompensaPacto();
  };

  if (status.loading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  // Se já completou e coletou, não mostrar mais a missão
  if (status.isCompleto && status.recompensaColetada) {
    return null;
  }

  const progressPercentual = (status.itensContribuidos / 2) * 100;

  return (
    <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-lg mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-yellow-800 flex items-center gap-2">
                MISSÃO ESPECIAL: PRIMEIROS PASSOS
                <Badge className="bg-yellow-500 text-white">Especial</Badge>
              </CardTitle>
              <p className="text-sm text-yellow-700">Complete seu pacto de entrada na comunidade!</p>
            </div>
          </div>
          <Trophy className="w-6 h-6 text-yellow-600" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progresso */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Progresso:</span>
            <span className="text-sm font-bold text-yellow-700">
              {status.itensContribuidos}/2 itens
            </span>
          </div>
          <Progress value={progressPercentual} className="h-3" />
        </div>

        {/* Requisitos */}
        <div className="bg-white/70 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            REQUISITOS:
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {status.itensContribuidos >= 1 ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
              )}
              <span className={status.itensContribuidos >= 1 ? 'text-green-700 line-through' : 'text-gray-700'}>
                Cadastrar 1º item de qualidade
              </span>
            </div>
            <div className="flex items-center gap-3">
              {status.itensContribuidos >= 2 ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
              )}
              <span className={status.itensContribuidos >= 2 ? 'text-green-700 line-through' : 'text-gray-700'}>
                Cadastrar 2º item de qualidade
              </span>
            </div>
          </div>
        </div>

        {/* Recompensas */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
            <Gift className="w-4 h-4" />
            RECOMPENSAS:
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-green-700">• 25 G$ pelo primeiro item</span>
              {status.itensContribuidos >= 1 && <CheckCircle className="w-4 h-4 text-green-500" />}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-green-700">• 25 G$ pelo segundo item</span>
              {status.itensContribuidos >= 2 && <CheckCircle className="w-4 h-4 text-green-500" />}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-green-700">• 50 G$ bônus ao completar</span>
              {status.isCompleto && <CheckCircle className="w-4 h-4 text-green-500" />}
            </div>
            <div className="border-t pt-2 mt-2">
              <span className="font-bold text-green-800">• Acesso total à comunidade</span>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="space-y-3">
          {!status.isCompleto ? (
            <Button 
              asChild
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              <Link to="/publicar">
                <Camera className="w-4 h-4 mr-2" />
                {status.itensContribuidos === 0 ? 'Começar Missão' : `Cadastrar ${status.itensContribuidos === 1 ? '2º' : '1º'} Item`}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          ) : !status.recompensaColetada ? (
            <Button 
              onClick={handleColetarRecompensa}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Coletar Recompensa (100 G$)
              <Gift className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <div className="text-center py-4">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-green-700 font-semibold">Missão Completa!</p>
              <p className="text-sm text-green-600">Bem-vinda à comunidade GiraMãe! 🎉</p>
            </div>
          )}

          {status.itensContribuidos === 1 && (
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <p className="text-sm text-blue-700">
                <strong>Ótimo!</strong> Seu primeiro item já está visível.
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Complete o segundo item e ganhe acesso total!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MissaoPactoEntrada;
