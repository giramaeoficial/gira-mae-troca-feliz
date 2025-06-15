
import Header from "@/components/shared/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Package, CheckCircle } from "lucide-react";
import { useReservas } from "@/hooks/useReservas";
import ReservaCard from "@/components/reservas/ReservaCard";
import { useAuth } from "@/hooks/useAuth";

const MinhasReservas = () => {
  const { user } = useAuth();
  const { reservas, loading, confirmarEntrega, cancelarReserva } = useReservas();

  const minhasReservasAtivas = reservas.filter(r => 
    r.usuario_reservou === user?.id && 
    ['pendente', 'fila_espera'].includes(r.status)
  );

  const meusItensReservados = reservas.filter(r => 
    r.usuario_item === user?.id && 
    ['pendente', 'fila_espera'].includes(r.status)
  );

  const reservasConcluidas = reservas.filter(r => 
    (r.usuario_reservou === user?.id || r.usuario_item === user?.id) && 
    r.status === 'confirmada'
  );

  const getEstatisticas = () => {
    const totalAtivas = minhasReservasAtivas.length;
    const totalFilaEspera = minhasReservasAtivas.filter(r => r.status === 'fila_espera').length;
    const totalVendas = meusItensReservados.length;
    const totalConcluidas = reservasConcluidas.length;

    return { totalAtivas, totalFilaEspera, totalVendas, totalConcluidas };
  };

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

  const stats = getEstatisticas();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col pb-24 md:pb-8">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent mb-2">
            Minhas Reservas
          </h1>
          <p className="text-gray-600">Gerencie suas reservas ativas, vendas e histórico de trocas</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Package className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{stats.totalAtivas}</p>
              <p className="text-sm text-gray-600">Reservas Ativas</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{stats.totalFilaEspera}</p>
              <p className="text-sm text-gray-600">Na Fila</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{stats.totalVendas}</p>
              <p className="text-sm text-gray-600">Suas Vendas</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{stats.totalConcluidas}</p>
              <p className="text-sm text-gray-600">Concluídas</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Suas Reservas Ativas */}
          {minhasReservasAtivas.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-gray-800">Suas Reservas</h2>
                <Badge variant="secondary">{minhasReservasAtivas.length}</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {minhasReservasAtivas.map(reserva => (
                  <ReservaCard
                    key={reserva.id}
                    reserva={reserva}
                    onConfirmarEntrega={confirmarEntrega}
                    onCancelarReserva={cancelarReserva}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Seus Itens Reservados */}
          {meusItensReservados.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-semibold text-gray-800">Seus Itens Reservados</h2>
                <Badge variant="secondary">{meusItensReservados.length}</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {meusItensReservados.map(reserva => (
                  <ReservaCard
                    key={reserva.id}
                    reserva={reserva}
                    onConfirmarEntrega={confirmarEntrega}
                    onCancelarReserva={cancelarReserva}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Histórico de Trocas Concluídas */}
          {reservasConcluidas.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h2 className="text-xl font-semibold text-gray-800">Trocas Concluídas</h2>
                <Badge variant="secondary">{reservasConcluidas.length}</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reservasConcluidas.slice(0, 6).map(reserva => (
                  <ReservaCard
                    key={reserva.id}
                    reserva={reserva}
                    onConfirmarEntrega={confirmarEntrega}
                    onCancelarReserva={cancelarReserva}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Estado vazio */}
          {reservas.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhuma reserva ainda</h3>
              <p className="text-gray-600">
                Quando você reservar itens ou alguém reservar seus itens, eles aparecerão aqui.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MinhasReservas;
