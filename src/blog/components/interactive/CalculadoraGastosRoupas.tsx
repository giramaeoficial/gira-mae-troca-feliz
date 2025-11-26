// src/blog/components/interactive/CalculadoraGastosRoupas.tsx
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingUp, Leaf, PiggyBank, Info, Share2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  const [quantidadeFilhos, setQuantidadeFilhos] = useState(1);
  const [mostrarBaseCalculo, setMostrarBaseCalculo] = useState(false);

  const resultado = useMemo<CalculoResult>(() => {
    const gastoMensal = pecasPorMes * valorMedioPeca * quantidadeFilhos;
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
  }, [pecasPorMes, valorMedioPeca, idadeFilho, quantidadeFilhos]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const textoCompartilhamento = `Descobri que gasto ${formatCurrency(resultado.gastoAnual)}/ano com roupas infantis! Com economia circular, posso economizar ${formatCurrency(resultado.economiaAnual)}. Faça o cálculo você também:`;
  const urlCompartilhamento = 'https://giramae.com.br/blog/calculadora-gastos-roupas-infantis';

  const compartilharWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(textoCompartilhamento + ' ' + urlCompartilhamento)}`, '_blank');
  };

  const compartilharFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlCompartilhamento)}&quote=${encodeURIComponent(textoCompartilhamento)}`, '_blank');
  };

  const compartilharTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(textoCompartilhamento)}&url=${encodeURIComponent(urlCompartilhamento)}`, '_blank');
  };

  const copiarLink = () => {
    navigator.clipboard.writeText(textoCompartilhamento + ' ' + urlCompartilhamento);
    alert('Link copiado para a área de transferência!');
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
        <div className="grid gap-6 md:grid-cols-2">
          {/* Quantidade de filhos */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Quantidade de filhos
            </Label>
            <div className="space-y-2">
              <Slider
                value={[quantidadeFilhos]}
                onValueChange={(v) => setQuantidadeFilhos(v[0])}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span className="font-semibold text-primary text-base">{quantidadeFilhos} {quantidadeFilhos === 1 ? 'filho' : 'filhos'}</span>
                <span>5</span>
              </div>
            </div>
          </div>

          {/* Idade do filho */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Idade média dos filhos (anos)
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

          {/* Peças por mês */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Peças compradas por mês (por filho)
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
        </div>

        {/* Resultados */}
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

          {/* Compartilhar */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Share2 className="w-4 h-4" />
              Compartilhar:
            </span>
            <Button variant="outline" size="sm" onClick={compartilharWhatsApp} className="gap-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </Button>
            <Button variant="outline" size="sm" onClick={compartilharFacebook} className="gap-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </Button>
            <Button variant="outline" size="sm" onClick={compartilharTwitter} className="gap-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X
            </Button>
            <Button variant="outline" size="sm" onClick={copiarLink} className="gap-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Copiar
            </Button>
          </div>

          {/* Base de Cálculo */}
          <Collapsible open={mostrarBaseCalculo} onOpenChange={setMostrarBaseCalculo}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground">
                <Info className="w-4 h-4" />
                {mostrarBaseCalculo ? 'Ocultar' : 'Ver'} base de cálculo
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="bg-muted/50 rounded-lg p-4 mt-2 text-sm space-y-2">
                <p><strong>Como calculamos:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>Gasto mensal:</strong> {pecasPorMes} peças × R$ {valorMedioPeca} × {quantidadeFilhos} filho(s) = {formatCurrency(pecasPorMes * valorMedioPeca * quantidadeFilhos)}/mês</li>
                  <li><strong>Fator de idade:</strong> Crianças de 0-2 anos crescem mais rápido (+30% de gasto), 3-5 anos (+15%), 6+ anos (sem ajuste)</li>
                  <li><strong>Projeção de 5 anos:</strong> Considera inflação média de 6% ao ano no setor de vestuário</li>
                  <li><strong>Economia circular:</strong> Baseada em redução média de 70% ao optar por trocas e brechós, conforme pesquisas de consumo sustentável</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  * Valores são estimativas para fins educativos. Resultados reais podem variar conforme hábitos de consumo e região.
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* CTA */}
          <div className="bg-gradient-to-r from-primary/10 to-pink-100 rounded-lg p-4 text-center mt-6">
            <p className="text-sm text-primary mb-3">
              💡 Com a economia circular do GiraMãe, você pode reduzir até 70% desses gastos!
            </p>
            <Button asChild>
              <a href="/" className="gap-2">
                Começar a Economizar
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
