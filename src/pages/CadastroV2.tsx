// src/pages/CadastroV2.tsx - VERSÃO CORRIGIDA

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

  // 📊 MAPEAMENTO DE STEPS: Definir steps baseado no progresso
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
    
    console.log('📊 Steps atualizados:', {
      progressStep: progress.step,
      progressStatus: progress.status,
      currentStepIndex,
      steps: newSteps.map(s => ({ key: s.key, completed: s.completed, active: s.active }))
    });
  }, [progress]);

  // 🎯 AUTO-AVANÇO INTELIGENTE: Só para usuários recém-logados no step Google
  useEffect(() => {
    // Só processar auto-avanço se:
    // 1. Não está carregando
    // 2. Usuário está logado
    // 3. Está no step 'google' (recém-logado)
    // 4. Status é incompleto (não terminou cadastro)
    // 5. Ainda não processou auto-avanço
    const shouldAutoAdvance = !loading && 
                             user && 
                             progress.step === 'google' && 
                             progress.status === 'incompleto' && 
                             !autoAdvanceProcessed;

    if (shouldAutoAdvance) {
      console.log('🚀 AUTO-AVANÇO: Usuário logado detectado no step Google, avançando para Phone...');
      console.log('User ID:', user.id);
      console.log('Progress:', progress);
      
      setAutoAdvanceProcessed(true);
      
      // Pequeno delay para garantir estabilidade
      setTimeout(() => {
        completeStep('google').then(success => {
          if (success) {
            console.log('✅ Auto-avanço concluído com sucesso: Google -> Phone');
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
    } else {
      console.log('⏭️ AUTO-AVANÇO não necessário:', {
        loading,
        hasUser: !!user,
        step: progress.step,
        status: progress.status,
        processed: autoAdvanceProcessed
      });
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
    console.log('🔄 Completando step atual:', progress.step);
    
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
    // 🔙 NAVEGAÇÃO PARA TRÁS: Permitir voltar para steps já completados
    const step = steps.find(s => s.key === stepKey);
    if (step?.completed) {
      console.log('🔙 Editando step anterior:', stepKey);
      // Implementar lógica para voltar pode ser feita aqui
      // Por enquanto, apenas log para debug
    }
  };

  const renderStepContent = () => {
    // 🎉 CADASTRO COMPLETO
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
          <Link
            to="/feed"
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Começar a usar a GiraMãe
          </Link>
        </div>
      );
    }

    // 📱 RENDERIZAR STEP ATUAL
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
          <div className="bg-white border-t border-gray-100 p-6 text-center">
            <p className="text-gray-600">Step não reconhecido: {progress.step}</p>
          </div>
        );
    }
  };

  // 🔄 LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <Header hideMenuItems={true} />
        <div className="flex items-center justify-center min-h-[80vh]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <Header hideMenuItems={true} />
      
      <div className="max-w-md mx-auto pt-8 pb-12 px-4">
        {/* 🎨 HEADER */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Bem-vinda à GiraMãe!
          </h1>
          <p className="text-gray-600">
            Vamos completar seu cadastro em alguns passos
          </p>
        </div>

        {/* 📊 INDICADOR DE PROGRESSO */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div
                key={step.key}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors ${
                    step.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : step.active
                      ? 'bg-primary border-primary text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}
                  onClick={() => handleEditStep(step.key)}
                >
                  {step.completed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-colors ${
                      step.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <h3 className="font-medium text-gray-900">
              {steps.find(s => s.active)?.title || 'Carregando...'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Passo {steps.findIndex(s => s.active) + 1} de {steps.length}
            </p>
          </div>
        </div>

        {/* 📋 CONTEÚDO DO STEP */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {renderStepContent()}
        </div>

        {/* 🔗 LINK PARA LOGIN */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link
              to="/login"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CadastroV2;
