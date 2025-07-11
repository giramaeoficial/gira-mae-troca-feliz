
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePublicarItemFormV2 } from '@/hooks/usePublicarItemFormV2';
import { SimpleItemForm } from '@/components/forms/SimpleItemForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trophy, Ban, ArrowRight, CheckCircle } from 'lucide-react';

const PublicarPrimeiroItem = () => {
  const navigate = useNavigate();
  const [currentItem, setCurrentItem] = useState(1);
  
  const {
    formData,
    updateFormData,
    errors,
    loading,
    handleSubmit
  } = usePublicarItemFormV2({
    status: 'inativo',
    isMission: true,
    currentItem,
    onSuccess: () => {
      if (currentItem === 1) {
        setCurrentItem(2);
        // Reset form for second item
        updateFormData({
          titulo: '',
          descricao: '',
          categoria_id: '',
          subcategoria: '',
          genero: 'unissex',
          tamanho_categoria: '',
          tamanho_valor: '',
          estado_conservacao: 'usado',
          preco: '',
          imagens: []
        });
      } else {
        window.location.reload();
      }
    }
  });

  const handleNext = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    await handleSubmit(e || new Event('submit') as any);
  };

  const handlePostpone = () => {
    navigate('/feed');
  };

  const handleFieldChange = (field: string, value: any) => {
    updateFormData({ [field]: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header with Mission Info - Mobile First */}
        <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">MISSÃO OBRIGATÓRIA #1</h1>
                <p className="text-sm text-gray-600">Anunciar 2 itens para venda</p>
              </div>
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-800 mb-2">
                🎯 <strong>A REAL:</strong> Aqui TODOS contribuem! 
              </p>
              <p className="text-xs text-gray-700">
                Você vende por <strong>Girinhas</strong> (1 Girinha = R$ 1,00) e pode comprar de outras mães. 
                Esta é a ÚNICA missão obrigatória para ter acesso completo.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Warning Alert */}
        <Alert className="border-red-200 bg-red-50">
          <Ban className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700 text-sm">
            <strong>ATENÇÃO:</strong> Itens falsos ou inadequados resultam em banimento da plataforma. 
            Aqui não é bagunça!
          </AlertDescription>
        </Alert>

        {/* Progress */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm">
            <span className="text-sm font-medium">Item {currentItem} de 2</span>
            <div className="flex gap-1">
              <div className={`w-2 h-2 rounded-full ${currentItem >= 1 ? 'bg-primary' : 'bg-gray-200'}`} />
              <div className={`w-2 h-2 rounded-full ${currentItem >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary to-pink-500 text-white">
            <CardTitle className="text-center text-lg">
              Anunciar Item {currentItem} para Venda
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-4">
            <SimpleItemForm
              formData={formData}
              onFieldChange={handleFieldChange}
              errors={errors}
              isMission={true}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleNext}
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white font-medium"
          >
            {currentItem === 1 ? (
              <>
                Próximo Item
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Finalizar Missão
                <CheckCircle className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          
          <Button
            variant="ghost"
            onClick={handlePostpone}
            className="w-full text-gray-600"
          >
            Cadastrar depois (acesso limitado)
          </Button>
        </div>

        {/* Footer Info */}
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>⚡ Após completar esta missão você ganha 100 Girinhas!</p>
          <p>🔒 Esta é a única missão obrigatória da plataforma</p>
        </div>
      </div>
    </div>
  );
};

export default PublicarPrimeiroItem;
