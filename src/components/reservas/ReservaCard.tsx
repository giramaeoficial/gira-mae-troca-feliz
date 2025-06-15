
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, MessageCircle, CheckCircle, X, Users, Star } from "lucide-react";
import ChatModal from "@/components/chat/ChatModal";
import ConfirmacaoEntregaModal from "./ConfirmacaoEntregaModal";
import AvaliacaoModal from "./AvaliacaoModal";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReservaCardProps {
  reserva: {
    id: string;
    item_id: string;
    usuario_reservou: string;
    usuario_item: string;
    valor_girinhas: number;
    status: string;
    prazo_expiracao: string;
    confirmado_por_reservador: boolean;
    confirmado_por_vendedor: boolean;
    posicao_fila?: number;
    tempo_restante?: number;
    itens?: {
      titulo: string;
      fotos: string[] | null;
      valor_girinhas: number;
    } | null;
    profiles_reservador?: {
      nome: string;
      avatar_url: string | null;
    } | null;
    profiles_vendedor?: {
      nome: string;
      avatar_url: string | null;
    } | null;
  };
  onConfirmarEntrega: (reservaId: string) => void;
  onCancelarReserva: (reservaId: string) => void;
}

const ReservaCard = ({ reserva, onConfirmarEntrega, onCancelarReserva }: ReservaCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showChat, setShowChat] = useState(false);
  const [showConfirmacao, setShowConfirmacao] = useState(false);
  const [showAvaliacao, setShowAvaliacao] = useState(false);
  const [loadingConfirmacao, setLoadingConfirmacao] = useState(false);
  const [jaAvaliou, setJaAvaliou] = useState(false);

  const isReservador = reserva.usuario_reservou === user?.id;
  const isVendedor = reserva.usuario_item === user?.id;
  const outraPessoa = isReservador ? reserva.profiles_vendedor : reserva.profiles_reservador;
  const imagemItem = reserva.itens?.fotos?.[0] || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=200";

  // Verificar se já avaliou esta reserva
  const verificarSeJaAvaliou = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('avaliacoes' as any)
        .select('id')
        .eq('reserva_id', reserva.id)
        .eq('avaliador_id', user.id)
        .single();
      
      setJaAvaliou(!!data);
    } catch (error) {
      // Se der erro, assumir que não avaliou ainda
      setJaAvaliou(false);
    }
  };

  const formatarTempo = (milliseconds: number) => {
    const horas = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutos = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${horas}h ${minutos}m`;
  };

  const handleConfirmarEntrega = async () => {
    setLoadingConfirmacao(true);
    try {
      await onConfirmarEntrega(reserva.id);
      
      // Se ambos confirmaram, mostrar modal de avaliação
      const ambosConfirmaram = (isReservador && reserva.confirmado_por_vendedor) || 
                              (isVendedor && reserva.confirmado_por_reservador);
      
      if (ambosConfirmaram) {
        await verificarSeJaAvaliou();
        if (!jaAvaliou) {
          setShowAvaliacao(true);
        }
      }
      
      setShowConfirmacao(false);
    } catch (error) {
      console.error('Erro ao confirmar entrega:', error);
    } finally {
      setLoadingConfirmacao(false);
    }
  };

  const getStatusBadge = () => {
    switch (reserva.status) {
      case 'pendente':
        return <Badge className="bg-orange-500 text-white">Ativa</Badge>;
      case 'fila_espera':
        return <Badge className="bg-blue-500 text-white">Na Fila</Badge>;
      case 'confirmada':
        return <Badge className="bg-green-500 text-white">Concluída</Badge>;
      case 'cancelada':
        return <Badge className="bg-gray-500 text-white">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{reserva.status}</Badge>;
    }
  };

  const getPrioridade = () => {
    if (reserva.status === 'fila_espera' && reserva.posicao_fila) {
      return (
        <div className="flex items-center gap-1 text-sm text-blue-600">
          <Users className="w-4 h-4" />
          <span>{reserva.posicao_fila}º na fila</span>
        </div>
      );
    }
    return null;
  };

  const getTempoRestante = () => {
    if (reserva.status === 'pendente' && reserva.tempo_restante) {
      const isUrgente = reserva.tempo_restante < 3 * 60 * 60 * 1000; // menos de 3 horas
      return (
        <div className={`flex items-center gap-1 text-sm ${isUrgente ? 'text-red-600' : 'text-orange-600'}`}>
          <Clock className="w-4 h-4" />
          <span>Expira em {formatarTempo(reserva.tempo_restante)}</span>
        </div>
      );
    }
    return null;
  };

  const getConfirmacoes = () => {
    if (reserva.status === 'pendente') {
      return (
        <div className="flex gap-2 text-xs">
          <div className={`flex items-center gap-1 ${reserva.confirmado_por_reservador ? 'text-green-600' : 'text-gray-400'}`}>
            <CheckCircle className="w-3 h-3" />
            <span>Comprador</span>
          </div>
          <div className={`flex items-center gap-1 ${reserva.confirmado_por_vendedor ? 'text-green-600' : 'text-gray-400'}`}>
            <CheckCircle className="w-3 h-3" />
            <span>Vendedor</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const mostrarBotaoAvaliar = reserva.status === 'confirmada' && !jaAvaliou;

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <img 
                src={imagemItem} 
                alt={reserva.itens?.titulo || "Item"} 
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-grow">
                <h3 className="font-semibold text-gray-800 line-clamp-1">
                  {reserva.itens?.titulo || "Item não encontrado"}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge()}
                  <span className="text-sm text-primary font-medium">
                    {reserva.valor_girinhas} Girinhas
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="py-3">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={outraPessoa?.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {outraPessoa?.nome?.split(' ').map(n => n[0]).join('') || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">
                {isReservador ? 'Vendedor' : 'Comprador'}: {outraPessoa?.nome || 'Usuário'}
              </p>
              <p className="text-xs text-gray-500">
                {isReservador ? 'Você reservou este item' : 'Reservou seu item'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {getPrioridade()}
            {getTempoRestante()}
            {getConfirmacoes()}
          </div>
        </CardContent>

        <CardFooter className="pt-3 bg-gray-50/50">
          <div className="flex gap-2 w-full">
            {reserva.status === 'pendente' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowChat(true)}
                  className="flex-1"
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Chat
                </Button>
                
                <Button 
                  size="sm" 
                  onClick={() => setShowConfirmacao(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {isReservador ? 'Recebi' : 'Entreguei'}
                </Button>

                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => onCancelarReserva(reserva.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            )}

            {reserva.status === 'confirmada' && (
              <div className="flex gap-2 w-full">
                <Button variant="outline" size="sm" className="flex-1" disabled>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Troca concluída
                </Button>
                
                {mostrarBotaoAvaliar && (
                  <Button 
                    size="sm" 
                    onClick={() => setShowAvaliacao(true)}
                    className="bg-yellow-500 hover:bg-yellow-600"
                  >
                    <Star className="w-4 h-4 mr-1" />
                    Avaliar
                  </Button>
                )}
              </div>
            )}

            {reserva.status === 'fila_espera' && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => onCancelarReserva(reserva.id)}
                className="w-full"
              >
                <X className="w-4 h-4 mr-1" />
                Sair da fila
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Modais */}
      {showChat && outraPessoa && reserva.itens && (
        <ChatModal
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          reservaId={reserva.id}
          outraMae={{
            nome: outraPessoa.nome,
            avatar: outraPessoa.avatar_url || "https://images.unsplash.com/photo-1494790108755-2616b612b776?w=100"
          }}
          item={{
            titulo: reserva.itens.titulo,
            imagem: imagemItem
          }}
        />
      )}

      <ConfirmacaoEntregaModal
        isOpen={showConfirmacao}
        onClose={() => setShowConfirmacao(false)}
        reserva={reserva}
        isReservador={isReservador}
        onConfirmar={handleConfirmarEntrega}
        loading={loadingConfirmacao}
      />

      <AvaliacaoModal
        isOpen={showAvaliacao}
        onClose={() => setShowAvaliacao(false)}
        reserva={reserva}
        onAvaliacaoCompleta={() => {
          setJaAvaliou(true);
          setShowAvaliacao(false);
        }}
      />
    </>
  );
};

export default ReservaCard;
