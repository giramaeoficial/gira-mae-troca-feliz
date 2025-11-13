
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePrecoManual } from "@/hooks/usePrecoManual";
import { TrendingUp, Sparkles } from "lucide-react";

const CotacaoWidget = () => {
  const { precoManual, isLoading } = usePrecoManual();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Preço das Girinhas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <img src="/girinha_sem_fundo.png" alt="girinha" className="h-8 w-auto"/>
          Preço das Girinhas
        </CardTitle>
        <CardDescription>
          Preço fixo controlado manualmente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-purple-600">
              R$ {precoManual.toFixed(2)}
            </span>
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Estável</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500">Tipo</p>
              <p className="font-semibold">Manual</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500">Status</p>
              <p className="font-semibold text-green-600">Ativo</p>
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-600">
              💡 O preço é definido manualmente pela administração para garantir estabilidade e transparência.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CotacaoWidget;
