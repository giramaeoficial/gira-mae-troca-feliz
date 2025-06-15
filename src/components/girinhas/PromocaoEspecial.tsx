
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Calendar, Heart } from "lucide-react";

const PromocaoEspecial = () => {
  const hoje = new Date();
  const diaMae = new Date(hoje.getFullYear(), 4, 14); // 14 de maio
  const natal = new Date(hoje.getFullYear(), 11, 25); // 25 de dezembro
  
  const isProximoDiaMae = Math.abs(hoje.getTime() - diaMae.getTime()) < 7 * 24 * 60 * 60 * 1000;
  const isProximoNatal = Math.abs(hoje.getTime() - natal.getTime()) < 14 * 24 * 60 * 60 * 1000;

  if (!isProximoDiaMae && !isProximoNatal) return null;

  return (
    <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-pink-700">
          <Gift className="h-5 w-5" />
          Promoção Especial
          <Badge variant="secondary" className="bg-pink-100 text-pink-800">
            Limitada
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isProximoDiaMae && (
          <div className="flex items-center gap-3 mb-4">
            <Heart className="h-6 w-6 text-pink-500" />
            <div>
              <p className="font-semibold text-pink-700">Especial Dia das Mães</p>
              <p className="text-sm text-pink-600">
                Todas as mães ativas ganharão 10 Girinhas no Dia das Mães!
              </p>
            </div>
          </div>
        )}
        
        {isProximoNatal && (
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-green-500" />
            <div>
              <p className="font-semibold text-green-700">Especial Natal</p>
              <p className="text-sm text-green-600">
                20 Girinhas de presente para todas as mães no Natal!
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PromocaoEspecial;
