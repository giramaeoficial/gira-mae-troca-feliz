// src/components/cadastro/CodeStepV2.tsx - COMPONENTE COMPLETO
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, MessageCircle, RotateCcw, CheckCircle } from 'lucide-react';

interface CodeStepV2Props {
  onComplete: () => void;
  onBack?: () => void;
}

const CodeStepV2: React.FC<CodeStepV2Props> = ({ onComplete, onBack }) => {
  const [codeInputs, setCodeInputs] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos em segundos
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  // Carregar dados do telefone e iniciar countdown
  useEffect(() => {
    const loadPhoneData = async () => {
      if (!user) return;

      try {
        setIsLoadingData(true);
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('telefone, verification_code_expires')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao carregar dados:', error);
          return;
        }

        if (profile?.telefone) {
          // Mascarar telefone para exibição
          const phone = profile.telefone.replace('+55', '');
          const masked = `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
          setPhoneNumber(masked);
        }

        // Calcular tempo restante se houver expiração
        if (profile?.verification_code_expires) {
          const expiresAt = new Date(profile.verification_code_expires).getTime();
          const now = Date.now();
          const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
          setTimeLeft(remaining);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadPhoneData();
  }, [user]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Auto-focus no primeiro input quando carregado
  useEffect(() => {
    if (!isLoadingData) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isLoadingData]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index: number, value: string) => {
    // Apenas números
    const numericValue = value.replace(/\D/g, '');
    
    if (numericValue.length <= 1) {
      const newInputs = [...codeInputs];
      newInputs[index] = numericValue;
      setCodeInputs(newInputs);

      // Auto-focus no próximo input
      if (numericValue && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-submit quando todos os campos estão preenchidos
      if (numericValue && index === 3) {
        const fullCode = [...newInputs.slice(0, 3), numericValue].join('');
        if (fullCode.length === 4) {
          setTimeout(() => verifyCode(fullCode), 200);
        }
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !codeInputs[index] && index > 0) {
      // Move para o input anterior e limpa
      inputRefs.current[index - 1]?.focus();
      const newInputs = [...codeInputs];
      newInputs[index - 1] = '';
      setCodeInputs(newInputs);
    }
    
    // Permitir navegação com setas
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const numbers = pastedText.replace(/\D/g, '').slice(0, 4);
    
    if (numbers.length === 4) {
      const newInputs = numbers.split('');
      setCodeInputs(newInputs);
      inputRefs.current[3]?.focus();
      
      // Auto-verify após paste
      setTimeout(() => verifyCode(numbers), 200);
    }
  };

  const verifyCode = async (code?: string) => {
    const fullCode = code || codeInputs.join('');
    
    if (fullCode.length !== 4) {
      toast({
        title: "Código incompleto",
        description: "Por favor, digite os 4 dígitos do código.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não encontrado.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔍 Verificando código:', fullCode);

      // Buscar código armazenado no banco
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('verification_code, verification_code_expires')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        throw error;
      }

      if (!profile?.verification_code) {
        toast({
          title: "Código não encontrado",
          description: "Solicite um novo código.",
          variant: "destructive",
        });
        return;
      }

      // Verificar se código expirou
      if (profile.verification_code_expires) {
        const expiresAt = new Date(profile.verification_code_expires).getTime();
        if (Date.now() > expiresAt) {
          toast({
            title: "Código expirado",
            description: "Solicite um novo código.",
            variant: "destructive",
          });
          setTimeLeft(0);
          return;
        }
      }

      // Verificar se código está correto
      if (profile.verification_code !== fullCode) {
        toast({
          title: "Código incorreto",
          description: "Verifique os dígitos e tente novamente.",
          variant: "destructive",
        });
        
        // Limpar inputs para tentar novamente
        setCodeInputs(['', '', '', '']);
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
        return;
      }

      // Código correto! Atualizar status
      console.log('✅ Código verificado com sucesso');
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          verification_code: null, // Limpar código usado
          verification_code_expires: null,
          telefone_verificado: true,
          cadastro_step: 'personal'
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Erro ao atualizar perfil:', updateError);
        throw updateError;
      }

      toast({
        title: "Código verificado!",
        description: "Telefone confirmado com sucesso.",
      });

      // Pequeno delay para mostrar sucesso
      setTimeout(() => {
        onComplete();
      }, 500);

    } catch (error: any) {
      console.error('❌ Erro ao verificar código:', error);
      toast({
        title: "Erro na verificação",
        description: "Tente novamente ou solicite um novo código.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    if (!user) return;

    setIsResending(true);

    try {
      console.log('📱 Reenviando código...');
      
      // Gerar novo código
      const newCode = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Buscar dados do usuário
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('telefone, nome')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (!profile?.telefone) {
        throw new Error('Telefone não encontrado');
      }

      // Enviar novo código via WhatsApp
      const { data, error: functionError } = await supabase.functions.invoke('send-whatsapp', {
        body: { 
          telefone: profile.telefone, 
          codigo: newCode, 
          nome: profile.nome || 'usuário' 
        }
      });

      if (functionError) {
        console.error('Erro na Edge Function:', functionError);
        throw functionError;
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro ao enviar WhatsApp');
      }

      // Atualizar código no banco
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          verification_code: newCode,
          verification_code_expires: new Date(Date.now() + 10 * 60 * 1000).toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Erro ao atualizar código:', updateError);
        throw updateError;
      }

      // Resetar timer e inputs
      setTimeLeft(600);
      setCodeInputs(['', '', '', '']);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);

      toast({
        title: "Novo código enviado!",
        description: "Verifique seu WhatsApp.",
      });

    } catch (error: any) {
      console.error('❌ Erro ao reenviar código:', error);
      toast({
        title: "Erro ao reenviar",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  // Loading inicial
  if (isLoadingData) {
    return (
      <div className="px-6 pb-5 pt-1">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-gray-600">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-5 pt-1">
      <div className="mb-4">
        {/* Botão voltar */}
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mb-4 -ml-2"
            disabled={isLoading}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
        )}

        {/* Cabeçalho */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Insira o código
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            Enviamos um código de 4 dígitos via WhatsApp para:
          </p>
          <p className="text-sm font-medium text-gray-800 mb-4">
            +55 {phoneNumber}
          </p>
        </div>

        {/* Inputs do código */}
        <div className="flex gap-3 justify-center mb-6">
          {codeInputs.map((value, index) => (
            <Input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={value}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              disabled={isLoading}
              className={`w-14 h-14 text-center text-xl font-bold border-2 transition-all duration-200 ${
                value 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-300 hover:border-gray-400 focus:border-primary'
              }`}
              autoComplete="one-time-code"
            />
          ))}
        </div>

        {/* Timer e status */}
        <div className="text-center mb-6">
          {timeLeft > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Código expira em: <span className="font-medium text-primary">{formatTime(timeLeft)}</span>
              </p>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-primary h-1 rounded-full transition-all duration-1000"
                  style={{ width: `${(timeLeft / 600) * 100}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-red-500 font-medium">
              ⏰ Código expirado. Solicite um novo código.
            </p>
          )}
        </div>

        {/* Botão verificar */}
        <Button
          onClick={() => verifyCode()}
          disabled={isLoading || codeInputs.join('').length !== 4}
          className="w-full bg-primary hover:bg-primary/90 mb-4 h-12 text-base font-medium"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Verificando...
            </div>
          ) : (
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Verificar código
            </div>
          )}
        </Button>

        {/* Botão reenviar */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            Não recebeu o código?
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={resendCode}
            disabled={isResending || timeLeft > 540} // Pode reenviar após 1 minuto
            className="text-primary border-primary hover:bg-primary/5"
          >
            {isResending ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                Reenviando...
              </div>
            ) : (
              <div className="flex items-center">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reenviar código
              </div>
            )}
          </Button>
          
          {timeLeft > 540 && (
            <p className="text-xs text-gray-500 mt-2">
              Aguarde {formatTime(timeLeft - 540)} para reenviar
            </p>
          )}
        </div>

        {/* Dica */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700 text-center">
            💡 <strong>Dica:</strong> O código também pode ser copiado e colado automaticamente
          </p>
        </div>
      </div>
    </div>
  );
};

export default CodeStepV2;
