
import Header from "@/components/shared/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, MapPin, Sparkles, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useReservas } from "@/hooks/useReservas";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const MinhasReservas = () => {
  const { reservas, loading, confirmarEntrega, cancelarReserva } = useReservas();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-500';
      case 'confirmada': return 'bg-green-500';
      case 'expirada': return 'bg-gray-500';
      case 'cancelada': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'confirmada': return 'Confirmada';
      case 'expirada': return 'Expirada';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };

  const formatTimeRemaining = (expirationDate: string) => {
    const now = new Date();
    const expiration = new Date(expirationDate);
    
    if (expiration < now) {
      return "Expirado";
    }
    
    return `Expira ${formatDistanceToNow(expiration, { locale: ptBR, addSuffix: true })}`;
  };

  const reservasPendentes = reservas.filter(r => r.status === 'pendente');
  const reservasConcluidas = reservas.filter(r => r.status !== 'pendente');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando suas reservas...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 text-foreground flex flex-col pb-24 md:pb-8">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent mb-2">
            Minhas Reservas
          </h1>
          <p className="text-gray-600">Gerencie suas trocas em andamento e histórico</p>
        </div>

        {/* Reservas Pendentes */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            Pendentes de troca ({reservasPendentes.length})
          </h2>
          
          {reservasPendentes.length === 0 ? (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhuma reserva pendente</h3>
                <p className="text-gray-600">Quando você reservar ou alguém reservar seus itens, eles aparecerão aqui.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reservasPendentes.map((reserva) => {
                const isReservador = reserva.usuario_reservou;
                const outraPessoa = isReservador ? reserva.profiles_vendedor : reserva.profiles_reservador;
                const jáConfirmei = isReservador ? reserva.confirmado_por_reservador : reserva.confirmado_por_vendedor;
                const outraConfirmou = isReservador ? reserva.confirmado_por_vendedor : reserva.confirmado_por_reservador;
                
                return (
                  <Card key={reserva.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                          <img 
                            src={reserva.itens?.fotos?.[0] || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=100"} 
                            alt={reserva.itens?.titulo || "Item"} 
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div>
                            <CardTitle className="text-lg">{reserva.itens?.titulo}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Sparkles className="w-4 h-4 text-primary" />
                              <span className="font-bold text-primary">{reserva.valor_girinhas}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`${getStatusColor(reserva.status)} text-white mb-2`}>
                            {getStatusText(reserva.status)}
                          </Badge>
                          <p className="text-sm text-gray-500">
                            {formatTimeRemaining(reserva.prazo_expiracao)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={outraPessoa?.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {outraPessoa?.nome?.split(' ').map(n => n[0]).join('') || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{outraPessoa?.nome || 'Usuário'}</p>
                          <p className="text-sm text-gray-600">
                            {isReservador ? 'Dona do item' : 'Reservou o item'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{reserva.localizacao_combinada || 'Local não definido'}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            {jáConfirmei ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-gray-400" />
                            )}
                            <span className={jáConfirmei ? 'text-green-600' : 'text-gray-500'}>
                              Você confirmou
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {outraConfirmou ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-gray-400" />
                            )}
                            <span className={outraConfirmou ? 'text-green-600' : 'text-gray-500'}>
                              {outraPessoa?.nome?.split(' ')[0]} confirmou
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {!jáConfirmei && (
                            <Button 
                              onClick={() => confirmarEntrega(reserva.id)}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              Confirmar Entrega
                            </Button>
                          )}
                          <Button 
                            variant="outline"
                            onClick={() => cancelarReserva(reserva.id)}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Histórico */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Histórico ({reservasConcluidas.length})
          </h2>
          
          {reservasConcluidas.length === 0 ? (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhuma troca concluída</h3>
                <p className="text-gray-600">Suas trocas finalizadas aparecerão aqui.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reservasConcluidas.map((reserva) => {
                const isReservador = reserva.usuario_reservou;
                const outraPessoa = isReservador ? reserva.profiles_vendedor : reserva.profiles_reservador;
                
                return (
                  <Card key={reserva.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm opacity-75">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-4">
                          <img 
                            src={reserva.itens?.fotos?.[0] || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=100"} 
                            alt={reserva.itens?.titulo || "Item"} 
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <h3 className="font-medium">{reserva.itens?.titulo}</h3>
                            <p className="text-sm text-gray-600">
                              {isReservador ? 'Trocado com' : 'Trocado para'} {outraPessoa?.nome}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`${getStatusColor(reserva.status)} text-white`}>
                            {getStatusText(reserva.status)}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDistanceToNow(new Date(reserva.updated_at), { locale: ptBR, addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MinhasReservas;
