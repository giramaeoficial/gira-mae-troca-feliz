import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Trophy, ArrowRight, CheckCircle, Heart, Lightbulb, Target, Zap } from 'lucide-react';
import { usePactoEntrada } from '@/hooks/usePactoEntrada';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SimpleItemForm } from '@/components/forms/SimpleItemForm';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const PublicarPrimeiroItem = () => {
  const navigate = useNavigate();
  const [currentItem, setCurrentItem] = useState(1);
  const { itensPublicados } = usePactoEntrada();
  
  const [formData, setFormData] = useState({
    titulo: '',
    categoria_id: '',
    subcategoria: '',
    genero: '',
    tamanho_categoria: '',
    tamanho_valor: '',
    estado_conservacao: '',
    preco: '',
    descricao: '',
    imagens: [] as File[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro quando campo é alterado
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.titulo.trim()) newErrors.titulo = 'Título obrigatório';
    if (!formData.categoria_id) newErrors.categoria_id = 'Categoria obrigatória';
    if (!formData.descricao.trim()) newErrors.descricao = 'Descrição obrigatória';
    if (!formData.estado_conservacao) newErrors.estado_conservacao = 'Estado obrigatório';
    if (!formData.preco) newErrors.preco = 'Preço obrigatório';
    if (!formData.imagens || formData.imagens.length === 0) newErrors.imagens = 'Pelo menos 1 foto é obrigatória';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateForm()) return;
    
    if (currentItem === 1) {
      setCurrentItem(2);
      // Reset form for second item
      setFormData({
        titulo: '',
        categoria_id: '',
        subcategoria: '',
        genero: '',
        tamanho_categoria: '',
        tamanho_valor: '',
        estado_conservacao: '',
        preco: '',
        descricao: '',
        imagens: []
      });
      setErrors({});
    } else {
      // Aqui seria onde salvaria os dados, mas por agora apenas navega
      navigate('/missoes');
    }
  };

  const progressoPercentual = (currentItem / 2) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header com Missão */}
        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-gray-800">🎯 MISSÃO OBRIGATÓRIA #1</h1>
                  <Badge variant="destructive" className="text-xs">OBRIGATÓRIA</Badge>
                </div>
                <p className="text-gray-600">Anunciar 2 itens para venda por Girinhas</p>
              </div>
            </div>

            <div className="bg-white/60 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-orange-600" />
                <h4 className="font-semibold text-gray-800">💝 Por que esta missão existe:</h4>
              </div>
              <p className="text-gray-700 text-sm mb-2">
                Para manter nossa comunidade <strong>ativa e justa</strong>, todas as mães 
                contribuem anunciando itens para venda.
              </p>
              <p className="text-xs text-gray-600">
                (Não precisa vender, apenas anunciar com fotos reais)
              </p>
            </div>

            <div className="flex items-center gap-2 bg-green-100 rounded-lg p-3">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-green-800 font-semibold text-sm">
                🎁 Recompensa: 100 Girinhas ao completar!
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Dicas Motivacionais */}
        <Alert className="border-blue-200 bg-blue-50">
          <Lightbulb className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            <strong>💡 Toda casa com crianças tem itens para vender:</strong>
            <br />✅ Roupas que não servem mais • ✅ Brinquedos esquecidos • ✅ Livros já lidos • ✅ Sapatos pequenos
          </AlertDescription>
        </Alert>

        {/* Progress */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-sm border">
            <Heart className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-medium">Item {currentItem} de 2</span>
            <span className="text-xs text-gray-500">• Você está quase lá!</span>
          </div>
          <div className="max-w-xs mx-auto">
            <Progress value={progressoPercentual} className="h-2" />
          </div>
        </div>

        {/* Form Card - Igual ao PublicarItem */}
        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-t-lg">
            <CardTitle className="text-xl font-semibold text-center flex items-center justify-center gap-2">
              <Upload className="w-5 h-5" />
              Anunciar Item {currentItem} para Venda
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            <form className="space-y-6">
              <SimpleItemForm
                formData={formData}
                onFieldChange={handleFieldChange}
                errors={errors}
              />
              
              <div className="pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  onClick={handleNext}
                  className="w-full h-12 text-base bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg rounded-lg transition-all duration-200"
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
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Mensagem de Encorajamento */}
        {currentItem === 1 && (
          <div className="text-center bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p className="text-purple-700 text-sm font-medium">
              🏠 <strong>Olhe no quarto das crianças:</strong> sempre tem algo que não usa mais!
            </p>
            <p className="text-purple-600 text-xs mt-1">
              📱 Super rápido: cada item leva apenas 3 minutos para cadastrar
            </p>
          </div>
        )}

        {/* Footer Info */}
        <div className="text-center text-xs text-gray-500 space-y-1 pb-8">
          <p>⚡ Esta é a única missão obrigatória da plataforma</p>
          <p>🔒 Após completar, você terá acesso total ao sistema</p>
          <p>💪 Milhares de mães já completaram esta missão!</p>
        </div>
      </div>
    </div>
  );
};

export default PublicarPrimeiroItem;
