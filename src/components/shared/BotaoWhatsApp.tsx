
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BotaoWhatsAppProps {
  telefone: string;
  nomeContato: string;
  tituloItem: string;
  reservaId: string;
  isVendedor: boolean;
  className?: string;
}

const BotaoWhatsApp: React.FC<BotaoWhatsAppProps> = ({
  telefone,
  nomeContato,
  tituloItem,
  reservaId,
  isVendedor,
  className = ""
}) => {
  const { toast } = useToast();

  const abrirWhatsApp = async () => {
    try {
      // Registrar tracking da conversa
      await supabase.rpc('registrar_conversa_whatsapp', {
        p_reserva_id: reservaId,
        p_tipo_usuario: isVendedor ? 'vendedor' : 'comprador'
      });

      // Formatar telefone (remover caracteres especiais)
      const telefoneFormatado = telefone.replace(/\D/g, '');
      
      // Mensagem personalizada
      const mensagem = `Olá ${nomeContato}! Sobre o item "${tituloItem}" no GiraMãe...`;
      
      // URL do WhatsApp
      const whatsappUrl = `https://wa.me/55${telefoneFormatado}?text=${encodeURIComponent(mensagem)}`;
      
      // Abrir WhatsApp
      window.open(whatsappUrl, '_blank');
      
    } catch (error) {
      console.error('Erro ao abrir WhatsApp:', error);
      toast({
        title: "Erro",
        description: "Não foi possível abrir o WhatsApp.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      onClick={abrirWhatsApp}
      size="sm"
      className={`bg-green-500 hover:bg-green-600 text-white ${className}`}
    >
      <MessageCircle className="w-4 h-4 mr-1" />
      WhatsApp
    </Button>
  );
};

export default BotaoWhatsApp;
