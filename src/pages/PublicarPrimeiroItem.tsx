
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Camera, AlertTriangle, Trophy, Ban, ArrowRight, CheckCircle } from 'lucide-react';
import { usePactoEntrada } from '@/hooks/usePactoEntrada';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PublicarPrimeiroItem = () => {
  const navigate = useNavigate();
  const [currentItem, setCurrentItem] = useState(1);
  const { itensPublicados } = usePactoEntrada();
  
  const [formData, setFormData] = useState({
    titulo: '',
    categoria: '',
    tamanho: '',
    descricao: '',
    estado: '',
    preco: '',
    fotos: [] as File[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categorias = [
    'Roupas de Bebê',
    'Roupas Infantis', 
    'Calçados',
    'Brinquedos',
    'Livros',
    'Acessórios'
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
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, fotos: files }));
    if (errors.fotos) {
      setErrors(prev => ({ ...prev, fotos: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.titulo.trim()) newErrors.titulo = 'Título obrigatório';
    if (!formData.categoria) newErrors.categoria = 'Categoria obrigatória';
    if (!formData.descricao.trim()) newErrors.descricao = 'Descrição obrigatória';
    if (!formData.estado) newErrors.estado = 'Estado obrigatório';
    if (!formData.preco) newErrors.preco = 'Preço obrigatório';
    if (formData.fotos.length === 0) newErrors.fotos = 'Pelo menos 1 foto é obrigatória';
    
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
        categoria: '',
        tamanho: '',
        descricao: '',
        estado: '',
        preco: '',
        fotos: []
      });
      setErrors({});
    } else {
      // Redirect to missions page after completing both items
      navigate('/missoes');
    }
  };

  const handlePostpone = () => {
    navigate('/feed');
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
          
          <CardContent className="p-4 space-y-4">
            {/* Photos - Required */}
            <div>
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Fotos do Item <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="fotos"
                />
                <label
                  htmlFor="fotos"
                  className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-primary transition-colors"
                >
                  <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {formData.fotos.length > 0 
                      ? `${formData.fotos.length} foto(s) selecionada(s)` 
                      : 'Toque para adicionar fotos'
                    }
                  </span>
                </label>
              </div>
              {errors.fotos && <p className="text-red-500 text-xs mt-1">{errors.fotos}</p>}
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="titulo" className="text-sm font-medium text-gray-700">
                Título do Anúncio <span className="text-red-500">*</span>
              </Label>
              <Input
                id="titulo"
                placeholder="Ex: Vestido infantil rosa tamanho 2"
                value={formData.titulo}
                onChange={(e) => handleInputChange('titulo', e.target.value)}
                className="mt-1"
              />
              {errors.titulo && <p className="text-red-500 text-xs mt-1">{errors.titulo}</p>}
            </div>

            {/* Category */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Categoria <span className="text-red-500">*</span>
              </Label>
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
              {errors.categoria && <p className="text-red-500 text-xs mt-1">{errors.categoria}</p>}
            </div>

            {/* Size */}
            <div>
              <Label htmlFor="tamanho" className="text-sm font-medium text-gray-700">
                Tamanho
              </Label>
              <Input
                id="tamanho"
                placeholder="Ex: 2 anos, M, 38..."
                value={formData.tamanho}
                onChange={(e) => handleInputChange('tamanho', e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="descricao" className="text-sm font-medium text-gray-700">
                Descrição <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="descricao"
                placeholder="Descreva detalhadamente o item..."
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                className="mt-1 h-20"
              />
              {errors.descricao && <p className="text-red-500 text-xs mt-1">{errors.descricao}</p>}
            </div>

            {/* Condition */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Estado de Conservação <span className="text-red-500">*</span>
              </Label>
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
              {errors.estado && <p className="text-red-500 text-xs mt-1">{errors.estado}</p>}
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="preco" className="text-sm font-medium text-gray-700">
                Preço em Girinhas <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="preco"
                  type="number"
                  placeholder="25"
                  value={formData.preco}
                  onChange={(e) => handleInputChange('preco', e.target.value)}
                />
                <span className="text-sm text-gray-600 whitespace-nowrap">Girinhas</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">1 Girinha = R$ 1,00</p>
              {errors.preco && <p className="text-red-500 text-xs mt-1">{errors.preco}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleNext}
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
