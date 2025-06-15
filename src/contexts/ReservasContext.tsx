
import { createContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCarteira } from './CarteiraContext';

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
  criarReserva: (itemId: number, itemData: any, outraMae: string) => Reserva | null;
  confirmarEntrega: (reservaId: number) => void;
  cancelarReserva: (reservaId: number) => void;
  isItemReservado: (itemId: number) => boolean;
}

export const ReservasContext = createContext<ReservasContextType | undefined>(undefined);

export const ReservasProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const { transferirGirinhas, receberGirinhas, verificarSaldo } = useCarteira();
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
        itemId: 4,
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
        confirmedByOther: true,
        localizacao: "Jardins"
      }
    ];
    setReservas(mockReservas);
  }, []);

  // Sistema de expiração automática
  useEffect(() => {
    const interval = setInterval(() => {
      let changed = false;
      const updatedReservas = reservas.map((reserva): Reserva => {
        if (reserva.status === 'pendente' && new Date() > reserva.prazoExpiracao) {
          changed = true;
          // Reembolsar se foi uma reserva feita pelo usuário
          if (reserva.tipo === 'reservada') {
            receberGirinhas(
              reserva.itemGirinhas,
              reserva.outraMae,
              reserva.itemId,
              `Reembolso - ${reserva.itemTitulo} (expirada)`
            );
          }
          return { ...reserva, status: 'expirada' as const };
        }
        return reserva;
      });
      if (changed) {
        setReservas(updatedReservas);
        toast({
          title: "Reserva expirada",
          description: "Uma reserva expirou. As Girinhas foram reembolsadas.",
          variant: "destructive"
        });
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [reservas, receberGirinhas, toast]);

  const isItemReservado = (itemId: number): boolean => {
    return reservas.some(r => 
      r.itemId === itemId && 
      (r.status === 'pendente' || r.status === 'confirmada')
    );
  };

  const criarReserva = (itemId: number, itemData: any, outraMae: string): Reserva | null => {
    // Verificar se tem saldo suficiente
    if (!verificarSaldo(itemData.girinhas)) {
      toast({
        title: "Saldo insuficiente! 😔",
        description: `Você precisa de ${itemData.girinhas} Girinhas, mas tem apenas ${verificarSaldo} disponíveis.`,
        variant: "destructive"
      });
      return null;
    }

    // Verificar se o item já está reservado
    if (isItemReservado(itemId)) {
      toast({
        title: "Item já reservado",
        description: "Este item já foi reservado por outra mãe.",
        variant: "destructive"
      });
      return null;
    }

    // Transferir as Girinhas
    const transferencia = transferirGirinhas(
      itemData.girinhas,
      outraMae,
      itemId,
      `Reserva - ${itemData.title}`
    );

    if (!transferencia) {
      toast({
        title: "Erro na transferência",
        description: "Não foi possível processar a reserva.",
        variant: "destructive"
      });
      return null;
    }

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
      description: `"${itemData.title}" foi reservado. ${itemData.girinhas} Girinhas foram transferidas.`,
    });

    return novaReserva;
  };

  const confirmarEntrega = (reservaId: number) => {
    let reservaFinalizada = false;
    let reservaConfirmada: Reserva | null = null;
    
    setReservas(prev => {
      const updatedReservas = prev.map((reserva): Reserva => {
        if (reserva.id !== reservaId) {
          return reserva;
        }

        const updatedReserva: Reserva = { ...reserva, confirmedByMe: true };
        
        if (updatedReserva.confirmedByOther) {
          reservaFinalizada = true;
          reservaConfirmada = updatedReserva;
          updatedReserva.status = 'confirmada' as const;
          
          // Transferir as Girinhas para quem vendeu (se eu comprei)
          if (updatedReserva.tipo === 'reservada') {
            receberGirinhas(
              0, // Valor já foi descontado na reserva
              updatedReserva.outraMae,
              updatedReserva.itemId,
              `Troca finalizada - ${updatedReserva.itemTitulo}`
            );
          }
        }
        
        return updatedReserva;
      });

      if (reservaFinalizada && reservaConfirmada) {
        toast({
          title: "Troca Finalizada! 🤝",
          description: "Ambas confirmaram a entrega. A troca foi concluída com sucesso!",
        });
      } else {
        toast({
          title: "Entrega confirmada! ✅",
          description: "Aguardando a confirmação da outra mãe para finalizar a troca.",
        });
      }

      return updatedReservas;
    });
  };

  const cancelarReserva = (reservaId: number) => {
    const reserva = reservas.find(r => r.id === reservaId);
    
    setReservas(prev => prev.map((reserva): Reserva => 
      reserva.id === reservaId 
        ? { ...reserva, status: 'cancelada' as const }
        : reserva
    ));

    // Reembolsar se foi cancelamento dentro de 24h e era uma reserva feita pelo usuário
    if (reserva && reserva.tipo === 'reservada') {
      const horasPassadas = (Date.now() - reserva.dataReserva.getTime()) / (1000 * 60 * 60);
      if (horasPassadas < 24) {
        receberGirinhas(
          reserva.itemGirinhas,
          reserva.outraMae,
          reserva.itemId,
          `Reembolso - ${reserva.itemTitulo} (cancelada)`
        );
        toast({
          title: "Reserva cancelada",
          description: "As Girinhas foram reembolsadas (cancelamento em menos de 24h).",
        });
      } else {
        toast({
          title: "Reserva cancelada",
          description: "Cancelamento após 24h - sem reembolso conforme política.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Reserva cancelada",
        description: "A reserva foi cancelada.",
      });
    }
  };

  return (
    <ReservasContext.Provider value={{ 
      reservas, 
      criarReserva, 
      confirmarEntrega, 
      cancelarReserva,
      isItemReservado 
    }}>
      {children}
    </ReservasContext.Provider>
  );
};
