import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingStep } from '@/hooks/useOnboardingStep';
import PhoneStepV2 from '@/components/cadastro/PhoneStepV2';
import LoadingSpinner from '@/components/loading/LoadingSpinner';

const WhatsAppOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { completeWhatsAppStep, isCompletingWhatsApp } = useOnboardingStep();

  const handlePhoneComplete = async () => {
    // ✅ NAVEGAÇÃO CONTROLADA: Só avança pelo botão apropriado
    completeWhatsAppStep();
  };

  const ProgressDots = () => (
    <div className="flex justify-center gap-2 mb-6">
      <div className="w-3 h-3 bg-primary rounded-full"></div>
      <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
      <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
      <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
      <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
      <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-primary mb-2">
            GiraMãe
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/auth')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
          <span className="text-sm text-gray-500">Etapa 1 de 5</span>
        </div>

        {/* Progress */}
        <ProgressDots />

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🚀 Bem-vinda à GiraMãe!
          </h1>
          <p className="text-gray-600">
            Vamos começar com seu WhatsApp
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <PhoneStepV2 
            onComplete={handlePhoneComplete}
          />
        </div>

        {/* Loading overlay */}
        {isCompletingWhatsApp && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <LoadingSpinner className="w-5 h-5 text-primary" />
              <span className="text-gray-600">Avançando para próximo step...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppOnboarding;