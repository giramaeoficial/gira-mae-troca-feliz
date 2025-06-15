
import { createContext, useState, useContext, ReactNode } from 'react';

export interface Transacao {
  id: number;
  tipo: 'recebido' | 'gasto';
  valor: number;
  descricao: string;
  data: Date;
  itemId?: number;
}

interface CarteiraContextType {
  saldo: number;
  transacoes: Transacao[];
  transferirGirinhas: (valor: number, para: string, itemId: number, descricao: string) => boolean;
  receberGirinhas: (valor: number, de: string, itemId: number, descricao: string) => void;
  verificarSaldo: (valor: number) => boolean;
}

const CarteiraContext = createContext<CarteiraContextType | undefined>(undefined);

export const CarteiraProvider = ({ children }: { children: ReactNode }) => {
  const [saldo, setSaldo] = useState(150); // Saldo inicial para demonstração
  const [transacoes, setTransacoes] = useState<Transacao[]>([
    {
      id: 1,
      tipo: 'recebido',
      valor: 50,
      descricao: 'Bônus de boas-vindas',
      data: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: 2,
      tipo: 'recebido',
      valor: 100,
      descricao: 'Girinhas iniciais da comunidade',
      data: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  ]);

  const verificarSaldo = (valor: number): boolean => {
    return saldo >= valor;
  };

  const transferirGirinhas = (valor: number, para: string, itemId: number, descricao: string): boolean => {
    if (!verificarSaldo(valor)) {
      return false;
    }

    setSaldo(prev => prev - valor);
    setTransacoes(prev => [...prev, {
      id: Date.now(),
      tipo: 'gasto',
      valor,
      descricao: `${descricao} - para ${para}`,
      data: new Date(),
      itemId
    }]);

    return true;
  };

  const receberGirinhas = (valor: number, de: string, itemId: number, descricao: string) => {
    setSaldo(prev => prev + valor);
    setTransacoes(prev => [...prev, {
      id: Date.now(),
      tipo: 'recebido',
      valor,
      descricao: `${descricao} - de ${de}`,
      data: new Date(),
      itemId
    }]);
  };

  return (
    <CarteiraContext.Provider value={{
      saldo,
      transacoes,
      transferirGirinhas,
      receberGirinhas,
      verificarSaldo
    }}>
      {children}
    </CarteiraContext.Provider>
  );
};

export const useCarteira = () => {
  const context = useContext(CarteiraContext);
  if (context === undefined) {
    throw new Error('useCarteira must be used within a CarteiraProvider');
  }
  return context;
};
