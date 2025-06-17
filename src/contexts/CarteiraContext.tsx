
import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRecompensas } from '@/components/recompensas/ProviderRecompensas';

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
  loading: boolean;
  transferirGirinhas: (valor: number, para: string, itemId: number, descricao: string) => boolean;
  receberGirinhas: (valor: number, de: string, itemId: number, descricao: string) => void;
  verificarSaldo: (valor: number) => boolean;
  comprarPacote: (pacoteId: string) => Promise<boolean>;
  recarregarSaldo: () => Promise<void>;
}

const CarteiraContext = createContext<CarteiraContextType | undefined>(undefined);

export const CarteiraProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { mostrarRecompensa } = useRecompensas();
  const [saldo, setSaldo] = useState(0);
  const [loading, setLoading] = useState(false);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);

  // Carregar saldo inicial
  useEffect(() => {
    if (user) {
      recarregarSaldo();
    }
  }, [user]);

  const recarregarSaldo = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('carteiras')
        .select('saldo_atual')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setSaldo(data?.saldo_atual || 0);
    } catch (error) {
      console.error('Erro ao carregar saldo:', error);
    }
  };

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

  // Método centralizado para compra de pacotes
  const comprarPacote = async (pacoteId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para comprar Girinhas.",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      // Buscar dados do pacote
      const { data: pacote, error: pacoteError } = await supabase
        .from('pacotes_girinhas')
        .select('*')
        .eq('id', pacoteId)
        .single();

      if (pacoteError || !pacote) {
        throw new Error('Pacote não encontrado');
      }

      // Simular processamento de pagamento (sempre aprovado para demo)
      const paymentId = `demo_${Date.now()}`;

      // Criar registro da compra
      const { data: compra, error: compraError } = await supabase
        .from('compras_girinhas')
        .insert({
          user_id: user.id,
          pacote_id: pacoteId,
          valor_pago: pacote.valor_real,
          girinhas_recebidas: pacote.valor_girinhas,
          status: 'aprovado',
          payment_id: paymentId
        })
        .select()
        .single();

      if (compraError) throw compraError;

      // Adicionar Girinhas à carteira via transação
      const { error: transacaoError } = await supabase
        .from('transacoes')
        .insert({
          user_id: user.id,
          tipo: 'compra',
          valor: pacote.valor_girinhas,
          descricao: `Compra de pacote: ${pacote.nome}`
        });

      if (transacaoError) throw transacaoError;

      // Atualizar saldo local imediatamente
      setSaldo(prev => prev + pacote.valor_girinhas);

      // Mostrar celebração especial para compras
      const economiaTexto = pacote.desconto_percentual > 0 
        ? ` (Você economizou ${pacote.desconto_percentual}%!)` 
        : '';

      setTimeout(() => {
        mostrarRecompensa({
          tipo: 'cadastro',
          valor: pacote.valor_girinhas,
          descricao: `Parabéns pela compra do ${pacote.nome}!${economiaTexto} Agora você pode fazer trocas incríveis.`
        });
      }, 500);

      // Toast imediato
      toast({
        title: "💳 Compra realizada!",
        description: `${pacote.valor_girinhas} Girinhas adicionadas à sua carteira!`,
      });

      // Recarregar saldo do servidor para sincronizar
      await recarregarSaldo();
      
      return true;
    } catch (err) {
      console.error('Erro ao processar compra:', err);
      
      toast({
        title: "Erro na compra",
        description: "Não foi possível processar a compra. Tente novamente.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CarteiraContext.Provider value={{
      saldo,
      transacoes,
      loading,
      transferirGirinhas,
      receberGirinhas,
      verificarSaldo,
      comprarPacote,
      recarregarSaldo
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
