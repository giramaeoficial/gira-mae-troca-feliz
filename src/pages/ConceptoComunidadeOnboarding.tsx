
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Heart, Users, Recycle, Shield, ArrowRight, Gift, Star, Zap } from 'lucide-react';

const ConceptoComunidadeOnboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Users,
      title: "Bem-vinda à Comunidade GiraMãe!",
      subtitle: "Você agora faz parte de uma rede especial de mães",
      content: (
        <div className="text-center space-y-4">
          <p className="text-gray-600 text-lg">
            Aqui, mães como você compartilham, trocam e se apoiam mutuamente, 
            criando um ambiente seguro e acolhedor para toda a família.
          </p>
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">🌟 Você não está sozinha!</h4>
            <p className="text-gray-600 text-sm">
              Milhares de mães já fazem parte desta comunidade incrível
            </p>
          </div>
        </div>
      )
    },
    {
      icon: Heart,
      title: "O Poder da Economia Solidária",
      subtitle: "Juntas somos mais fortes e econômicas",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Na GiraMãe, acreditamos que compartilhar é cuidar. Cada item que você oferece 
            ajuda outra família e cada item que você recebe vem carregado de carinho.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <Gift className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-green-800">Economize</h4>
              <p className="text-green-600 text-sm">Até 80% em itens infantis</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <Recycle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-800">Sustentável</h4>
              <p className="text-blue-600 text-sm">Reduza o desperdício</p>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: Shield,
      title: "Segurança e Confiança",
      subtitle: "Trocas protegidas e comunidade verificada",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Todas as mamães passam por verificação e nosso sistema de reputação 
            garante que você sempre tenha trocas seguras e confiáveis.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-green-50 rounded-lg p-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Sistema de Avaliações</h4>
                <p className="text-gray-600 text-sm">Avalie e seja avaliada após cada troca</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-blue-50 rounded-lg p-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Perfis Verificados</h4>
                <p className="text-gray-600 text-sm">Todos os usuários são verificados</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: Zap,
      title: "Pronta para Começar?",
      subtitle: "Agora você vai publicar seu primeiro item!",
      content: (
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            O próximo passo é publicar seu primeiro item na comunidade. 
            Pode ser uma roupa que não serve mais, um brinquedo que não é usado, 
            ou qualquer coisa que possa fazer outra família feliz!
          </p>
          <div className="bg-gradient-to-r from-primary/10 to-pink-500/10 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">🎁 Bônus de Boas-vindas</h4>
            <p className="text-gray-600 text-sm">
              Você já recebeu <span className="font-bold text-primary">50 Girinhas</span> para começar suas trocas!
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
    navigate('/feed');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-white/90 backdrop-blur-sm shadow-2xl border-0">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-primary to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              {currentStepData.title}
            </h1>
            <p className="text-lg text-gray-600">
              {currentStepData.subtitle}
            </p>
          </div>

          {/* Content */}
          <div className="mb-8">
            {currentStepData.content}
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center space-x-2 mb-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
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
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-gray-600 hover:text-gray-800"
            >
              Pular apresentação
            </Button>
            
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white px-8"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Publicar Primeiro Item
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConceptoComunidadeOnboarding;
