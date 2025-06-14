
import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
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

interface ReservasContextType {
  reservas: Reserva[];
  criarReserva: (itemId: number, itemData: any, outraMae: string) => Reserva;
  confirmarEntrega: (reservaId: number) => void;
  cancelarReserva: (reservaId: number) => void;
}

export const ReservasContext = createContext<ReservasContextType | undefined>(undefined);

export const ReservasProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [reservas, setReservas] = useState<Reserva[]>([]);

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
      },
      {
        id: 2,
        itemId: 4, // Item Vestido de festa rosa, que está indisponível no feed
        itemTitulo: "Vestido de festa rosa",
        itemImagem: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=300",
        itemGirinhas: 25,
        outraMae: "Juliana Santos",
        outraMaeAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        tipo: 'recebida',
        status: 'pendente',
        dataReserva: new Date(Date.now() - 24 * 60 * 60 * 1000),
        prazoExpiracao: new Date(Date.now() + 24 * 60 * 60 * 1000),
        confirmedByMe: false,
        confirmedByOther: true, // Simula que a outra mãe já confirmou
        localizacao: "Jardins"
      }
    ];
    setReservas(mockReservas);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      let changed = false;
      const updatedReservas = reservas.map(reserva => {
        if (reserva.status === 'pendente' && new Date() > reserva.prazoExpiracao) {
          changed = true;
          return { ...reserva, status: 'expirada' };
        }
        return reserva;
      });
      if (changed) {
        setReservas(updatedReservas);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [reservas]);

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
      prazoExpiracao: new Date(Date.now() + 48 * 60 * 60 * 1000),
      confirmedByMe: false,
      confirmedByOther: false,
      localizacao: itemData.localizacao
    };

    setReservas(prev => [...prev, novaReserva]);
    
    toast({
      title: "Item reservado! 🎉",
      description: `"${itemData.title}" foi reservado. Combine a entrega com ${outraMae}.`,
    });

    return novaReserva;
  };

  const confirmarEntrega = (reservaId: number) => {
    let reservaFinalizada = false;
    
    setReservas(prev => prev.map(reserva => {
      if (reserva.id === reservaId) {
        const updatedReserva = { ...reserva, confirmedByMe: true };
        if (updatedReserva.confirmedByOther) {
          updatedReserva.status = 'confirmada';
          reservaFinalizada = true;
        }
        return updatedReserva;
      }
      return reserva;
    }));

    if (reservaFinalizada) {
      toast({
        title: "Troca Finalizada! 🤝",
        description: "Ambas confirmaram a entrega. As Girinhas foram transferidas!",
      });
    } else {
      toast({
        title: "Entrega confirmada! ✅",
        description: "Aguardando a confirmação da outra mãe para finalizar a troca.",
      });
    }
  };

  const cancelarReserva = (reservaId: number) => {
    setReservas(prev => prev.map(reserva => 
      reserva.id === reservaId 
        ? { ...reserva, status: 'cancelada' }
        : reserva
    ));

    toast({
      title: "Reserva cancelada",
      description: "A reserva foi cancelada. O item pode voltar a ficar disponível.",
      variant: "destructive"
    });
  };

  return (
    <ReservasContext.Provider value={{ reservas, criarReserva, confirmarEntrega, cancelarReserva }}>
      {children}
    </ReservasContext.Provider>
  );
};
