import { useState } from "react";
import Header from "@/components/shared/Header";
import QuickNav from "@/components/shared/QuickNav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Package, CheckCircle } from "lucide-react";
import { useReservas } from "@/hooks/useReservas";
import ReservaCard from "@/components/reservas/ReservaCard";
import FilaEsperaCard from "@/components/reservas/FilaEsperaCard";
import ModalItemDetalhes from "@/components/reservas/ModalItemDetalhes";
import { useAuth } from "@/hooks/useAuth";
import UniversalCard from "@/components/ui/universal-card";

const MinhasReservas = () => {
  const { user } = useAuth();
  const { reservas, filasEspera, loading, confirmarEntrega, cancelarReserva, sairDaFila, refetch } = useReservas();
  
  // ✅ NOVOS ESTADOS PARA FILTRO E MODAL
  const [filtroStatus, setFiltroStatus] = useState<string>('todas');
  const [modalItemAberto, setModalItemAberto] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState<string | null>(null);
  const [contextType, setContextType] = useState<'reserva' | 'fila' | 'venda' | 'concluida'>('reserva');

  const minhasReservasAtivas = reservas.filter(r => 
    r.usuario_reservou === user?.id && 
    ['pendente'].includes(r.status)
  );

  const meusItensReservados = reservas.filter(r => 
    r.usuario_item === user?.id && 
    ['pendente'].includes(r.status)
  );

  const reservasConcluidas = reservas.filter(r => 
    (r.usuario_reservou === user?.id || r.usuario_item === user?.id) && 
    r.status === 'confirmada'
  );

  // ✅ FUNÇÃO PARA ABRIR MODAL
  const abrirModalItem = (itemId: string, context: 'reserva' | 'fila' | 'venda' | 'concluida' = 'reserva') => {
    setItemSelecionado(itemId);
    setContextType(context);
    setModalItemAberto(true);
  };

  // ✅ FUNÇÃO PARA FILTRAR RESERVAS
  const getReservasFiltradas = () => {
    switch (filtroStatus) {
      case 'ativas':
        return minhasReservasAtivas;
      case 'fila':
        return filasEspera;
      case 'vendas':
        return meusItensReservados;
      case 'concluidas':
        return reservasConcluidas;
      default:
        return []; // Quando 'todas', mostra seções separadas
    }
  };

  // ✅ ESTATÍSTICAS COM FILTRO
  const getEstatisticas = () => {
    return [
      {
        icon: Package,
        title: "Reservas Ativas",
        value: minhasReservasAtivas.length,
        gradient: "bg-gradient-to-br from-primary to-pink-500",
        filtro: "ativas"
      },
      {
        icon: Users,
        title: "Na Fila",
        value: filasEspera.length,
        gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
        filtro: "fila"
      },
      {
        icon: Clock,
        title: "Suas Vendas",
        value: meusItensReservados.length,
        gradient: "bg-gradient-to-br from-orange-500 to-orange-600",
        filtro: "vendas"
      },
      {
        icon: CheckCircle,
        title: "Concluídas",
        value: reservasConcluidas.length,
        gradient: "bg-gradient-to-br from-green-500 to-green-600",
        filtro: "concluidas"
      }
    ];
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
      <main className="flex-grow container mx-auto px-4 py-8 pb-32 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent mb-2">
            Minhas Reservas
          </h1>
          <p className="text-gray-600">Gerencie suas reservas ativas, vendas e histórico de trocas</p>
        </div>

        {/* ✅ ESTATÍSTICAS COM FILTRO CLICÁVEL */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card
              key={stat.filtro}
              className={`${stat.gradient} text-white cursor-pointer hover:scale-105 transition-transform border-0 shadow-lg ${
                filtroStatus === stat.filtro ? 'ring-4 ring-white ring-opacity-50' : ''
              }`}
              onClick={() => setFiltroStatus(filtroStatus === stat.filtro ? 'todas' : stat.filtro)}
            >
              <CardContent className="p-4 text-center">
                <stat.icon className="w-6 h-6 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm opacity-90">{stat.title}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ✅ INDICADOR DE FILTRO ATIVO */}
        {filtroStatus !== 'todas' && (
          <div className="mb-6 flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              Filtro: {stats.find(s => s.filtro === filtroStatus)?.title}
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setFiltroStatus('todas')}
              className="text-sm"
            >
              Limpar filtro
            </Button>
          </div>
        )}

        {/* ✅ MODO FILTRADO - LISTA UNIFICADA */}
        {filtroStatus !== 'todas' && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtroStatus === 'fila' ? (
                // Filas de espera usam FilaEsperaCard
                filasEspera.map(fila => (
                  <FilaEsperaCard
                    key={fila.id}
                    fila={fila}
                    onSairDaFila={sairDaFila}
                  />
                ))
              ) : (
                // Demais usam ReservaCard
                getReservasFiltradas().map(reserva => (
                  <ReservaCard
                    key={reserva.id}
                    reserva={reserva}
                    onConfirmarEntrega={confirmarEntrega}
                    onCancelarReserva={cancelarReserva}
                    onRefresh={refetch}
                    onVerDetalhes={(itemId) => abrirModalItem(itemId, filtroStatus as any)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* ✅ MODO PADRÃO - SEÇÕES SEPARADAS */}
        {filtroStatus === 'todas' && (
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
                      onRefresh={refetch}
                      onVerDetalhes={(itemId) => abrirModalItem(itemId, 'reserva')}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Filas de Espera */}
            {filasEspera.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-semibold text-gray-800">Suas Filas de Espera</h2>
                  <Badge variant="secondary">{filasEspera.length}</Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filasEspera.map(fila => (
                    <FilaEsperaCard
                      key={fila.id}
                      fila={fila}
                      onSairDaFila={sairDaFila}
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
                      onRefresh={refetch}
                      onVerDetalhes={(itemId) => abrirModalItem(itemId, 'venda')}
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
                      onRefresh={refetch}
                      onVerDetalhes={(itemId) => abrirModalItem(itemId, 'concluida')}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Estado vazio */}
            {reservas.length === 0 && filasEspera.length === 0 && (
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
        )}
      </main>

      {/* ✅ MODAL ITEM DETALHES */}
      <ModalItemDetalhes
        isOpen={modalItemAberto}
        onClose={() => setModalItemAberto(false)}
        itemId={itemSelecionado}
        contextType={contextType}
      />

      <QuickNav />
    </div>
  );
};

export default MinhasReservas;
