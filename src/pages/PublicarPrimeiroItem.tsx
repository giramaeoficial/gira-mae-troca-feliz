
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Camera, Sparkles, Gift, ArrowRight, CheckCircle } from 'lucide-react';

const PublicarPrimeiroItem = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    titulo: '',
    categoria: '',
    tamanho: '',
    descricao: '',
    estado: '',
    preco: ''
  });

  const categorias = [
    'Roupas de Bebê',
    'Roupas Infantis',
    'Calçados',
    'Brinquedos',
    'Livros',
    'Acessórios',
    'Móveis Infantis',
    'Equipamentos'
  ];

  const estados = [
    'Novo - com etiqueta',
    'Novo - sem etiqueta',
    'Seminovo - excelente estado',
    'Seminovo - bom estado',
    'Usado - bom estado'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Simular publicação e ir para o feed
      navigate('/feed');
    }
  };

  const handleSkip = () => {
    navigate('/feed');
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-primary to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gift className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Vamos Publicar Seu Primeiro Item!</h2>
        <p className="text-gray-600">Comece com informações básicas sobre o item</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="titulo">Título do Item</Label>
          <Input
            id="titulo"
            placeholder="Ex: Vestido infantil rosa tamanho 2"
            value={formData.titulo}
            onChange={(e) => handleInputChange('titulo', e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="categoria">Categoria</Label>
          <Select value={formData.categoria} onValueChange={(value) => handleInputChange('categoria', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map(categoria => (
                <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="tamanho">Tamanho</Label>
          <Input
            id="tamanho"
            placeholder="Ex: 2 anos, M, 38, etc."
            value={formData.tamanho}
            onChange={(e) => handleInputChange('tamanho', e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Camera className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Detalhes do Item</h2>
        <p className="text-gray-600">Conte mais sobre o item para atrair interessados</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            placeholder="Descreva o item, suas características, por que está sendo oferecido..."
            value={formData.descricao}
            onChange={(e) => handleInputChange('descricao', e.target.value)}
            className="mt-1 h-24"
          />
        </div>

        <div>
          <Label htmlFor="estado">Estado de Conservação</Label>
          <Select value={formData.estado} onValueChange={(value) => handleInputChange('estado', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Como está o item?" />
            </SelectTrigger>
            <SelectContent>
              {estados.map(estado => (
                <SelectItem key={estado} value={estado}>{estado}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="preco">Preço em Girinhas</Label>
          <Input
            id="preco"
            type="number"
            placeholder="Ex: 15"
            value={formData.preco}
            onChange={(e) => handleInputChange('preco', e.target.value)}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Dica: Itens bem cuidados custam entre 10-30 Girinhas
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Adicionar Fotos</h2>
        <p className="text-gray-600">Fotos ajudam outros pais a verem como está o item</p>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Adicione até 5 fotos</h3>
          <p className="text-gray-500 mb-4">
            Arraste e solte imagens aqui ou clique para selecionar
          </p>
          <Button variant="outline" className="mb-2">
            <Camera className="w-4 h-4 mr-2" />
            Selecionar Fotos
          </Button>
          <p className="text-xs text-gray-400">
            Formatos aceitos: JPG, PNG, WEBP (máx. 5MB cada)
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">📸 Dicas para boas fotos:</h4>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Use boa iluminação natural</li>
            <li>• Mostre detalhes importantes</li>
            <li>• Inclua uma foto geral do item</li>
            <li>• Destaque o estado de conservação</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-white/90 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="bg-gradient-to-r from-primary to-pink-500 text-white rounded-t-lg">
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            Seu Primeiro Item na Comunidade
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-8">
          {/* Progress */}
          <div className="flex items-center justify-center space-x-2 mb-8">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    stepNum === step
                      ? 'bg-primary text-white'
                      : stepNum < step
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {stepNum < step ? <CheckCircle className="w-4 h-4" /> : stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-12 h-0.5 mx-2 ${stepNum < step ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Steps Content */}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between mt-8 pt-6 border-t border-gray-100">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-gray-600 hover:text-gray-800"
            >
              Fazer isso depois
            </Button>
            
            <div className="flex gap-2">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                >
                  Voltar
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white px-8"
              >
                {step === 3 ? (
                  <>
                    Publicar Item
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Help */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Precisa de ajuda? Nossa comunidade está aqui para apoiar você! 💚
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicarPrimeiroItem;
