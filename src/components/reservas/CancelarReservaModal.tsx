// FILE: src/components/reservas/CancelarReservaModal.tsx

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CancelarReservaModalProps {
  isOpen: boolean;
  onClose: () => void;
  reserva: {
    id: string;
    item_id: string;
    usuario_reservou: string;
    usuario_item: string;
    valor_girinhas: number;
    itens?: {
      titulo: string;
      fotos: string[] | null;
    } | null;
    profiles_reservador?: {
      nome: string;
    } | null;
    profiles_vendedor?: {
      nome: string;
    } | null;
  };
  isVendedor: boolean;
  onCancelamentoCompleto: () => void;
}

// Motivos específicos para vendedor conforme especificação
const motivosCancelamento = [
  {
    value: 'remover_item',
    label: 'Não vou mais vender esse item e quero remover da plataforma.',
    forVendedor: true
  },
  {
    value: 'trocar_comprador',
    label: 'Não me acertei com atual comprador. Encontrar outro comprador.',
    forVendedor: true
  },
  {
    value: 'outro',
    label: 'Outro motivo',
    forVendedor: true
  }
];

export const CancelarReservaModal = ({
  isOpen,
  onClose,
  reserva,
  isVendedor,
  onCancelamentoCompleto
}: CancelarReservaModalProps) => {
  const [motivoSelecionado, setMotivoSelecionado] = useState<string>('');
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Para vendedor, mostrar todas as opções
  const motivosDisponiveis = isVendedor ? motivosCancelamento : [];

  const handleCancelar = async () => {
    if (!motivoSelecionado) {
      toast({
        title: 'Motivo obrigatório',
        description: 'Por favor, selecione um motivo para o cancelamento.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Chamar função RPC para cancelar reserva com motivo
      const { data, error } = await supabase.rpc('cancelar_reserva', {
        p_reserva_id: reserva.id,
        p_usuario_id: reserva.usuario_item, // Sempre o vendedor que está cancelando
        p_motivo: motivoSelecionado
      });

      if (error) {
        throw error;
      }

      if (data === true) {
        toast({
          title: 'Reserva cancelada',
          description: 'A reserva foi cancelada e o valor foi reembolsado.',
        });
        
        onCancelamentoCompleto();
        onClose();
      } else {
        throw new Error('Não foi possível cancelar a reserva');
      }

    } catch (error: any) {
      console.error('Erro ao cancelar reserva:', error);
      toast({
        title: 'Erro ao cancelar',
        description: error.message || 'Tente novamente em alguns minutos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto p-0 gap-0">
        <div className="space-y-4 p-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-red-600">🚫 Cancelar Reserva</h2>
            <p className="text-sm text-gray-600 mt-1">
              Por que você está cancelando?
            </p>
          </div>

          {/* Informações do item - MANTER IGUAL ao atual */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <img
                src={reserva.itens?.fotos?.[0] || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=100"}
                alt={reserva.itens?.titulo || "Item"}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h4 className="font-medium text-sm line-clamp-1">
                  {reserva.itens?.titulo || "Item"}
                </h4>
                <p className="text-xs text-gray-600">
                  Comprador: {reserva.profiles_reservador?.nome || 'Usuário'}
                </p>
                <Badge variant="secondary" className="text-xs mt-1">
                  {reserva.valor_girinhas} Girinhas
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Opções EXATAS solicitadas */}
          <div className="space-y-2">
            {motivosDisponiveis.map((motivo) => (
              <label key={motivo.value} className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input 
                  type="radio" 
                  name="motivo" 
                  value={motivo.value}
                  className="mt-1" 
                  checked={motivoSelecionado === motivo.value}
                  onChange={(e) => setMotivoSelecionado(e.target.value)}
                />
                <span className="text-sm">{motivo.label}</span>
              </label>
            ))}
          </div>

          {/* Campo observações - OPCIONAL */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Observações (opcional)</label>
            <textarea 
              className="w-full p-3 border rounded-lg text-sm"
              placeholder="[Campo observações - opcional]"
              maxLength={200}
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>

          {/* Aviso FIXO - sempre igual */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-sm">
              <div className="font-medium text-green-800">💰 {reserva.valor_girinhas} Girinhas serão devolvidas para {reserva.profiles_reservador?.nome || 'o comprador'}</div>
              <div className="text-green-700 mt-1">O item ficará disponível para outros compradores</div>
            </div>
          </div>
          {/* Botões */}
          <div className="flex flex-col gap-3 pt-4">
            <button 
              className="w-full bg-red-500 text-white py-3 rounded-lg font-medium disabled:opacity-50"
              onClick={handleCancelar}
              disabled={loading || !motivoSelecionado}
            >
              {loading ? "Cancelando..." : "Confirmar"}
            </button>
            <button 
              className="w-full border border-gray-300 py-3 rounded-lg font-medium"
              onClick={onClose}
            >
              Manter Reserva
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};