
import Header from "@/components/shared/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, MessageCircle, CheckCircle2, X, MapPin, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Reserva {
  id: number;
  itemId: number;
  itemTitulo: string;
  itemImagem: string;
  itemGirinhas: number;
  outraMae: string;
  outraMaeAvatar: string;
  tipo: 'reservada' | 'recebida'; // reservada = eu reservei, recebida = reservaram de mim
  status: 'pendente' | 'confirmada' | 'expirada' | 'cancelada';
  dataReserva: Date;
  prazoExpiracao: Date;
  confirmedByMe: boolean;
  confirmedByOther: boolean;
  localizacao: string;
}

const MinhasReservas = () => {
  const { toast } = useToast();
  const [reservas] = useState<Reserva[]>([
    {
      id: 1,
      itemId: 2,
      itemTitulo: "Tênis All Star Baby",
      itemImagem: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=300",
      itemGirinhas: 20,
      outraMae: "Carla Silva",
      outraMaeAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      tipo: 'reservada',
      status: 'pendente',
      dataReserva: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      prazoExpiracao: new Date(Date.now() + 46 * 60 * 60 * 1000), // 46 horas restantes
      confirmedByMe: false,
      confirmedByOther: false,
      localizacao: "Pinheiros"
    },
    {
      id: 2,
      itemId: 1,
      itemTitulo: "Kit Body Carter's",
      itemImagem: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300",
      itemGirinhas: 15,
      outraMae: "Fernanda Costa",
      outraMaeAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b96c?w=150",
      tipo: 'recebida',
      status: 'confirmada',
      dataReserva: new Date(Date.now() - 24 * 60 * 60 * 1000),
      prazoExpiracao: new Date(Date.now() + 24 * 60 * 60 * 1000),
      confirmedByMe: true,
      confirmedByOther: true,
      localizacao: "Vila Madalena"
    }
  ]);

  const useCountdown = (targetDate: Date) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
      const difference = +targetDate - +new Date();
      let timeLeft = {};

      if (difference > 0) {
        timeLeft = {
          horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutos: Math.floor((difference / 1000 / 60) % 60),
          segundos: Math.floor((difference / 1000) % 60)
        };
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
    const timeLeft = useCountdown(expirationDate);

    if (Object.keys(timeLeft).length === 0) {
      return <span className="text-red-500 font-medium">Expirado</span>;
    }

    return (
      <div className="flex items-center gap-1 text-orange-600 font-medium">
        <Clock className="w-4 h-4" />
        <span>{(timeLeft as any).horas}h {(timeLeft as any).minutos}m restantes</span>
      </div>
    );
  };

  const handleConfirmarEntrega = (reservaId: number) => {
    toast({
      title: "Entrega confirmada! ✅",
      description: "Aguardando confirmação da outra mãe para finalizar a troca.",
    });
  };

  const handleCancelarReserva = (reservaId: number) => {
    toast({
      title: "Reserva cancelada",
      description: "As Girinhas foram desbloqueadas e o item voltou ao feed.",
      variant: "destructive"
    });
  };

  const handleAbrirChat = (outraMae: string) => {
    toast({
      title: `Chat aberto com ${outraMae}`,
      description: "Sistema de mensagens em desenvolvimento.",
    });
  };

  const reservasPendentes = reservas.filter(r => r.status === 'pendente');
  const reservasConcluidas = reservas.filter(r => r.status === 'confirmada');
  const reservasExpiradas = reservas.filter(r => r.status === 'expirada' || r.status === 'cancelada');

  const ReservaCard = ({ reserva }: { reserva: Reserva }) => (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <img 
            src={reserva.itemImagem} 
            alt={reserva.itemTitulo} 
            className="w-20 h-20 rounded-lg object-cover"
          />
          <div className="flex-grow space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-800">{reserva.itemTitulo}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-3 h-3" />
                  {reserva.localizacao}
                </div>
              </div>
              <Badge 
                className={`${
                  reserva.status === 'pendente' ? 'bg-orange-500' :
                  reserva.status === 'confirmada' ? 'bg-green-500' : 'bg-gray-500'
                } text-white`}
              >
                {reserva.tipo === 'reservada' ? 'Você reservou' : 'Reservaram de você'}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={reserva.outraMaeAvatar} alt={reserva.outraMae} />
                <AvatarFallback className="text-xs">
                  {reserva.outraMae.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">{reserva.outraMae}</span>
              <div className="flex items-center gap-1 text-primary font-medium">
                <Sparkles className="w-4 h-4" />
                {reserva.itemGirinhas}
              </div>
            </div>

            {reserva.status === 'pendente' && (
              <CountdownTimer expirationDate={reserva.prazoExpiracao} />
            )}

            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleAbrirChat(reserva.outraMae)}
                className="flex-1"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Chat
              </Button>
              
              {reserva.status === 'pendente' && (
                <>
                  <Button 
                    size="sm"
                    onClick={() => handleConfirmarEntrega(reserva.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Confirmar Entrega
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleCancelarReserva(reserva.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>

            {reserva.status === 'confirmada' && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Troca realizada com sucesso!</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 text-foreground flex flex-col">
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
                <ReservaCard key={reserva.id} reserva={reserva} />
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
                <ReservaCard key={reserva.id} reserva={reserva} />
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
                <ReservaCard key={reserva.id} reserva={reserva} />
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
    </div>
  );
};

export default MinhasReservas;
