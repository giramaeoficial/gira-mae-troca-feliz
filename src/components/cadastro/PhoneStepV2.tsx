// Arquivo: src/components/cadastro/PhoneStepV2.tsx

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MessageCircle, Phone } from 'lucide-react';

interface PhoneStepV2Props {
  onComplete: () => void;
}

const PhoneStepV2: React.FC<PhoneStepV2Props> = ({ onComplete }) => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [useWhatsApp, setUseWhatsApp] = useState(true); // Default WhatsApp
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
          .select('telefone, nome')
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
    const numbers = value.replace(/\D/g, '');
    
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
    const numbers = phoneNumber.replace(/\D/g, '');
    
    if (numbers.length < 10) {
      return false;
    }
    
    const ddd = numbers.slice(0, 2);
    const validDDDs = [
      '11', '12', '13', '14', '15', '16', '17', '18', '19',
      '21', '22', '24', '27', '28',
      '31', '32', '33', '34', '35', '37', '38',
      '41', '42', '43', '44', '45', '46',
      '47', '48', '49',
      '51', '53', '54', '55',
      '61', '62', '63', '64', '65', '66', '67',
      '68', '69',
      '71', '73', '74', '75', '77', '79',
      '81', '82', '83', '84', '85', '86', '87', '88', '89',
      '91', '92', '93', '94', '95', '96', '97', '98', '99'
    ];
    
    return validDDDs.includes(ddd);
  };

  const generateVerificationCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const sendWhatsAppCode = async (telefone: string, codigo: string, nome: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: { telefone, codigo, nome }
      });

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error);
      throw error;
    }
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
      // Gerar código de verificação
      const codigo = generateVerificationCode();
      
      // Formatar telefone
      const phoneNumbers = phone.replace(/\D/g, '');
      const formattedPhone = `+55${phoneNumbers}`;
      
      // Buscar nome do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('nome')
        .eq('id', user.id)
        .single();
      
      const nomeUsuario = profile?.nome || 'usuário';

      if (useWhatsApp) {
        // Enviar via WhatsApp
        console.log('📱 Enviando código via WhatsApp...');
        const result = await sendWhatsAppCode(formattedPhone, codigo, nomeUsuario);
        
        if (!result.success) {
          throw new Error(result.error || 'Erro ao enviar WhatsApp');
        }

        toast({
          title: "WhatsApp enviado!",
          description: "Verifique sua conversa no WhatsApp.",
          duration: 5000,
        });
      } else {
        // TODO: Implementar SMS como fallback
        toast({
          title: "SMS não implementado",
          description: "Use WhatsApp por enquanto.",
          variant: "destructive",
        });
        return;
      }

      // Salvar telefone e código no perfil
      const { error } = await supabase
        .from('profiles')
        .update({ 
          telefone: formattedPhone,
          verification_code: codigo, // Novo campo para armazenar código
          verification_code_expires: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutos
          cadastro_step: 'code'
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      onComplete();
      
    } catch (error: any) {
      console.error('❌ Erro ao enviar código:', error);
      
      let errorMessage = "Não foi possível enviar o código. Tente novamente.";
      
      if (error.message?.includes('WhatsApp não está habilitado')) {
        errorMessage = "Este número não pode receber mensagens do WhatsApp. Tente SMS.";
        setUseWhatsApp(false);
      } else if (error.message?.includes('inválido')) {
        errorMessage = "Número de telefone inválido. Verifique e tente novamente.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao enviar código",
        description: errorMessage,
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
          Vamos te enviar um código de verificação via {useWhatsApp ? 'WhatsApp' : 'SMS'}.
        </p>
        
        {/* Seletor WhatsApp/SMS */}
        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            variant={useWhatsApp ? "default" : "outline"}
            size="sm"
            onClick={() => setUseWhatsApp(true)}
            className="flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </Button>
          <Button
            type="button"
            variant={!useWhatsApp ? "default" : "outline"}
            size="sm"
            onClick={() => setUseWhatsApp(false)}
            className="flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            SMS
          </Button>
        </div>
        
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
              Enviando via {useWhatsApp ? 'WhatsApp' : 'SMS'}...
            </div>
          ) : (
            `Enviar código via ${useWhatsApp ? 'WhatsApp' : 'SMS'}`
          )}
        </Button>
        
        {phone && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Código será enviado para: +55{phone.replace(/\D/g, '')}
          </p>
        )}
      </div>
    </div>
  );
};

export default PhoneStepV2;
