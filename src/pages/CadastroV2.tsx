import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const { progress, loading, completeStep } = useCadastroProgress();
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

  // FASE 2: Lógica de auto-avanço melhorada para usuários já autenticados
  useEffect(() => {
    if (!loading && user && progress.step === 'google' && progress.status === 'incompleto' && !autoAdvanceProcessed) {
      console.log('✅ Usuário logado detectado, auto-avançando do step Google para Phone...');
      console.log('User ID:', user.id);
      console.log('Progress:', progress);
      
      setAutoAdvanceProcessed(true);
      
      // Pequeno delay para garantir que o estado foi atualizado
      setTimeout(() => {
        completeStep('google').then(success => {
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
      }, 100);
    }
  }, [loading, user, progress.step, progress.status, completeStep, autoAdvanceProcessed, toast]);

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
    const success = await completeStep(progress.step);
    if (success && progress.step === 'address') {
      // Cadastro completo
      toast({
        title: "Bem-vinda à GiraMãe!",
        description: "Seu cadastro foi finalizado com sucesso.",
      });
      navigate('/feed');
    }
  };

  const handleEditStep = (stepKey: string) => {
    // Só permite editar steps já completados
    const step = steps.find(s => s.key === stepKey);
    if (step?.completed) {
      // Lógica para voltar a um step anterior pode ser implementada aqui
      console.log('Editando step:', stepKey);
    }
  };

  const renderStepContent = () => {
    if (progress.status === 'completo') {
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
        return <PhoneStepV2 onComplete={handleStepComplete} />;
      case 'code':
        return <CodeStepV2 onComplete={handleStepComplete} />;
      case 'personal':
        return <PersonalStepV2 onComplete={handleStepComplete} />;
      case 'address':
        return <AddressStepV2 onComplete={handleStepComplete} />;
      default:
        return (
          <div className="p-6 text-center">
            <p className="text-gray-600">Carregando...</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Carregando progresso...</p>
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

            {/* FASE 1: Steps Indicator - Removido o título duplicado */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.key} className="flex items-center">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold cursor-pointer transition-colors ${
                        step.completed 
                          ? 'bg-green-500 text-white' 
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

            {/* FASE 3: Step Content - Melhor espaçamento */}
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
            Precisa de ajuda?{' '}
            <Link to="#" className="text-primary underline hover:text-primary/80">
              Fale conosco.
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm py-6 border-t border-pink-100">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <div className="text-xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent flex items-center justify-center mb-2">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            GiraMãe
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} GiraMãe. Feito com <Heart className="inline h-4 w-4 text-primary" /> por e para mães.</p>
        </div>
      </footer>
    </div>
  );
};

export default CadastroV2;
