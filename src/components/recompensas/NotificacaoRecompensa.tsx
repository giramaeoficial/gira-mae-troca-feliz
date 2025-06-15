
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Trophy, Gift, Star } from "lucide-react";

interface Recompensa {
  tipo: 'troca' | 'meta' | 'avaliacao' | 'indicacao' | 'cadastro';
  valor: number;
  descricao: string;
  meta?: string;
}

interface NotificacaoRecompensaProps {
  recompensa: Recompensa | null;
  onClose: () => void;
}

const NotificacaoRecompensa = ({ recompensa, onClose }: NotificacaoRecompensaProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (recompensa) {
      setIsOpen(true);
    }
  }, [recompensa]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300);
  };

  if (!recompensa) return null;

  const getIcon = () => {
    switch (recompensa.tipo) {
      case 'troca':
        return <Gift className="h-12 w-12 text-green-500" />;
      case 'meta':
        return <Trophy className="h-12 w-12 text-yellow-500" />;
      case 'avaliacao':
        return <Star className="h-12 w-12 text-blue-500" />;
      case 'indicacao':
        return <Sparkles className="h-12 w-12 text-purple-500" />;
      case 'cadastro':
        return <Gift className="h-12 w-12 text-pink-500" />;
      default:
        return <Sparkles className="h-12 w-12 text-primary" />;
    }
  };

  const getTitulo = () => {
    switch (recompensa.tipo) {
      case 'troca':
        return '🎉 Troca Concluída!';
      case 'meta':
        return `🏆 Meta ${recompensa.meta} Conquistada!`;
      case 'avaliacao':
        return '⭐ Obrigada pela Avaliação!';
      case 'indicacao':
        return '👥 Indicação Confirmada!';
      case 'cadastro':
        return '🎁 Bem-vinda ao GiraMãe!';
      default:
        return '✨ Recompensa Recebida!';
    }
  };

  const getCor = () => {
    switch (recompensa.tipo) {
      case 'troca':
        return 'from-green-100 to-green-50 border-green-200';
      case 'meta':
        return 'from-yellow-100 to-yellow-50 border-yellow-200';
      case 'avaliacao':
        return 'from-blue-100 to-blue-50 border-blue-200';
      case 'indicacao':
        return 'from-purple-100 to-purple-50 border-purple-200';
      case 'cadastro':
        return 'from-pink-100 to-pink-50 border-pink-200';
      default:
        return 'from-gray-100 to-gray-50 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`max-w-md bg-gradient-to-br ${getCor()}`}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {getTitulo()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            {getIcon()}
          </div>

          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-800">
              {recompensa.descricao}
            </p>
            
            <div className="flex items-center justify-center gap-2">
              <Badge className="bg-primary/20 text-primary px-4 py-2 text-lg">
                +{recompensa.valor} Girinhas
              </Badge>
              <Sparkles className="h-5 w-5 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white/60 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              Continue participando da comunidade GiraMãe para ganhar mais recompensas!
            </p>
          </div>

          <Button 
            onClick={handleClose}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Continuar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificacaoRecompensa;
