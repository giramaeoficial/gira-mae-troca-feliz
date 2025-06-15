
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { Tables } from '@/integrations/supabase/types';

type PacoteGirinhas = Tables<'pacotes_girinhas'>;

interface PacoteCardProps {
  pacote: PacoteGirinhas;
  onComprar: (pacoteId: string) => void;
  loading?: boolean;
}

const PacoteCard = ({ pacote, onComprar, loading = false }: PacoteCardProps) => {
  const bonusGirinhas = pacote.valor_girinhas - (pacote.valor_real / 1);
  const isPopular = pacote.desconto_percentual >= 10;

  return (
    <Card className={`relative shadow-lg border-2 ${isPopular ? 'border-primary' : 'border-transparent'} transform hover:-translate-y-2 transition-transform duration-300 flex flex-col`}>
      {isPopular && (
        <div className="bg-primary text-primary-foreground text-center text-sm font-bold py-1 rounded-t-lg">
          MAIS POPULAR
        </div>
      )}
      
      <CardHeader className="text-center">
        <CardTitle className="text-2xl flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-yellow-500" />
          {pacote.nome}
        </CardTitle>
        <div className="text-4xl font-bold text-secondary">
          {pacote.valor_girinhas} 
          <span className="text-lg font-normal text-muted-foreground ml-2">Girinhas</span>
        </div>
      </CardHeader>
      
      <CardContent className="text-center flex-grow">
        <p className="text-xl font-semibold">R$ {Number(pacote.valor_real).toFixed(2)}</p>
        <p className="text-sm text-muted-foreground">(1 Girinha ≈ R$ 1,00)</p>
        
        {pacote.desconto_percentual > 0 && (
          <Badge variant="secondary" className="mt-2">
            {pacote.desconto_percentual}% de desconto
          </Badge>
        )}
        
        {bonusGirinhas > 0 && (
          <p className="text-green-600 font-semibold mt-2">
            +{bonusGirinhas} Girinhas de bônus!
          </p>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full" 
          variant={isPopular ? 'default' : 'outline'}
          onClick={() => onComprar(pacote.id)}
          disabled={loading}
        >
          {loading ? 'Processando...' : 'Comprar Pacote'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PacoteCard;
