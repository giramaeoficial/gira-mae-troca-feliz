import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Timer, RefreshCw } from 'lucide-react';

interface CodeStepV2Props {
  onComplete: () => void;
}

const CodeStepV2: React.FC<CodeStepV2Props> = ({ onComplete }) => {
  const [codeInputs, setCodeInputs] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos
  const { toast } = useToast();

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCodeInput = (index: number, value: string) => {
    if (value.length > 1) return; // Apenas um dígito
    
    const newInputs = [...codeInputs];
    newInputs[index] = value;
    setCodeInputs(newInputs);

    // Focar no próximo input
    if (value && index < 3) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit quando todos os 4 dígitos forem preenchidos
    const fullCode = newInputs.join('');
    if (fullCode.length === 4) {
      setTimeout(() => handleSubmit(fullCode), 100);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Backspace - voltar para o input anterior
    if (e.key === 'Backspace' && !codeInputs[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (code?: string) => {
    const finalCode = code || codeInputs.join('');
    
    if (finalCode.length !== 4) {
      toast({
        title: "Código incompleto",
        description: "Por favor, insira o código de 4 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🔍 Verificando código:', finalCode);
      
      // Chamar a função para verificar o código
      const { data, error } = await supabase.rpc('verify_phone_code', {
        p_code: finalCode
      });

      if (error) {
        console.error('❌ Erro ao verificar código:', error);
        throw error;
      }

      if (data === true) {
        console.log('✅ Código verificado com sucesso');
        toast({
          title: "Código verificado!",
          description: "Seu telefone foi confirmado com sucesso.",
        });
        onComplete();
      } else {
        console.log('❌ Código inválido ou expirado');
        toast({
          title: "Código inválido",
          description: "Verifique o código e tente novamente.",
          variant: "destructive",
        });
        // Limpar inputs para nova tentativa
        setCodeInputs(['', '', '', '']);
        const firstInput = document.getElementById('code-0');
        firstInput?.focus();
      }
    } catch (error: any) {
      console.error('❌ Erro na verificação:', error);
      
      let errorMessage = "Erro ao verificar código. Tente novamente.";
      
      if (error.message?.includes('expired') || error.message?.includes('expirado')) {
        errorMessage = "Código expirado. Solicite um novo código.";
      } else if (error.message?.includes('invalid') || error.message?.includes('incorreto')) {
        errorMessage = "Código incorreto. Verifique e tente novamente.";
      }
      
      toast({
        title: "Erro na verificação",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    
    try {
      console.log('🔄 Reenviando código via WhatsApp...');
      
      // Buscar o telefone do usuário no banco
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('telefone')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (profileError || !profile?.telefone) {
        throw new Error('Telefone não encontrado');
      }

      // Reenviar código
      const { error } = await supabase.functions.invoke('send-whatsapp', {
        body: { 
          phone: profile.telefone,
          method: 'whatsapp'
        }
      });

      if (error) throw error;

      toast({
        title: "Código reenviado!",
        description: "Um novo código foi enviado para seu WhatsApp.",
      });
      
      // Reset timer
      setTimeLeft(300);
      
      // Limpar inputs
      setCodeInputs(['', '', '', '']);
      const firstInput = document.getElementById('code-0');
      firstInput?.focus();
      
    } catch (error: any) {
      console.error('❌ Erro ao reenviar:', error);
      toast({
        title: "Erro ao reenviar",
        description: "Não foi possível reenviar o código. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="px-6 pb-5 pt-1">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Insira o código do WhatsApp
        </h3>
        
        {/* WhatsApp Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Código enviado via WhatsApp</span>
          </div>
          <p className="text-xs text-green-700">
            Verifique as mensagens no seu WhatsApp e digite o código de 4 dígitos.
          </p>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Timer className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Código expira em: <span className="font-mono font-semibold text-orange-600">{formatTime(timeLeft)}</span>
          </span>
        </div>
        
        {/* Code Inputs */}
        <div className="flex gap-3 justify-center mb-4">
          {codeInputs.map((value, index) => (
            <Input
              key={index}
              id={`code-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={value}
              onChange={(e) => handleCodeInput(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-lg font-semibold border-2 focus:border-green-500"
              disabled={isLoading}
              autoComplete="off"
            />
          ))}
        </div>
        
        {/* Submit Button */}
        <Button 
          onClick={() => handleSubmit()}
          disabled={isLoading || codeInputs.join('').length !== 4}
          className="w-full bg-green-600 hover:bg-green-700 text-white mb-4"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Verificando...
            </div>
          ) : (
            'Verificar código'
          )}
        </Button>
        
        {/* Resend Button */}
        <div className="text-center">
          {timeLeft > 0 ? (
            <p className="text-sm text-gray-500">
              Não recebeu o código? Aguarde {formatTime(timeLeft)} para reenviar.
            </p>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResendCode}
              disabled={isResending}
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              {isResending ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Reenviando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Reenviar código via WhatsApp
                </div>
              )}
            </Button>
          )}
        </div>
        
        {/* Help */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          💡 Se não recebeu no WhatsApp, verifique se o número está correto e se tem internet
        </p>
      </div>
    </div>
  );
};

export default CodeStepV2;
