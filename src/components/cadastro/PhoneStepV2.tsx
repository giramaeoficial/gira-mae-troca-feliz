// src/components/cadastro/PhoneStepV2.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PhoneStepV2Props {
  onComplete: () => void;
}

const PhoneStepV2: React.FC<PhoneStepV2Props> = ({ onComplete }) => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Carregar dados salvos quando o componente monta
  useEffect(() => {
    const loadSavedData = async () => {
      if (!user) return;

      try {
        setIsLoadingData(true);
        
        // Verificar se já está salvo no perfil
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('telefone')
          .eq('id', user.id)
          .single();

        if (!profileError && profile?.telefone) {
          console.log('📱 Telefone encontrado no perfil:', profile.telefone);
          // Remover +55 e formatar para exibição
          const phoneNumber = profile.telefone.replace('+55', '');
          setPhone(formatPhone(phoneNumber));
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados salvos:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadSavedData();
  }, [user]);

  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica máscara: (XX) XXXXX-XXXX
    if (numbers.length <= 11) {
      if (numbers.length <= 2) {
        return numbers;
      } else if (numbers.length <= 6) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      } else if (numbers.length <= 11) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
      }
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const validatePhone = (phoneNumber: string) => {
    // Remove formatação para validação
    const numbers = phoneNumber.replace(/\D/g, '');
    
    // Deve ter pelo menos 10 dígitos (DDD + número)
    if (numbers.length < 10) {
      return false;
    }
    
    // Validação básica de DDD (códigos válidos do Brasil)
    const ddd = numbers.slice(0, 2);
    const validDDDs = [
      '11', '12', '13', '14', '15', '16', '17', '18', '19', // SP
      '21', '22', '24', // RJ/ES
      '27', '28', // ES
      '31', '32', '33', '34', '35', '37', '38', // MG
      '41', '42', '43', '44', '45', '46', // PR
      '47', '48', '49', // SC
      '51', '53', '54', '55', // RS
      '61', // DF
      '62', '64', // GO/TO
      '63', // TO
      '65', '66', // MT
      '67', // MS
      '68', // AC
      '69', // RO
      '71', '73', '74', '75', '77', // BA
      '79', // SE
      '81', '87', // PE
      '82', // AL
      '83', // PB
      '84', // RN
      '85', '88', // CE
      '86', '89', // PI
      '91', '93', '94', // PA
      '92', '97', // AM
      '95', // RR
      '96', // AP
      '98', '99' // MA
    ];
    
    return validDDDs.includes(ddd);
  };

  const handleSubmit = async () => {
    if (!phone.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, insira seu número de telefone.",
        variant: "destructive",
      });
      return;
    }

    if (!validatePhone(phone)) {
      toast({
        title: "Telefone inválido",
        description: "Por favor, insira um DDD e número válidos. Ex: (31) 99999-9999",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não encontrado. Tente fazer login novamente.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Salvar telefone no perfil do usuário
      const phoneNumbers = phone.replace(/\D/g, '');
      const formattedPhone = `+55${phoneNumbers}`;
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          telefone: formattedPhone,
          cadastro_step: 'code' // Avançar para próximo step
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Simular envio de SMS (implementar lógica real aqui)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "SMS enviado!",
        description: "Verifique sua caixa de mensagens.",
      });
      
      onComplete();
      
    } catch (error: any) {
      console.error('❌ Erro ao salvar telefone:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar o telefone. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="px-6 pb-5 pt-1">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-gray-600">Carregando dados...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-5 pt-1">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Adicione seu celular
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Vamos te enviar um código por SMS para validar seu número.
        </p>
        
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
            +55
          </span>
          <Input
            type="tel"
            placeholder="(31) 99999-9999"
            value={phone}
            onChange={handlePhoneChange}
            className="mb-4 pl-12"
            disabled={isLoading}
            maxLength={15}
          />
        </div>
        
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading || !phone.trim()}
          className="w-full bg-primary hover:bg-primary/90 transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Enviando SMS...
            </div>
          ) : (
            'Continuar'
          )}
        </Button>
        
        {phone && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Telefone será salvo como: +55{phone.replace(/\D/g, '')}
          </p>
        )}
      </div>
    </div>
  );
};

export default PhoneStepV2;
