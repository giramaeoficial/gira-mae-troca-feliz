// ✅ VERSÃO CORRIGIDA: BonusDiarioWidget.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Gift, Clock, CheckCircle, Calendar } from 'lucide-react';
import { useBonusDiario } from '@/hooks/useBonusDiario';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const BonusDiarioWidget: React.FC = () => {
  const {
    config,
    status,
    isLoading,
    coletarBonus,
    isColetando,
    podeColetarBonus,
    proximaRenovacao,
    jaColetouHoje
  } = useBonusDiario();

  if (isLoading || !config?.ativo) {
    return null;
  }

  const valorGirinhas = config.valor_girinhas;
  const validadeHoras = config.validade_horas;

  // ✅ NOVA LÓGICA: Calcular tempo até próxima meia-noite
  const calcularTempoAteMeiaNoite = () => {
    const agora = new Date();
    const proximaMeiaNoite = new Date();
    proximaMeiaNoite.setDate(proximaMeiaNoite.getDate() + 1);
    proximaMeiaNoite.setHours(0, 0, 0, 0);
    
    const diferencaMs = proximaMeiaNoite.getTime() - agora.getTime();
    const horasRestantes = Math.floor(diferencaMs / (1000 * 60 * 60));
    const minutosRestantes = Math.floor((diferencaMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return { horasRestantes, minutosRestantes, proximaMeiaNoite };
  };

  const { horasRestantes, minutosRestantes, proximaMeiaNoite } = calcularTempoAteMeiaNoite();
  const progressoAteMeiaNoite = ((24 - horasRestantes - (minutosRestantes / 60)) / 24) * 100;

  const handleColetarBonus = () => {
    coletarBonus();
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gift className={`h-5 w-5 ${podeColetarBonus ? 'text-purple-600 animate-bounce' : 'text-gray-400'}`} />
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Bônus Diário
          </span>
          {podeColetarBonus && (
            <Badge className="bg-purple-500 text-white animate-pulse ml-auto">
              DISPONÍVEL!
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {podeColetarBonus ? (
          // ✅ Bônus disponível para coleta
          <div className="text-center space-y-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl">
              <div className="text-3xl font-bold">+{valorGirinhas}</div>
              <div className="text-sm opacity-90">Girinhas grátis</div>
            </div>
            
            {/* ✅ CORREÇÃO: Nova mensagem sobre validade */}
            <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded border-l-4 border-blue-400">
              <Calendar className="inline h-3 w-3 mr-1" />
              <strong>Válido até meia-noite!</strong>
            </div>

            <Button 
              onClick={handleColetarBonus}
              disabled={isColetando}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {isColetando ? (
                'Coletando...'
              ) : (
                <>
                  <Gift className="mr-2 h-5 w-5" />
                  Coletar Bônus Diário
                </>
              )}
            </Button>
          </div>
        ) : jaColetouHoje ? (
          // ✅ Já coletou hoje - mostrar countdown até meia-noite
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Bônus Coletado!</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Novo bônus disponível em:</span>
                <span className="font-semibold text-purple-600">
                  {horasRestantes}h {minutosRestantes}m
                </span>
              </div>
              
              <Progress 
                value={progressoAteMeiaNoite} 
                className="h-2 bg-gray-200"
              />
            </div>

            {/* ✅ CORREÇÃO: Informação clara sobre renovação */}
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              <Clock className="inline h-3 w-3 mr-1" />
              Seu próximo bônus estará disponível à meia-noite ({format(proximaMeiaNoite, 'dd/MM HH:mm', { locale: ptBR })})
            </div>
          </div>
        ) : (
          // Estado inicial ou erro
          <div className="text-center text-gray-500">
            <Gift className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Bônus diário não disponível</p>
          </div>
        )}

        {/* ✅ CORREÇÃO: Informações sobre o funcionamento do sistema */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t space-y-1">
          <p>🎁 Receba {valorGirinhas} Girinhas grátis todos os dias</p>
          <p>⏰ Renovação automática à meia-noite</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BonusDiarioWidget;
