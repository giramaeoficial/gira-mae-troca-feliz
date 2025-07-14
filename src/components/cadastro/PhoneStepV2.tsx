// src/components/cadastro/PhoneStepV2.tsx - VERSÃO CORRIGIDA

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface PhoneStepV2Props {
  onComplete: () => void;
  disabled?: boolean;
}

const PhoneStepV2: React.FC<PhoneStepV2Props> = ({ onComplete, disabled = false }) => {
  const { user } = useAuth();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { toast } = useToast();

  // Carregar dados do perfil ao inicializar
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('telefone, telefone_verificado')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao carregar dados do perfil:', error);
          return;
        }

        if (data) {
          if (data.telefone) {
            setPhone(formatPhoneDisplay(data.telefone.replace('55', '')));
          }
          
          if (data.telefone_verificado) {
            setIsPhoneVerified(true);
            console.log('✅ Telefone já verificado!');
            // REMOVIDO: auto-redirect que causava problemas
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadProfileData();
  }, [user]); // Removido onComplete da dependência

  const formatPhoneDisplay = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length >= 11) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
    } else if (cleaned.length >= 10) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
    }
    return phoneNumber;
  };

  const cleanPhoneNumber = (phoneNumber: string) => {
    // Remove tudo que não é número
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Se começar com 0, remove
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // Se começar com 55, remove (usuário não precisa digitar)
    if (cleaned.startsWith('55')) {
      cleaned = cleaned.substring(2);
    }
    
    return cleaned;
  };

  const handlePhoneChange = (value: string) => {
    // Limitar a 15 caracteres para evitar números muito longos
    if (value.length > 15) return;
    
    const cleaned = cleanPhoneNumber(value);
    const formatted = formatPhoneDisplay(cleaned);
    setPhone(formatted);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      return;
    }

    const cleanPhone = cleanPhoneNumber(phone);
    
    // Validação básica
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      toast({
        title: "Número inválido",
        description: "Digite um número válido com DDD (10 ou 11 dígitos).",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Adicionar código Brasil se necessário
      const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

      console.log('📞 Salvando telefone:', fullPhone);

      // Salvar telefone e gerar código diretamente no banco
      const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      const { error } = await supabase
        .from('profiles')
        .update({
          telefone: fullPhone,
          verification_code: verificationCode,
          verification_code_expires: expiresAt
        })
        .eq('id', user.id);

      if (error) {
        console.error('❌ Erro ao salvar telefone:', error);
        toast({
          title: "Erro ao salvar telefone",
          description: error.message || "Falha na operação.",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Telefone salvo, código gerado:', verificationCode);
      
      // Enviar WhatsApp com o código gerado
      const { data: whatsappData, error: whatsappError } = await supabase.functions.invoke('send-whatsapp', {
        body: { 
          telefone: fullPhone,
          codigo: verificationCode,
          nome: 'usuário'
        }
      });

      if (whatsappError || !whatsappData?.success) {
        console.error('❌ Erro no WhatsApp:', whatsappError);
        toast({
          title: "Erro ao enviar WhatsApp",
          description: whatsappData?.error || "Falha no envio do código.",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ WhatsApp enviado com sucesso');
      
      toast({
        title: "Código enviado!",
        description: `Código enviado para +55 ${formatPhoneDisplay(phone)} via WhatsApp.`,
      });
      
      // Chamar onComplete apenas quando código for enviado com sucesso
      onComplete();
      
    } catch (error: any) {
      console.error('❌ Erro no processo:', error);
      toast({
        title: "Erro",
        description: "Erro interno. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Loading inicial
  if (initialLoading) {
    return (
      <div className="px-6 pb-5 pt-1">
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="ml-2 text-gray-600">Carregando...</span>
        </div>
      </div>
    );
  }

  // Se telefone já foi verificado, mostrar status com botão manual
  if (isPhoneVerified) {
    return (
      <div className="px-6 pb-5 pt-1">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Telefone já verificado!
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Seu número {phone} já foi confirmado anteriormente.
          </p>
          <Button 
            onClick={onComplete}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={disabled}
          >
            Continuar
          </Button>
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
          Vamos te enviar um código de verificação via WhatsApp.
        </p>
        
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Número do WhatsApp
        </label>
        <div className="relative mb-4">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
            +55
          </div>
          <Input
            type="tel"
            placeholder="(31) 9999-9999 ou (31) 99999-9999"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className="pl-12"
            disabled={isLoading || isPhoneVerified || disabled}
          />
        </div>
        
        <Button 
          onClick={handleSubmit} 
                      disabled={isLoading || !phone.trim() || disabled}
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
          💡 Digite seu número com DDD (aceita 8 ou 9 dígitos)
        </p>
      </div>
    </div>
  );
};

export default PhoneStepV2;
