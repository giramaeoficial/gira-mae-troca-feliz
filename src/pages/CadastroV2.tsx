// src/pages/CadastroV2.tsx - USAR ESTA COMO PÁGINA PRINCIPAL
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Heart, CheckCircle } from 'lucide-react';
import Header from '@/components/shared/Header';
import { useAuth } from '@/hooks/useAuth';
import { useCadastroProgress } from '@/hooks/useCadastroProgress';
import GoogleStepV2 from '@/components/cadastro/GoogleStepV2';
import PhoneStepV2 from '@/components/cadastro/PhoneStepV2';
import CodeStepV2 from '@/components/cadastro/CodeStepV2';
import PersonalStepV2 from '@/components/cadastro/PersonalStepV2';
import AddressStepV2 from '@/components/cadastro/AddressStepV2';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

interface Step {
  key: string;
  title: string;
  completed: boolean;
  active: boolean;
}

const CadastroV2 = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { progress, loading, completeStep, updateProgress } = useCadastroProgress();
  const [steps, setSteps] = useState<Step[]>([]);
  const [autoAdvanceProcessed, setAutoAdvanceProcessed] = useState(false);

  // Definir steps baseado no progresso
  useEffect(() => {
    const stepOrder = ['google', 'phone', 'code', 'personal', 'address'];
    const currentStepIndex = stepOrder.indexOf(progress.step);
    
    const newSteps = stepOrder.map((stepKey, index) => ({
      key: stepKey,
      title: getStepTitle(stepKey),
      completed: index < currentStepIndex || progress.status === 'completo',
      active: index === currentStepIndex && progress.status !== 'completo'
    }));

    setSteps(newSteps);
  }, [progress]);

  // Auto-avanço para usuários já autenticados
  useEffect(() => {
    if (!loading && user && progress.step === 'google' && progress.status === 'incompleto' && !autoAdvanceProcessed) {
      console.log('✅ Usuário logado detectado, auto-avançando do step Google para Phone...');
      
      setAutoAdvanceProcessed(true);
      
      // Pequeno delay para garantir que o estado foi atualizado
      setTimeout(() => {
        updateProgress('phone').then(success => {
          if (success) {
            console.log('✅ Auto-avanço concluído com sucesso');
            toast({
              title: "Bem-vindo!",
              description: "Vamos completar seu cadastro.",
            });
          } else {
            console.error('❌ Erro no auto-avanço');
            toast({
              title: "Erro",
              description: "Houve um problema. Tente recarregar a página.",
              variant: "destructive",
            });
          }
        });
      }, 500);
    }
  }, [loading, user, progress, autoAdvanceProcessed, updateProgress, toast]);

  // Redirecionar usuários com cadastro completo
  useEffect(() => {
    if (!loading && user && progress.status === 'completo') {
      console.log('✅ Cadastro completo, redirecionando para dashboard...');
      navigate('/dashboard', { replace: true });
    }
  }, [loading, user, progress.status, navigate]);

  const getStepTitle = (stepKey: string): string => {
    const titles = {
      google: 'Entrar com Google',
      phone: 'Adicionar celular',
      code: 'Validar código',
      personal: 'Dados pessoais',
      address: 'Endereço'
    };
    return titles[stepKey as keyof typeof titles] || stepKey;
  };

  const handleStepComplete = async (currentStepKey: string) => {
    console.log('🔄 Completando step:', currentStepKey);
    
    const stepOrder = ['google', 'phone', 'code', 'personal', 'address'];
    const currentIndex = stepOrder.indexOf(currentStepKey);
    const nextStep = stepOrder[currentIndex + 1];
    
    if (nextStep) {
      const success = await updateProgress(nextStep);
      if (success) {
        toast({
          title: "Etapa concluída!",
          description: `Avançando para: ${getStepTitle(nextStep)}`,
        });
      }
    } else {
      // Último step - completar cadastro
      const success = await updateProgress('address', 'completo');
      if (success) {
        toast({
          title: "Cadastro completo!",
          description: "Bem-vindo à GiraMãe!",
        });
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);
      }
    }
  };

  const renderStepContent = () => {
    const activeStep = steps.find(step => step.active);
    if (!activeStep) return null;

    switch (activeStep.key) {
      case 'google':
        return (
          <GoogleStepV2
            onComplete={() => handleStepComplete('google')}
          />
        );

      case 'phone':
        return (
          <PhoneStepV2
            onComplete={() => handleStepComplete('phone')}
          />
        );

      case 'code':
        return (
          <CodeStepV2
            onComplete={() => handleStepComplete('code')}
          />
        );

      case 'personal':
        return (
          <PersonalStepV2
            onComplete={() => handleStepComplete('personal')}
          />
        );

      case 'address':
        return (
          <AddressStepV2
            onComplete={() => handleStepComplete('address')}
          />
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          
          {/* Header do Card */}
          <div className="bg-gradient-to-r from-primary to-pink-500 p-6 text-white text-center">
            <div className="flex items-center justify-center mb-2">
              <Sparkles className="w-8 h-8 mr-2" />
              <Heart className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Bem-vinda à GiraMãe!</h1>
            <p className="text-sm opacity-90">Vamos completar seu cadastro em alguns passos</p>
          </div>

          {/* Indicador de Progresso */}
          <div className="p-4 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.key} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${step.completed 
                      ? 'bg-green-500 text-white' 
                      : step.active 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-300 text-gray-600'
                    }
                  `}>
                    {step.completed ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      w-8 h-1 mx-1
                      ${step.completed ? 'bg-green-500' : 'bg-gray-300'}
                    `} />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 text-center">
              <p className="text-sm text-gray-600">
                {steps.find(s => s.active)?.title || 'Carregando...'}
              </p>
            </div>
          </div>

          {/* Conteúdo do Step */}
          <div className="min-h-[300px]">
            {renderStepContent()}
          </div>

        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Ao continuar, você concorda com nossos{' '}
            <a href="/termos-de-uso" className="text-primary hover:underline">Termos de Uso</a>
            {' '}e{' '}
            <a href="/politica-privacidade" className="text-primary hover:underline">Política de Privacidade</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CadastroV2;
