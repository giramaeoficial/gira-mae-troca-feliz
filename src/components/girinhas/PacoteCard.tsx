
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Crown, Zap, Gift } from "lucide-react";
import { Tables } from '@/integrations/supabase/types';

type PacoteGirinhas = Tables<'pacotes_girinhas'>;

interface PacoteCardProps {
  pacote: PacoteGirinhas;
  onComprar: (pacoteId: string) => void;
  isLoading?: boolean; // Loading específico para este pacote
}

const PacoteCard = ({ pacote, onComprar, isLoading = false }: PacoteCardProps) => {
  const bonusGirinhas = pacote.valor_girinhas - (pacote.valor_real / 1);
  const isPopular = pacote.desconto_percentual >= 10;
  const isMelhorOferta = pacote.desconto_percentual >= 15;

  const getIcon = () => {
    if (isMelhorOferta) return Crown;
    if (isPopular) return Zap;
    return Sparkles;
  };

  const getGradient = () => {
    if (isMelhorOferta) return "bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500";
    if (isPopular) return "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500";
    return "bg-gradient-to-br from-green-400 to-blue-500";
  };

  const Icon = getIcon();

  return (
    <Card className={`relative shadow-xl border-2 ${
      isMelhorOferta ? 'border-yellow-400 animate-pulse' : 
      isPopular ? 'border-purple-400' : 'border-green-300'
    } transform hover:-translate-y-3 transition-all duration-300 hover:shadow-2xl flex flex-col group`}>
      
      {isMelhorOferta && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold px-4 py-1 text-sm animate-bounce">
            🔥 MELHOR OFERTA!
          </Badge>
        </div>
      )}
      
      {isPopular && !isMelhorOferta && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-4 py-1">
            ⭐ MAIS POPULAR
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center relative overflow-hidden">
        <div className={`absolute inset-0 ${getGradient()} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
        <CardTitle className="text-2xl flex items-center justify-center gap-2 relative z-10">
          <Icon className={`h-6 w-6 ${
            isMelhorOferta ? 'text-yellow-500' :
            isPopular ? 'text-purple-500' : 'text-green-500'
          }`} />
          {pacote.nome}
        </CardTitle>
        <div className="text-4xl font-bold text-primary relative z-10">
          {pacote.valor_girinhas} 
          <span className="text-lg font-normal text-muted-foreground ml-2">Girinhas</span>
        </div>
      </CardHeader>
      
      <CardContent className="text-center flex-grow space-y-4">
        <div className="space-y-2">
          <p className="text-3xl font-bold text-green-600">R$ {Number(pacote.valor_real).toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">(1 Girinha = R$ 1,00)</p>
        </div>
        
        {pacote.desconto_percentual > 0 && (
          <div className="space-y-2">
            <Badge variant="secondary" className={`${
              isMelhorOferta ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            } text-lg px-3 py-1`}>
              {pacote.desconto_percentual}% OFF
            </Badge>
            <p className="text-sm text-gray-500 line-through">
              De R$ {pacote.valor_girinhas.toFixed(2)}
            </p>
          </div>
        )}
        
        {bonusGirinhas > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg border border-green-200">
            <Gift className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-green-700 font-semibold text-sm">
              +{bonusGirinhas} Girinhas de BÔNUS!
            </p>
            <p className="text-xs text-green-600">
              Você economiza R$ {bonusGirinhas.toFixed(2)}
            </p>
          </div>
        )}
        
        <div className="text-xs text-gray-500 space-y-1">
          <p>✅ Sem prazo de validade</p>
          <p>✅ Use quando quiser</p>
          <p>✅ Bônus em trocas</p>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className={`w-full text-lg py-6 ${
            isMelhorOferta ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' :
            isPopular ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' :
            'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'
          } text-white font-bold transform hover:scale-105 transition-all duration-200`}
          onClick={() => onComprar(pacote.id)}
          disabled={isLoading}
        >
          {isLoading ? 'Processando...' : 'Comprar Agora! 🚀'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PacoteCard;
