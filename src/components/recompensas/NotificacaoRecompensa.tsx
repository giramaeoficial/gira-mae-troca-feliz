
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
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (recompensa) {
      setIsOpen(true);
      setShowConfetti(true);
      
      // Remover confetti após animação
      setTimeout(() => setShowConfetti(false), 3000);
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
        return <Gift className="h-16 w-16 text-green-500 animate-bounce" />;
      case 'meta':
        return <Trophy className="h-16 w-16 text-yellow-500 animate-pulse" />;
      case 'avaliacao':
        return <Star className="h-16 w-16 text-blue-500 animate-spin" style={{ animationDuration: '3s' }} />;
      case 'indicacao':
        return <Sparkles className="h-16 w-16 text-purple-500 animate-bounce" />;
      case 'cadastro':
        return <Gift className="h-16 w-16 text-pink-500 animate-pulse" />;
      default:
        return <Sparkles className="h-16 w-16 text-primary animate-bounce" />;
    }
  };

  const getTitulo = () => {
    switch (recompensa.tipo) {
      case 'troca':
        return '🎉 Troca Fantástica!';
      case 'meta':
        return `🏆 ${recompensa.meta ? recompensa.meta.toUpperCase() : 'CONQUISTA'} Desbloqueada!`;
      case 'avaliacao':
        return '⭐ Você é Incrível!';
      case 'indicacao':
        return '👥 Embaixadora GiraMãe!';
      case 'cadastro':
        return '🎁 Bem-vinda à Família!';
      default:
        return '✨ Parabéns!';
    }
  };

  const getCor = () => {
    switch (recompensa.tipo) {
      case 'troca':
        return 'from-green-200 via-green-100 to-emerald-50 border-green-300';
      case 'meta':
        return 'from-yellow-200 via-yellow-100 to-amber-50 border-yellow-300';
      case 'avaliacao':
        return 'from-blue-200 via-blue-100 to-sky-50 border-blue-300';
      case 'indicacao':
        return 'from-purple-200 via-purple-100 to-violet-50 border-purple-300';
      case 'cadastro':
        return 'from-pink-200 via-pink-100 to-rose-50 border-pink-300';
      default:
        return 'from-gray-200 via-gray-100 to-slate-50 border-gray-300';
    }
  };

  const getMensagemMotivacional = () => {
    switch (recompensa.tipo) {
      case 'troca':
        return 'Cada troca fortalece nossa comunidade! Continue espalhando essa energia positiva.';
      case 'meta':
        return 'Você é uma verdadeira líder na nossa comunidade! Que exemplo inspirador.';
      case 'avaliacao':
        return 'Suas avaliações ajudam outras mães a fazer escolhas melhores. Muito obrigada!';
      case 'indicacao':
        return 'Você está construindo uma rede de apoio incrível! Cada nova mãe fortalece nossa comunidade.';
      case 'cadastro':
        return 'Você faz parte de algo especial agora. Juntas, criamos um mundo melhor para nossos filhos!';
      default:
        return 'Continue sendo essa pessoa incrível!';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`max-w-md bg-gradient-to-br ${getCor()} border-2 shadow-2xl relative overflow-hidden`}>
        {/* Efeito de confetti/partículas */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              >
                ✨
              </div>
            ))}
          </div>
        )}

        <DialogHeader className="text-center relative z-10">
          <DialogTitle className="text-3xl font-bold mb-4">
            {getTitulo()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-center relative z-10">
          <div className="flex justify-center">
            {getIcon()}
          </div>

          <div className="space-y-3">
            <p className="text-xl font-bold text-gray-800">
              {recompensa.descricao}
            </p>
            
            <div className="flex items-center justify-center gap-3">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-3 text-xl shadow-lg animate-pulse">
                +{recompensa.valor} Girinhas
              </Badge>
              <Sparkles className="h-6 w-6 text-yellow-500 animate-spin" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-inner border border-white/50">
            <p className="text-sm font-medium text-gray-700 leading-relaxed">
              {getMensagemMotivacional()}
            </p>
          </div>

          {recompensa.tipo === 'meta' && (
            <div className="bg-gradient-to-r from-amber-100 to-yellow-100 p-4 rounded-xl border border-amber-200">
              <p className="text-sm font-bold text-amber-800">
                🌟 Você está no caminho certo! Continue trocando para desbloquear mais conquistas.
              </p>
            </div>
          )}

          <Button 
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            ✨ Continuar Brilhando ✨
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificacaoRecompensa;
