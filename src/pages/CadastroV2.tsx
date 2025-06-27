
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle } from 'lucide-react';
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
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { progress, loading: progressLoading, completeStep, updateProgress } = useCadastroProgress();
  const [steps, setSteps] = useState<Step[]>([]);
  const [initialProcessing, setInitialProcessing] = useState(true);

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

  // Auto-avanço apenas do step Google
  useEffect(() => {
    const handleAutoAdvance = async () => {
      if (authLoading || progressLoading) {
        return;
      }

      if (!user) {
        setInitialProcessing(false);
        return;
      }

      // Apenas auto-avançar do step Google se usuário está logado
      if (progress.step === 'google' && progress.status === 'incompleto') {
        console.log('✅ Usuário logado detectado, auto-avançando do step Google...');
        
        try {
          const success = await completeStep('google');
          if (success) {
            toast({
              title: "Bem-vindo!",
              description: "Vamos completar seu cadastro.",
            });
          }
        } catch (error) {
          console.error('❌ Erro no auto-avanço:', error);
        }
      }

      setInitialProcessing(false);
    };

    handleAutoAdvance();
  }, [authLoading, progressLoading, user, progress.step, progress.status, completeStep, toast]);

  const getStepTitle = (stepKey: string) => {
    const titles = {
      google: 'Entrar com Google',
      phone: 'Adicione seu celular',
      code: 'Insira o código',
      personal: 'Dados pessoais',
      address: 'Endereço'
    };
    return titles[stepKey as keyof typeof titles] || stepKey;
  };

  const handleStepComplete = async () => {
    console.log('📋 Completando step atual:', progress.step);
    
    // Não auto-avançar steps que precisam de verificação manual
    if (progress.step === 'phone' || progress.step === 'code') {
      console.log('⚠️ Step requer verificação manual:', progress.step);
      return;
    }
    
    const success = await completeStep(progress.step);
    
    if (success && progress.step === 'address') {
      // Cadastro completo
      toast({
        title: "Bem-vinda à GiraMãe!",
        description: "Seu cadastro foi finalizado com sucesso.",
      });
      setTimeout(() => {
        navigate('/feed');
      }, 1500);
    }
  };

  const handleEditStep = async (stepKey: string) => {
    const step = steps.find(s => s.key === stepKey);
    const stepOrder = ['google', 'phone', 'code', 'personal', 'address'];
    const targetStepIndex = stepOrder.indexOf(stepKey);
    const currentStepIndex = stepOrder.indexOf(progress.step);
    
    // Só permite voltar para steps já completados (exceto phone/code se telefone já foi verificado)
    if (step?.completed && targetStepIndex < currentStepIndex) {
      // Verificar se pode voltar para phone/code steps
      if (stepKey === 'phone' || stepKey === 'code') {
        toast({
          title: "Step não editável",
          description: "Telefone já foi verificado e não pode ser alterado.",
          variant: "destructive",
        });
        return;
      }
      
      console.log('🔙 Voltando para step anterior:', stepKey);
      
      const success = await updateProgress(stepKey);
      if (success) {
        toast({
          title: "Voltando...",
          description: `Retornando para: ${getStepTitle(stepKey)}`,
        });
      }
    } else if (targetStepIndex >= currentStepIndex) {
      toast({
        title: "Não é possível pular steps",
        description: "Complete o step atual primeiro.",
        variant: "destructive",
      });
    }
  };

  const renderStepContent = () => {
    if (progress.status === 'completo' || progress.step === 'cadastro_completo') {
      return (
        <div className="bg-white border-t border-gray-100 p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-bold text-green-800 mb-2">
            Cadastro realizado com sucesso!
          </h3>
          <p className="text-sm text-green-600 mb-4">
            Sua conta foi criada e você já está logado.
          </p>
          
          <button 
            onClick={() => navigate('/feed')}
            className="w-full bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white font-medium py-3 px-4 rounded-lg shadow-lg transition-all duration-200"
          >
            Entrar na Plataforma
          </button>
        </div>
      );
    }

    switch (progress.step) {
      case 'google':
        return <GoogleStepV2 onComplete={handleStepComplete} />;
      case 'phone':
        return <PhoneStepV2 onComplete={() => completeStep('phone')} />;
      case 'code':
        return <CodeStepV2 onComplete={() => completeStep('code')} />;
      case 'personal':
        return <PersonalStepV2 onComplete={handleStepComplete} />;
      case 'address':
        return <AddressStepV2 onComplete={handleStepComplete} />;
      default:
        return (
          <div className="p-6 text-center">
            <LoadingSpinner />
            <p className="mt-2 text-gray-600">Carregando step...</p>
          </div>
        );
    }
  };

  // Loading inicial
  if (authLoading || progressLoading || initialProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Carregando cadastro...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <Header />
      
      <div className="flex-1 flex items-center justify-center p-4 pt-8">
        <div className="max-w-md w-full animate-fade-in-up">
          <div className="bg-white/80 backdrop-blur-sm border border-pink-100 rounded-2xl mb-6 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-pink-100 bg-gradient-to-r from-primary/5 to-pink-500/5">
              <div className="text-center mb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                  Criar sua conta
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Junte-se à comunidade de mães que compartilham e economizam
                </p>
              </div>
            </div>

            {/* Steps Indicator */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.key} className="flex items-center">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold cursor-pointer transition-colors ${
                        step.completed 
                          ? 'bg-green-500 text-white hover:bg-green-600' 
                          : step.active 
                            ? 'bg-primary text-white' 
                            : 'bg-gray-200 text-gray-600'
                      }`}
                      onClick={() => handleEditStep(step.key)}
                    >
                      {step.completed ? <CheckCircle className="w-4 h-4" /> : index + 1}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-6 h-0.5 mx-2 ${step.completed ? 'bg-green-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="min-h-[300px]">
              {renderStepContent()}
            </div>

            {/* Bônus sempre visível */}
            <div className="bg-gradient-to-r from-primary/10 via-pink-500/10 to-purple-100 p-4 rounded-xl m-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-semibold text-gray-800">Bônus de Boas-vindas</span>
              </div>
              <p className="text-sm text-gray-700">
                Você começará com <span className="font-bold text-primary">50 Girinhas</span> de presente 
                para fazer suas primeiras trocas na comunidade!
              </p>
            </div>

            {/* Link para login */}
            <div className="text-center text-sm p-4">
              Já tem uma conta?{" "}
              <Link to="/auth" className="underline text-primary font-medium">
                Faça login aqui
              </Link>
            </div>
          </div>

          {/* Help section */}
          <p className="text-xs text-center text-gray-600 mt-4">
            Precisa de ajuda?{" "}
            <Link to="/support" className="underline">
              Fale conosco
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CadastroV2;
