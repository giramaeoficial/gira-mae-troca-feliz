
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BotaoWhatsAppProps {
  reservaId: string;
  numeroWhatsApp: string;
  nomeContato: string;
  tituloItem: string;
  usuarioRecebeuId: string;
  isVendedor?: boolean;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export const BotaoWhatsApp: React.FC<BotaoWhatsAppProps> = ({
  reservaId,
  numeroWhatsApp,
  nomeContato,
  tituloItem,
  usuarioRecebeuId,
  isVendedor = false,
  className = "",
  size = "sm"
}) => {
  const abrirWhatsApp = async () => {
    try {
      // 1. Registrar que conversa foi iniciada
      const { error } = await supabase.rpc('registrar_conversa_whatsapp', {
        p_reserva_id: reservaId,
        p_usuario_recebeu: usuarioRecebeuId
      });

      if (error) {
        console.error('Erro ao registrar conversa:', error);
        // Continua mesmo com erro de tracking
      }

      // 2. Preparar mensagem WhatsApp
      const mensagem = isVendedor 
        ? `Olá ${nomeContato}! Sobre sua reserva do item "${tituloItem}" no Gira-Mãe. Vamos combinar a troca?`
        : `Olá ${nomeContato}! Reservei seu item "${tituloItem}" no Gira-Mãe. Podemos combinar a troca?`;
      
      // 3. Limpar número e abrir WhatsApp
      const numeroLimpo = numeroWhatsApp.replace(/\D/g, '');
      const url = `https://wa.me/55${numeroLimpo}?text=${encodeURIComponent(mensagem)}`;
      
      window.open(url, '_blank');
      toast.success("Abrindo WhatsApp...");

    } catch (error) {
      console.error('Erro:', error);
      toast.error("Erro ao abrir WhatsApp");
    }
  };

  if (!numeroWhatsApp || numeroWhatsApp.replace(/\D/g, '').length < 10) {
    return null; // Não mostra botão se não tem WhatsApp válido
  }

  return (
    <Button
      onClick={abrirWhatsApp}
      size={size}
      className={`bg-green-500 hover:bg-green-600 text-white ${className}`}
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      Conversar no WhatsApp
    </Button>
  );
};
