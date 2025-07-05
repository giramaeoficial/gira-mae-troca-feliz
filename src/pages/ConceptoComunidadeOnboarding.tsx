
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, DollarSign, Shield, Trophy, ArrowRight, Zap, Target } from 'lucide-react';

const ConceptoComunidadeOnboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Users,
      title: "Bem-vinda à GiraMãe!",
      subtitle: "A plataforma de vendas entre mães",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 text-center">
            Aqui você <strong>vende</strong> e <strong>compra</strong> itens infantis usando nossa moeda interna: 
            as <strong>Girinhas</strong> (1 Girinha = R$ 1,00).
          </p>
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">💰 Como funciona:</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Você anuncia seus itens por Girinhas</li>
              <li>• Outras mães compram com Girinhas</li>
              <li>• Você usa suas Girinhas para comprar de outras mães</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      icon: DollarSign,
      title: "Sistema de Girinhas",
      subtitle: "Nossa moeda interna vale dinheiro real",
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl mb-2">💰</div>
            <p className="text-xl font-bold text-green-600">1 Girinha = R$ 1,00</p>
          </div>
          <div className="space-y-3">
            <div className="bg-green-50 rounded-lg p-3">
              <h4 className="font-semibold text-green-800">💸 Para Ganhar Girinhas:</h4>
              <p className="text-green-700 text-sm">Venda seus itens para outras mães</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <h4 className="font-semibold text-purple-800">🛒 Para Gastar Girinhas:</h4>
              <p className="text-purple-700 text-sm">Compre itens de outras mães</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <h4 className="font-semibold text-orange-800">🔄 Para Converter:</h4>
              <p className="text-orange-700 text-sm">Compre mais Girinhas quando precisar</p>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: Shield,
      title: "Ambiente Seguro",
      subtitle: "Comunidade verificada e protegida",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 text-center">
            Levamos a segurança a sério. Aqui não é bagunça!
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-red-50 rounded-lg p-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 font-bold text-sm">!</span>
              </div>
              <div>
                <h4 className="font-semibold text-red-800">Tolerância Zero</h4>
                <p className="text-red-700 text-sm">Itens falsos ou inadequados = banimento</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-green-50 rounded-lg p-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-green-800">Avaliações</h4>
                <p className="text-green-700 text-sm">Sistema de reputação confiável</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: Trophy,
      title: "Sua Primeira Missão",
      subtitle: "TODOS contribuem, inclusive você!",
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-orange-600" />
              <h4 className="font-bold text-orange-800">MISSÃO OBRIGATÓRIA #1</h4>
            </div>
            <div className="bg-white/60 rounded-lg p-3 mb-3">
              <p className="font-semibold text-gray-800 mb-2">🎯 O que você deve fazer:</p>
              <p className="text-gray-700 text-sm mb-2">
                Anuncie <strong>2 itens</strong> para venda na plataforma
              </p>
              <p className="text-xs text-gray-600">
                (Não precisa vender, apenas anunciar com fotos reais)
              </p>
            </div>
            <div className="flex items-center gap-2 bg-green-100 rounded-lg p-2">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-green-800 font-semibold text-sm">
                Recompensa: 100 Girinhas!
              </span>
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">⚡ Por que essa missão?</h4>
            <p className="text-yellow-700 text-sm">
              Para ter acesso completo à plataforma, você precisa contribuir também. 
              Afinal, <strong>TODOS aqui contribuem</strong> para manter a comunidade ativa!
            </p>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/publicar-primeiro-item');
    }
  };

  const handleSkip = () => {
    navigate('/publicar-primeiro-item');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto">
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-800 mb-2">
                {currentStepData.title}
              </h1>
              <p className="text-gray-600">
                {currentStepData.subtitle}
              </p>
            </div>

            {/* Content */}
            <div className="mb-6">
              {currentStepData.content}
            </div>

            {/* Progress */}
            <div className="flex items-center justify-center space-x-2 mb-6">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-primary'
                      : index < currentStep
                      ? 'bg-primary/60'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleNext}
                className="w-full h-12 bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white font-medium"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    Começar Primeira Missão
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              
              {currentStep < steps.length - 1 && (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="w-full text-gray-600"
                >
                  Pular apresentação
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConceptoComunidadeOnboarding;
