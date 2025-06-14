
import { useContext } from 'react';
import { ReservasContext, Reserva } from '@/contexts/ReservasContext';

export const useReservas = () => {
  const context = useContext(ReservasContext);
  if (context === undefined) {
    throw new Error('useReservas must be used within a ReservasProvider');
  }
  return context;
};

export type { Reserva };
