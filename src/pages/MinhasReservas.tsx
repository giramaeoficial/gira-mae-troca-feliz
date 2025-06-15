
import Header from "@/components/shared/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, MessageCircle, CheckCircle2, X, MapPin, Sparkles, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useReservas, Reserva } from "@/hooks/useReservas";
import ChatModal from "@/components/chat/ChatModal";

const MinhasReservas = () => {
  const { reservas, confirmarEntrega, cancelarReserva } = useReservas();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatReserva, setActiveChatReserva] = useState<Reserva | null>(null);

  const handleAbrirChat = (reserva: Reserva) => {
    setActiveChatReserva(reserva);
    setIsChatOpen(true);
  };
  
  const useCountdown = (targetDate: Date) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
      const difference = +targetDate - +new Date();
      let timeLeft = {};

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        
        timeLeft = { days, hours, minutes };
      }
      return timeLeft;
    }

    useEffect(() => {
      const timer = setTimeout(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);

      return () => clearTimeout(timer);
    });

    return timeLeft;
  };

  const CountdownTimer = ({ expirationDate }: { expirationDate: Date }) => {
    const timeLeft = useCountdown(expirationDate) as { days?: number, hours?: number, minutes?: number};

    if (Object.keys(timeLeft).length === 0) {
      return (
        <div className="flex items-center gap-1 text-red-500 font-medium">
          <AlertTriangle className="w-4 h-4" />
          <span>Expirado</span>
        </div>
      );
    }

    const { days, hours, minutes } = timeLeft;
    const isUrgent = (days || 0) === 0 && (hours || 0) < 6;

    return (
      <div className={`flex items-center gap-1 font-medium ${isUrgent ? 'text-red-600' : 'text-orange-600'}`}>
        <Clock className="w-4 h-4" />
        <span>
          {days > 0 ? `${days}d ` : ''}
          {hours}h {minutes}m restantes
        </span>
      </div>
    );
  };

  const getStatusBadge = (reserva: Reserva) => {
    switch (reserva.status) {
      case 'pendente':
        return (
          <Badge className="bg-orange-500 text-white">
            {reserva.tipo === 'reservada' ? 'Você reservou' : 'Reservaram de você'}
          </Badge>
        );
      case 'confirmada':
        return <Badge className="bg-green-500 text-white">Troca Realizada</Badge>;
      case 'expirada':
        return <Badge className="bg-red-500 text-white">Expirada</Badge>;
      case 'cancelada':
        return <Badge className="bg-gray-500 text-white">Cancelada</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const reservasPendentes = reservas.filter(r => r.status === 'pendente');
  const reservasConcluidas = reservas.filter(r => r.status === 'confirmada');
  const reservasExpiradas = reservas.filter(r => r.status === 'expirada' || r.status === 'cancelada');

  const ReservaCard = ({ reserva, onConfirm, onCancel, onChat }: { 
    reserva: Reserva, 
    onConfirm: (id: number) => void, 
    onCancel: (id: number) => void, 
    onChat: (reserva: Reserva) => void 
  }) => (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Imagem do item */}
          <div className="flex-shrink-0">
            <img 
              src={reserva.itemImagem} 
              alt={reserva.itemTitulo} 
              className="w-20 h-20 rounded-lg object-cover"
            />
          </div>
          
          {/* Conteúdo principal */}
          <div className="flex-grow min-w-0">
            {/* Header com título e badge */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex-grow min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">{reserva.itemTitulo}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span>{reserva.localizacao}</span>
                </div>
              </div>
              <div className="flex-shrink-0 ml-2">
                {getStatusBadge(reserva)}
              </div>
            </div>

            {/* Informações da outra mãe e valor */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={reserva.outraMaeAvatar} alt={reserva.outraMae} />
                  <AvatarFallback className="text-xs">
                    {reserva.outraMae.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-600 truncate">{reserva.outraMae}</span>
              </div>
              <div className="flex items-center gap-1 text-primary font-medium flex-shrink-0">
                <Sparkles className="w-4 h-4" />
                <span>{reserva.itemGirinhas}</span>
              </div>
            </div>

            {/* Status de confirmação (apenas para pendentes) */}
            {reserva.status === 'pendente' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                <CountdownTimer expirationDate={reserva.prazoExpiracao} />
                <div className="mt-2 space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${reserva.confirmedByMe ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className={`${reserva.confirmedByMe ? 'text-green-600 font-medium' : 'text-gray-600'} truncate`}>
                      Você {reserva.confirmedByMe ? 'confirmou' : 'ainda não confirmou'} a entrega
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${reserva.confirmedByOther ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className={`${reserva.confirmedByOther ? 'text-green-600 font-medium' : 'text-gray-600'} truncate`}>
                      {reserva.outraMae} {reserva.confirmedByOther ? 'confirmou' : 'ainda não confirmou'} a entrega
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Status de sucesso/erro */}
            {reserva.status === 'confirmada' && (
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium mb-3 bg-green-50 border border-green-200 rounded-lg p-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Troca realizada com sucesso! 🎉</span>
              </div>
            )}

            {(reserva.status === 'expirada' || reserva.status === 'cancelada') && (
              <div className="flex items-center gap-2 text-gray-600 text-sm mb-3 bg-gray-50 border border-gray-200 rounded-lg p-2">
                <X className="w-4 h-4 flex-shrink-0" />
                <span>
                  {reserva.status === 'expirada' ? 'Reserva expirou - Girinhas reembolsadas' : 'Reserva cancelada'}
                </span>
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onChat(reserva)}
                className="flex items-center gap-1 flex-1"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat</span>
              </Button>
              
              {reserva.status === 'pendente' && (
                <>
                  <Button 
                    size="sm"
                    onClick={() => onConfirm(reserva.id)}
                    className="flex items-center gap-1 flex-1 bg-green-600 hover:bg-green-700 text-white"
                    disabled={reserva.confirmedByMe}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="truncate">
                      {reserva.confirmedByMe ? "✓ Confirmado" : "Confirmar Entrega"}
                    </span>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onCancel(reserva.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 text-foreground flex flex-col pb-24 md:pb-8">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent mb-2">
            Minhas Reservas
          </h1>
          <p className="text-gray-600">Acompanhe suas trocas e gerencie suas reservas</p>
        </div>

        <Tabs defaultValue="pendentes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-sm">
            <TabsTrigger value="pendentes" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              🔄 Pendentes ({reservasPendentes.length})
            </TabsTrigger>
            <TabsTrigger value="concluidas" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              ✅ Concluídas ({reservasConcluidas.length})
            </TabsTrigger>
            <TabsTrigger value="expiradas" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              ❌ Expiradas ({reservasExpiradas.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pendentes" className="mt-6 space-y-4">
            {reservasPendentes.length > 0 ? (
              reservasPendentes.map(reserva => (
                <ReservaCard 
                  key={reserva.id} 
                  reserva={reserva}
                  onConfirm={confirmarEntrega}
                  onCancel={cancelarReserva}
                  onChat={handleAbrirChat}
                />
              ))
            ) : (
              <Card className="text-center py-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhuma reserva pendente</h3>
                  <p className="text-gray-600 mb-4">Explore o feed para encontrar itens incríveis!</p>
                  <Button asChild>
                    <Link to="/feed">Ver Feed</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="concluidas" className="mt-6 space-y-4">
            {reservasConcluidas.length > 0 ? (
              reservasConcluidas.map(reserva => (
                 <ReservaCard 
                  key={reserva.id} 
                  reserva={reserva}
                  onConfirm={() => {}}
                  onCancel={() => {}}
                  onChat={handleAbrirChat}
                />
              ))
            ) : (
              <Card className="text-center py-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhuma troca concluída ainda</h3>
                  <p className="text-gray-600">Suas trocas finalizadas aparecerão aqui.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="expiradas" className="mt-6 space-y-4">
            {reservasExpiradas.length > 0 ? (
              reservasExpiradas.map(reserva => (
                 <ReservaCard 
                  key={reserva.id} 
                  reserva={reserva}
                  onConfirm={() => {}}
                  onCancel={() => {}}
                  onChat={handleAbrirChat}
                />
              ))
            ) : (
              <Card className="text-center py-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent>
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhuma reserva expirada</h3>
                  <p className="text-gray-600">Ótimo! Você tem um histórico limpo de trocas.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {isChatOpen && activeChatReserva && (
        <ChatModal 
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          outraMae={{ nome: activeChatReserva.outraMae, avatar: activeChatReserva.outraMaeAvatar }}
          item={{ titulo: activeChatReserva.itemTitulo, imagem: activeChatReserva.itemImagem }}
        />
      )}
    </div>
  );
};

export default MinhasReservas;
