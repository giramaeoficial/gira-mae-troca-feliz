
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useStepData } from '@/hooks/useStepData';
import { User } from 'lucide-react';

interface PersonalStepV2Props {
  onComplete: () => void;
}

interface PersonalFormData {
  nome: string;
  sobrenome: string;
  data_nascimento: string;
}

const PersonalStepV2: React.FC<PersonalStepV2Props> = ({ onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { saveStepData, getStepData } = useStepData();
  
  const [formData, setFormData] = useState<PersonalFormData>({
    nome: '',
    sobrenome: '',
    data_nascimento: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Carregar dados salvos do step e do perfil
  useEffect(() => {
    const loadData = async () => {
      try {
        // Primeiro, tentar carregar dados já salvos no perfil
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('nome, sobrenome, data_nascimento')
          .eq('id', user?.id)
          .single();

        if (!error && profile && profile.nome) {
          console.log('📋 Carregando dados do perfil:', profile);
          setFormData({
            nome: profile.nome || '',
            sobrenome: profile.sobrenome || '',
            data_nascimento: profile.data_nascimento || ''
          });
        } else {
          // Se não há dados no perfil, tentar carregar dados temporários
          const savedData = await getStepData('personal');
          if (savedData && Object.keys(savedData).length > 0) {
            console.log('📋 Carregando dados salvos do step personal:', savedData);
            setFormData(prev => ({ ...prev, ...savedData }));
          }
        }
      } catch (error) {
        console.error('⚠️ Erro ao carregar dados:', error);
      }
    };
    
    if (user) {
      loadData();
    }
  }, [user, getStepData]);

  const handleInputChange = (field: keyof PersonalFormData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // Salvar dados automaticamente
    saveStepData('personal', newData);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não encontrado.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.nome.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, insira seu nome.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('💾 Salvando dados pessoais:', formData);

      // Salvar dados no perfil permanente
      const { error } = await supabase
        .from('profiles')
        .update({
          nome: formData.nome.trim(),
          sobrenome: formData.sobrenome.trim(),
          data_nascimento: formData.data_nascimento || null,
          cadastro_step: 'address'
        })
        .eq('id', user.id);

      if (error) {
        console.error('❌ Erro ao salvar dados pessoais:', error);
        throw error;
      }

      console.log('✅ Dados pessoais salvos com sucesso');
      
      toast({
        title: "Dados salvos!",
        description: "Suas informações pessoais foram registradas.",
      });
      
      onComplete();
    } catch (error: any) {
      console.error('❌ Erro no salvamento:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-6 pb-5 pt-1">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Dados pessoais
        </h3>
        
        <p className="text-sm text-gray-600 mb-4">
          Conte-nos um pouco sobre você para personalizar sua experiência.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Nome *
            </label>
            <Input
              placeholder="Seu primeiro nome"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Sobrenome
            </label>
            <Input
              placeholder="Seu sobrenome"
              value={formData.sobrenome}
              onChange={(e) => handleInputChange('sobrenome', e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Data de Nascimento
            </label>
            <Input
              type="date"
              value={formData.data_nascimento}
              onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
        
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading || !formData.nome.trim()}
          className="w-full bg-primary hover:bg-primary/90 mt-6"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Salvando...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Continuar para Endereço
            </div>
          )}
        </Button>
        
        <p className="text-xs text-gray-500 mt-3 text-center">
          * Campos obrigatórios
        </p>
      </div>
    </div>
  );
};

export default PersonalStepV2;
