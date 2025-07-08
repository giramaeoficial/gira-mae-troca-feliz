import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, CheckCircle, X, Users, Star, Key, Eye } from "lucide-react";
import AvaliacaoModal from "./AvaliacaoModal";
import CodigoConfirmacaoModal from "./CodigoConfirmacaoModal";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useReservas } from "@/hooks/useReservas";
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
    codigo_confirmacao?: string;
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
  onConfirmarEntrega: (reservaId: string, codigo: string) => Promise<boolean>;
  onCancelarReserva: (reservaId: string) => void;
  onRefresh?: () => void;
  onVerDetalhes?: (itemId: string) => void; // ✅ NOVA PROP
}

const ReservaCard = ({ 
  reserva, 
  onConfirmarEntrega, 
  onCancelarReserva, 
  onRefresh,
  onVerDetalhes // ✅ NOVA PROP
}: ReservaCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { confirmarEntrega, loading } = useReservas();
  const [showAvaliacao, setShowAvaliacao] = useState(false);
  const [showCodigoModal, setShowCodigoModal] = useState(false);
  const [loadingConfirmacao, setLoadingConfirmacao] = useState(false);
  const [jaAvaliou, setJaAvaliou] = useState(false);

  const isReservador = reserva.usuario_reservou === user?.id;
  const isVendedor = reserva.usuario_item === user?.id;
  const outraPessoa = isReservador ? reserva.profiles_vendedor : reserva.profiles_reservador;
  const imagemItem = reserva.itens?.fotos?.[0] || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=200";

  // ✅ FUNÇÃO PARA ABRIR DETALHES
  const handleVerDetalhes = () => {
    if (onVerDetalhes && reserva.item_id) {
      onVerDetalhes(reserva.item_id);
    }
  };

  // Função com retry para verificação de avaliação
  const verificarSeJaAvaliouComRetry = async (maxTentativas = 3): Promise<boolean> => {
    for (let i = 0; i < maxTentativas; i++) {
      try {
        const { data } = await supabase
          .from('avaliacoes')
          .select('id')
          .eq('reserva_id', reserva.id)
          .eq('avaliador_id', user?.id)
          .single();
        
        return !!data;
      } catch (error) {
        if (i === maxTentativas - 1) {
          console.error('Erro ao verificar avaliação:', error);
          return false;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    return false;
  };

  const formatarTempo = (milliseconds: number) => {
    const horas = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutos = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${horas}h ${minutos}m`;
  };

  // FUNÇÃO ATUALIZADA: Usar sistema V2 atômico
  const handleConfirmarEntrega = async (codigo: string): Promise<boolean> => {
    setLoadingConfirmacao(true);
    try {
      const sucesso = await onConfirmarEntrega(reserva.id, codigo);
      
      if (sucesso) {
        setTimeout(async () => {
          const { data: reservaAtualizada } = await supabase
            .from('reservas')
            .select('*')
            .eq('id', reserva.id)
            .single();

          if (reservaAtualizada?.status === 'confirmada') {
            const jaAvaliou = await verificarSeJaAvaliouComRetry();
            
            if (!jaAvaliou) {
              setShowAvaliacao(true);
              
              toast({
                title: "🎉 Troca concluída!",
                description: "Agora você pode avaliar esta troca.",
              });
            }
          }
        }, 1000);
        
        setShowCodigoModal(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao confirmar entrega:', error);
      return false;
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

  const mostrarBotaoAvaliar = reserva.status === 'confirmada' && !jaAvaliou;

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              {/* ✅ IMAGEM CLICÁVEL */}
              <div 
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleVerDetalhes}
              >
                <img 
                  src={imagemItem} 
                  alt={reserva.itens?.titulo || "Item"} 
                  className="w-16 h-16 rounded-lg object-cover"
                />
              </div>
              <div className="flex-grow">
                {/* ✅ TÍTULO CLICÁVEL */}
                <h3 
                  className="font-semibold text-gray-800 line-clamp-1 cursor-pointer hover:text-primary transition-colors"
                  onClick={handleVerDetalhes}
                >
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
          </div>
        </CardContent>

        <CardFooter className="pt-3 bg-gray-50/50">
          <div className="flex gap-2 w-full">
            {/* ✅ BOTÃO VER DETALHES SEMPRE PRESENTE */}
            {onVerDetalhes && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleVerDetalhes}
                className="shrink-0"
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}

            {reserva.status === 'pendente' && (
              <>
                <Button 
                  size="sm" 
                  onClick={() => setShowCodigoModal(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Key className="w-4 h-4 mr-1" />
                  {isVendedor ? 'Código' : 'Ver código'}
                </Button>

                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => onCancelarReserva(reserva.id)}
                  className="shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            )}

            {reserva.status === 'confirmada' && (
              <div className="flex gap-2 flex-1">
                <Button variant="outline" size="sm" className="flex-1" disabled>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Troca concluída
                </Button>
                
                {mostrarBotaoAvaliar && (
                  <Button 
                    size="sm" 
                    onClick={() => setShowAvaliacao(true)}
                    className="bg-yellow-500 hover:bg-yellow-600 shrink-0"
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
                className="flex-1"
              >
                <X className="w-4 h-4 mr-1" />
                Sair da fila
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Modais */}
      <AvaliacaoModal
        isOpen={showAvaliacao}
        onClose={() => setShowAvaliacao(false)}
        reserva={reserva}
        onAvaliacaoCompleta={() => {
          setJaAvaliou(true);
          setShowAvaliacao(false);
        }}
      />

      <CodigoConfirmacaoModal
        isOpen={showCodigoModal}
        onClose={() => setShowCodigoModal(false)}
        reserva={reserva}
        isVendedor={isVendedor}
        onConfirmarCodigo={handleConfirmarEntrega}
        loading={loading}
      />
    </>
  );
};

export default ReservaCard;
