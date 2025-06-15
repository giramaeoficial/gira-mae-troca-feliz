
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Calculator } from "lucide-react";

const InfoTaxas = () => {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <Info className="h-5 w-5" />
          Como funcionam as taxas
        </CardTitle>
      </CardHeader>
      <CardContent className="text-blue-700">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Calculator className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Taxa de 5% sobre trocas</p>
              <p className="text-sm text-blue-600">
                Cobrada em reais da usuária que recebe o item
              </p>
            </div>
          </div>
          
          <div className="bg-blue-100 p-3 rounded-lg">
            <p className="font-medium text-sm">Exemplo:</p>
            <p className="text-sm">
              Item de 20 Girinhas = Taxa de R$ 1,00
            </p>
          </div>
          
          <p className="text-xs text-blue-600">
            * As taxas ajudam a manter a plataforma funcionando e segura para todas as mães
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InfoTaxas;
