
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface PersonalStepV2Props {
  onComplete: () => void;
}

const PersonalStepV2: React.FC<PersonalStepV2Props> = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    nome: '',
    bio: '',
    profissao: '',
    instagram: '',
    telefone: '',
    data_nascimento: '',
    interesses: [] as string[],
    categorias_favoritas: [] as string[]
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const interessesDisponiveis = [
    'Sustentabilidade', 'Economia Circular', 'Maternidade', 'Educação',
    'Brinquedos Educativos', 'Roupas Infantis', 'Livros', 'Esportes'
  ];

  const categoriasDisponiveis = [
    'Roupas', 'Calçados', 'Brinquedos', 'Livros', 'Acessórios', 'Móveis'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleItem = (item: string, field: 'interesses' | 'categorias_favoritas') => {
    const currentItems = formData[field];
    const newItems = currentItems.includes(item)
      ? currentItems.filter(i => i !== item)
      : [...currentItems, item];
    handleInputChange(field, newItems);
  };

  const handleSubmit = async () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, insira seu nome.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simular salvamento dos dados (implementar lógica real aqui)
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Dados salvos!",
        description: "Informações pessoais registradas com sucesso.",
      });
      onComplete();
    }, 2000);
  };

  return (
    <div className="px-6 pb-5 pt-1">
      <div className="max-h-96 overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Dados pessoais
        </h3>
        
        <div className="space-y-4">
          <Input
            placeholder="Nome completo *"
            value={formData.nome}
            onChange={(e) => handleInputChange('nome', e.target.value)}
            disabled={isLoading}
          />
          
          <Textarea
            placeholder="Conte um pouco sobre você..."
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            disabled={isLoading}
          />
          
          <Input
            placeholder="Profissão"
            value={formData.profissao}
            onChange={(e) => handleInputChange('profissao', e.target.value)}
            disabled={isLoading}
          />
          
          <Input
            placeholder="Instagram (@usuario)"
            value={formData.instagram}
            onChange={(e) => handleInputChange('instagram', e.target.value)}
            disabled={isLoading}
          />
          
          <Input
            type="date"
            placeholder="Data de nascimento"
            value={formData.data_nascimento}
            onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
            disabled={isLoading}
          />

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Seus interesses
            </label>
            <div className="flex flex-wrap gap-2">
              {interessesDisponiveis.map((interesse) => (
                <Badge
                  key={interesse}
                  variant={formData.interesses.includes(interesse) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleItem(interesse, 'interesses')}
                >
                  {interesse}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Categorias favoritas
            </label>
            <div className="flex flex-wrap gap-2">
              {categoriasDisponiveis.map((categoria) => (
                <Badge
                  key={categoria}
                  variant={formData.categorias_favoritas.includes(categoria) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleItem(categoria, 'categorias_favoritas')}
                >
                  {categoria}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={handleSubmit} 
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90 mt-4"
      >
        {isLoading ? 'Salvando...' : 'Salvar Dados'}
      </Button>
    </div>
  );
};

export default PersonalStepV2;
