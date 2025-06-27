
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GoogleStepProps {
  onComplete: () => void;
  onGoogleLogin: () => Promise<void>;
  isLoading: boolean;
}

const GoogleStep: React.FC<GoogleStepProps> = ({ onComplete, onGoogleLogin, isLoading }) => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      await onGoogleLogin();
      onComplete();
    } catch (error) {
      console.error('Erro no login com Google:', error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="px-6 pb-6 pt-2">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-primary/10 to-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <img 
            src="https://www.svgrepo.com/show/475656/google-color.svg" 
            alt="Google" 
            className="w-10 h-10"
          />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Entre com sua conta Google
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Para sua segurança e praticidade, utilizamos o login do Google. 
          Seus dados estarão protegidos e você terá acesso imediato à plataforma.
        </p>
      </div>
      
      <Button 
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading || isLoading}
        className="w-full bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white font-medium py-3 h-auto shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
      >
        <img 
          src="https://www.svgrepo.com/show/475656/google-color.svg" 
          alt="Google" 
          className="w-6 h-6 mr-3"
        />
        {isGoogleLoading ? 'Conectando...' : 'Continuar com Google'}
      </Button>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Ao continuar, você concorda com nossos{' '}
          <Link to="#" className="text-primary hover:underline">Termos de Uso</Link>
          {' '}e{' '}
          <Link to="#" className="text-primary hover:underline">Política de Privacidade</Link>
        </p>
      </div>
    </div>
  );
};

export default GoogleStep;
