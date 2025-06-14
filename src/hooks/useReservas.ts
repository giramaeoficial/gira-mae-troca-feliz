
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Reserva {
  id: number;
  itemId: number;
  itemTitulo: string;
  itemImagem: string;
  itemGirinhas: number;
  outraMae: string;
  outraMaeAvatar: string;
  tipo: 'reservada' | 'recebida';
  status: 'pendente' | 'confirmada' | 'expirada' | 'cancelada';
  dataReserva: Date;
  prazoExpiracao: Date;
  confirmedByMe: boolean;
  confirmedByOther: boolean;
  localizacao: string;
}

export const useReservas = () => {
  const { toast } = useToast();
  const [reservas, setReservas] = useState<Reserva[]>([]);

  // Simular carregamento de reservas
  useEffect(() => {
    const mockReservas: Reserva[] = [
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
        dataReserva: new Date(Date.now() - 2 * 60 * 60 * 1000),
        prazoExpiracao: new Date(Date.now() + 46 * 60 * 60 * 1000),
        confirmedByMe: false,
        confirmedByOther: false,
        localizacao: "Pinheiros"
      }
    ];
    setReservas(mockReservas);
  }, []);

  const criarReserva = (itemId: number, itemData: any, outraMae: string) => {
    const novaReserva: Reserva = {
      id: Date.now(),
      itemId,
      itemTitulo: itemData.title,
      itemImagem: itemData.image,
      itemGirinhas: itemData.girinhas,
      outraMae,
      outraMaeAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      tipo: 'reservada',
      status: 'pendente',
      dataReserva: new Date(),
      prazoExpiracao: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 horas
      confirmedByMe: false,
      confirmedByOther: false,
      localizacao: itemData.localizacao
    };

    setReservas(prev => [...prev, novaReserva]);
    
    toast({
      title: "Item reservado! 🎉",
      description: `${itemData.title} foi reservado. Entre em contato com ${outraMae} para combinar a troca.`,
    });

    return novaReserva;
  };

  const confirmarEntrega = (reservaId: number) => {
    setReservas(prev => prev.map(reserva => 
      reserva.id === reservaId 
        ? { ...reserva, confirmedByMe: true }
        : reserva
    ));

    toast({
      title: "Entrega confirmada! ✅",
      description: "Aguardando confirmação da outra mãe para finalizar a troca.",
    });
  };

  const cancelarReserva = (reservaId: number) => {
    setReservas(prev => prev.map(reserva => 
      reserva.id === reservaId 
        ? { ...reserva, status: 'cancelada' }
        : reserva
    ));

    toast({
      title: "Reserva cancelada",
      description: "As Girinhas foram desbloqueadas e o item voltou ao feed.",
      variant: "destructive"
    });
  };

  // Verificar expiração automática
  useEffect(() => {
    const interval = setInterval(() => {
      setReservas(prev => prev.map(reserva => {
        if (reserva.status === 'pendente' && new Date() > reserva.prazoExpiracao) {
          return { ...reserva, status: 'expirada' };
        }
        return reserva;
      }));
    }, 60000); // Verificar a cada minuto

    return () => clearInterval(interval);
  }, []);

  return {
    reservas,
    criarReserva,
    confirmarEntrega,
    cancelarReserva,
  };
};
