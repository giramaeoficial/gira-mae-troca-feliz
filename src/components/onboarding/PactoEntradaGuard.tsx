
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Lock, 
  Users, 
  Gift, 
  Sparkles, 
  Star,
  ArrowRight,
  Unlock,
  Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePactoEntrada } from '@/hooks/usePactoEntrada';

interface PactoEntradaGuardProps {
  children: React.ReactNode;
  requiredForAccess?: boolean;
}

const PactoEntradaGuard: React.FC<PactoEntradaGuardProps> = ({ 
  children, 
  requiredForAccess = true 
}) => {
  const { status } = usePactoEntrada();

  if (status.loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Se já completou o pacto, renderizar conteúdo normalmente
  if (status.isCompleto) {
    return <>{children}</>;
  }

  // Se não requer acesso (área permitida), renderizar conteúdo
  if (!requiredForAccess) {
    return <>{children}</>;
  }

  // Renderizar tela de bloqueio
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-purple-600" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-800">
            Área Exclusiva para Membros
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Complete sua <strong>Missão Especial</strong> para acessar esta funcionalidade.
            </p>
            
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progresso:</span>
                <span className="text-sm text-purple-600 font-bold">
                  {status.itensContribuidos}/2 itens
                </span>
              </div>
              <Progress 
                value={(status.itensContribuidos / 2) * 100} 
                className="h-2 mb-2"
              />
              <p className="text-xs text-gray-500">
                Faltam apenas {2 - status.itensContribuidos} itens para desbloquear!
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Gift className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">100+ Girinhas</p>
                <p className="text-xs text-green-600">Recompensa de entrada</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">23.000+ itens</p>
                <p className="text-xs text-blue-600">Disponíveis para troca</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <Heart className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-800">5.800+ mães</p>
                <p className="text-xs text-purple-600">Comunidade ativa</p>
              </div>
            </div>
          </div>

          <Button 
            asChild
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            <Link to="/missoes">
              <Star className="w-4 h-4 mr-2" />
              Ir para Missões
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>

          <div className="text-center">
            <button className="text-xs text-purple-600 hover:text-purple-800 underline">
              Por que isso é importante?
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PactoEntradaGuard;
