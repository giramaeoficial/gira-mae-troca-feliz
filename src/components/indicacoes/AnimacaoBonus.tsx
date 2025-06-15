
import { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Sparkles } from 'lucide-react';

interface AnimacaoBonusProps {
  valor: number;
  descricao: string;
  show: boolean;
  onComplete: () => void;
}

const AnimacaoBonus = ({ valor, descricao, show, onComplete }: AnimacaoBonusProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 300);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/20 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white rounded-xl p-8 max-w-md mx-4 text-center shadow-2xl border-2 border-yellow-300 relative overflow-hidden transition-transform duration-300 ${isVisible ? 'scale-100' : 'scale-95'}`}>
        {/* Confete animado */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce text-2xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 50}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1.5 + Math.random()}s`
              }}
            >
              {['🎉', '✨', '🌟', '💫', '🎊'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-gray-800">
            Parabéns!
          </h3>
          <p className="text-gray-600 mb-4">{descricao}</p>
          
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-3 text-lg shadow-lg animate-pulse">
            <Sparkles className="h-5 w-5 mr-2" />
            +{valor} Girinhas
          </Badge>
          
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg mt-4">
            <p className="text-sm text-gray-700">
              Suas indicações estão gerando frutos! Continue compartilhando o GiraMãe com suas amigas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimacaoBonus;
