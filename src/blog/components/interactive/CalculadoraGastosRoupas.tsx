// src/blog/components/interactive/CalculadoraGastosRoupas.tsx
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingUp, Leaf, PiggyBank, RefreshCw } from 'lucide-react';

interface CalculoResult {
  gastoAnual: number;
  gasto5Anos: number;
  economiaCircular: number;
  economiaAnual: number;
}

export default function CalculadoraGastosRoupas() {
  const [pecasPorMes, setPecasPorMes] = useState(4);
  const [valorMedioPeca, setValorMedioPeca] = useState(50);
  const [idadeFilho, setIdadeFilho] = useState(2);
  const [calculado, setCalculado] = useState(false);

  const resultado = useMemo<CalculoResult>(() => {
    const gastoMensal = pecasPorMes * valorMedioPeca;
    const gastoAnual = gastoMensal * 12;
    
    // Fator de crescimento: crianças menores precisam trocar mais frequentemente
    const fatorIdade = idadeFilho <= 2 ? 1.3 : idadeFilho <= 5 ? 1.15 : 1;
    const gastoAnualAjustado = gastoAnual * fatorIdade;
    
    // Projeção de 5 anos com inflação média de 6% ao ano
    const inflacaoAnual = 0.06;
    let gasto5Anos = 0;
    for (let i = 0; i < 5; i++) {
      gasto5Anos += gastoAnualAjustado * Math.pow(1 + inflacaoAnual, i);
    }

    // Economia circular: redução estimada de 70%
    const economiaCircular = gasto5Anos * 0.7;
    const economiaAnual = gastoAnualAjustado * 0.7;

    return {
      gastoAnual: Math.round(gastoAnualAjustado),
      gasto5Anos: Math.round(gasto5Anos),
      economiaCircular: Math.round(economiaCircular),
      economiaAnual: Math.round(economiaAnual),
    };
  }, [pecasPorMes, valorMedioPeca, idadeFilho]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleCalcular = () => {
    setCalculado(true);
  };

  const handleReset = () => {
    setPecasPorMes(4);
    setValorMedioPeca(50);
    setIdadeFilho(2);
    setCalculado(false);
  };

  return (
    <Card className="border-2 border-primary/20 shadow-lg bg-gradient-to-br from-white to-pink-50/30">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Calculator className="w-6 h-6" />
          Calculadora de Gastos com Roupas Infantis
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Descubra quanto você gasta e quanto pode economizar com economia circular
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Inputs */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Peças por mês */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Peças compradas por mês
            </Label>
            <div className="space-y-2">
              <Slider
                value={[pecasPorMes]}
                onValueChange={(v) => setPecasPorMes(v[0])}
                min={1}
                max={15}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span className="font-semibold text-primary text-base">{pecasPorMes} peças</span>
                <span>15</span>
              </div>
            </div>
          </div>

          {/* Valor médio */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Valor médio por peça (R$)
            </Label>
            <Input
              type="number"
              value={valorMedioPeca}
              onChange={(e) => setValorMedioPeca(Number(e.target.value) || 0)}
              min={10}
              max={500}
              className="text-center font-semibold"
            />
            <p className="text-xs text-muted-foreground text-center">
              Inclua roupas, calçados e acessórios
            </p>
          </div>

          {/* Idade do filho */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Idade do filho (anos)
            </Label>
            <div className="space-y-2">
              <Slider
                value={[idadeFilho]}
                onValueChange={(v) => setIdadeFilho(v[0])}
                min={0}
                max={12}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span className="font-semibold text-primary text-base">{idadeFilho} anos</span>
                <span>12</span>
              </div>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3 justify-center pt-2">
          <Button onClick={handleCalcular} size="lg" className="gap-2">
            <Calculator className="w-4 h-4" />
            Calcular Gastos
          </Button>
          {calculado && (
            <Button onClick={handleReset} variant="outline" size="lg" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Recalcular
            </Button>
          )}
        </div>

        {/* Resultados */}
        {calculado && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-lg text-center text-primary">
              Seus Resultados
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Gasto Anual */}
              <Card className="bg-red-50 border-red-200">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-red-500" />
                    <div>
                      <p className="text-sm text-red-600 font-medium">Gasto Anual Estimado</p>
                      <p className="text-2xl font-bold text-red-700">
                        {formatCurrency(resultado.gastoAnual)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Projeção 5 anos */}
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-orange-500" />
                    <div>
                      <p className="text-sm text-orange-600 font-medium">Projeção em 5 Anos</p>
                      <p className="text-2xl font-bold text-orange-700">
                        {formatCurrency(resultado.gasto5Anos)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Economia Anual */}
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <PiggyBank className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="text-sm text-green-600 font-medium">Economia Anual com GiraMãe</p>
                      <p className="text-2xl font-bold text-green-700">
                        {formatCurrency(resultado.economiaAnual)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Economia 5 anos */}
              <Card className="bg-emerald-50 border-emerald-200">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <Leaf className="w-8 h-8 text-emerald-500" />
                    <div>
                      <p className="text-sm text-emerald-600 font-medium">Economia em 5 Anos</p>
                      <p className="text-2xl font-bold text-emerald-700">
                        {formatCurrency(resultado.economiaCircular)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-primary/10 to-pink-100 rounded-lg p-4 text-center mt-6">
              <p className="text-sm text-primary mb-3">
                💡 Com a economia circular do GiraMãe, você pode reduzir até 70% desses gastos!
              </p>
              <Button asChild>
                <a href="/cadastro" className="gap-2">
                  Começar a Economizar
                </a>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
