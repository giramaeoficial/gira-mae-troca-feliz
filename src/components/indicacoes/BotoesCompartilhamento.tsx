
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Share2 } from 'lucide-react';

interface BotoesCompartilhamentoProps {
  linkIndicacao: string;
  texto: string;
}

const BotoesCompartilhamento = ({ linkIndicacao, texto }: BotoesCompartilhamentoProps) => {
  const { toast } = useToast();

  const compartilharWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(whatsappUrl, '_blank');
  };

  const compartilharEmail = () => {
    const subject = encodeURIComponent('Venha conhecer o GiraMãe!');
    const body = encodeURIComponent(texto);
    const emailUrl = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = emailUrl;
  };

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      toast({
        title: "Link copiado!",
        description: "O link de indicação foi copiado para sua área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const compartilharNativo = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Venha para o GiraMãe!',
          text: texto,
          url: linkIndicacao
        });
      } catch (error) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      copiarLink();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Button 
        onClick={compartilharWhatsApp}
        className="bg-green-600 hover:bg-green-700 text-white"
        size="sm"
      >
        📱 WhatsApp
      </Button>
      
      <Button 
        onClick={compartilharEmail}
        variant="outline"
        size="sm"
      >
        📧 E-mail
      </Button>
      
      <Button 
        onClick={compartilharNativo}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        size="sm"
      >
        <Share2 className="h-4 w-4 mr-1" />
        Compartilhar
      </Button>
    </div>
  );
};

export default BotoesCompartilhamento;
