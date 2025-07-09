import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/hooks/useOnboarding';
import SimpleAddressForm from '@/components/address/SimpleAddressForm';
import { useUserAddress } from '@/hooks/useUserAddress';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import { Button } from '@/components/ui/button';

const EnderecoOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { profile, loading, updating, updateStatus, navigateToNext, navigateBack } = useOnboarding();
  const { userAddress, isLoading: addressLoading } = useUserAddress();

  if (loading || addressLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  const handleContinue = async () => {
    const success = await updateStatus('itens');
    if (success) {
      navigateToNext('itens');
    }
  };

  const ProgressDots = () => (
    <div className="flex justify-center gap-2 mb-6">
      <div className="w-3 h-3 bg-primary rounded-full"></div>
      <div className="w-3 h-3 bg-primary rounded-full"></div>
      <div className="w-3 h-3 bg-primary rounded-full"></div>
      <div className="w-3 h-3 bg-primary rounded-full"></div>
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
            onClick={navigateBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
          <span className="text-sm text-gray-500">Etapa 4 de 6</span>
        </div>

        {/* Progress */}
        <ProgressDots />

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🏠 Onde você mora?
          </h1>
          <p className="text-gray-600">
            Seu endereço ajuda outras mães a encontrarem itens próximos
          </p>
        </div>

        {/* Address Form Component */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <SimpleAddressForm />
        </div>

        {/* Continue Button - only show when address is saved */}
        {userAddress && (
          <div className="mt-6">
            <Button
              onClick={handleContinue}
              disabled={updating}
              className="w-full py-3 text-lg font-semibold"
            >
              {updating ? (
                <>
                  <LoadingSpinner className="w-5 h-5 mr-2" />
                  Salvando progresso...
                </>
              ) : (
                'Continuar para próxima etapa'
              )}
            </Button>
          </div>
        )}

        {/* Loading overlay */}
        {updating && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <LoadingSpinner className="w-5 h-5 text-primary" />
              <span className="text-gray-600">Salvando progresso...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnderecoOnboarding;