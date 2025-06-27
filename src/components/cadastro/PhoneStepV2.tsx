import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle } from 'lucide-react';

interface PhoneStepV2Props {
  onComplete: () => void;
}

const PhoneStepV2: React.FC<PhoneStepV2Props> = ({ onComplete }) => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const cleanPhoneNumber = (phoneNumber: string) => {
    // Remove tudo que não é número
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Se começar com 0, remove
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // Se não começar com 55, adiciona
    if (!cleaned.startsWith('55')) {
      cleaned = '55' + cleaned;
    }
    
    return cleaned;
  };

  const formatPhoneDisplay = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 11) {
      return `+${cleaned.substring(0, 2)} (${cleaned.substring(2, 4)}) ${cleaned.substring(4, 9)}-${cleaned.substring(9)}`;
    }
    return phone;
  };

  const handlePhoneChange = (value: string) => {
    // Permitir apenas números, espaços, parênteses, hífen e +
    const formatted = value.replace(/[^\d\s()\-+]/g, '');
    setPhone(formatted);
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

    const cleanPhone = cleanPhoneNumber(phone);
    
    // Validação: deve ter pelo menos 13 dígitos (55 + 11 dígitos)
    if (cleanPhone.length < 13) {
      toast({
        title: "Telefone inválido",
        description: "Por favor, insira um número de telefone brasileiro válido com DDD.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('📱 Enviando código via WhatsApp para:', cleanPhone);
      
      // Chamar a Edge Function para enviar WhatsApp
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: { 
          phone: cleanPhone,
          method: 'whatsapp' // Sempre WhatsApp
        }
      });

      if (error) {
        console.error('❌ Erro ao enviar WhatsApp:', error);
        throw error;
      }

      console.log('✅ WhatsApp enviado com sucesso:', data);
      
      toast({
        title: "WhatsApp enviado!",
        description: `Código enviado para ${formatPhoneDisplay(cleanPhone)} via WhatsApp.`,
      });
      
      onComplete();
    } catch (error: any) {
      console.error('❌ Erro no envio:', error);
      
      let errorMessage = "Erro ao enviar código. Tente novamente.";
      
      if (error.message?.includes('63015')) {
        errorMessage = "Número não autorizado no WhatsApp Sandbox. Verifique se seguiu as instruções de configuração.";
      } else if (error.message?.includes('network')) {
        errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
      }
      
      toast({
        title: "Erro ao enviar WhatsApp",
        description: errorMessage,
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
          Adicione seu celular
        </h3>
        
        <p className="text-sm text-gray-600 mb-4">
          Vamos te enviar um código de verificação via WhatsApp.
        </p>
        
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Número do WhatsApp
        </label>
        <Input
          type="tel"
          placeholder="+55 (31) 99999-9999"
          value={phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          className="mb-4"
          disabled={isLoading}
        />
        
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading || !phone.trim()}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Enviando código...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Enviar código via WhatsApp
            </div>
          )}
        </Button>
        
        {/* Info adicional */}
        <p className="text-xs text-gray-500 mt-3 text-center">
          💡 Certifique-se de que o WhatsApp está instalado e funcionando no número informado
        </p>
      </div>
    </div>
  );
};

export default PhoneStepV2;
