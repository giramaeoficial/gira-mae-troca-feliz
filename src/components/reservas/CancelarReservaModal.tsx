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

const motivosCancelamento = [
  {
    value: 'comprador_cancelou',
    label: 'Mudei de ideia',
    description: 'Não quero mais o item',
    forVendedor: false
  },
  {
    value: 'vendedor_cancelou', 
    label: 'Não posso vender',
    description: 'Item não está mais disponível',
    forVendedor: true
  },
  {
    value: 'item_inadequado',
    label: 'Item inadequado',
    description: 'Item não confere com a descrição',
    forVendedor: false
  },
  {
    value: 'desistencia',
    label: 'Desistência',
    description: 'Motivos pessoais',
    forVendedor: 'both'
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

  const motivosDisponiveis = motivosCancelamento.filter(motivo => 
    motivo.forVendedor === 'both' || motivo.forVendedor === isVendedor
  );

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
        p_usuario_id: isVendedor ? reserva.usuario_item : reserva.usuario_reservou,
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

  const motivoSelecionadoObj = motivosDisponiveis.find(m => m.value === motivoSelecionado);
  const temPenalidade = isVendedor && motivoSelecionado === 'vendedor_cancelou';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            Cancelar Reserva
          </DialogTitle>
          <DialogDescription>
            {isVendedor ? 
              'Por que você não pode mais vender este item?' : 
              'Por que você quer cancelar esta reserva?'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações da reserva */}
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
                  {isVendedor ? 
                    `Comprador: ${reserva.profiles_reservador?.nome || 'Usuário'}` : 
                    `Vendedor: ${reserva.profiles_vendedor?.nome || 'Usuário'}`
                  }
                </p>
                <Badge variant="secondary" className="text-xs mt-1">
                  {reserva.valor_girinhas} Girinhas
                </Badge>
              </div>
            </div>
          </div>

          {/* Seleção de motivo */}
          <div className="space-y-3">
            <Label>Selecione o motivo:</Label>
            <RadioGroup value={motivoSelecionado} onValueChange={setMotivoSelecionado}>
              {motivosDisponiveis.map((motivo) => (
                <div key={motivo.value} className="flex items-start space-x-2">
                  <RadioGroupItem value={motivo.value} id={motivo.value} className="mt-1" />
                  <div className="space-y-1 flex-1">
                    <Label 
                      htmlFor={motivo.value} 
                      className="text-sm font-medium cursor-pointer"
                    >
                      {motivo.label}
                    </Label>
                    <p className="text-xs text-gray-500">{motivo.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Aviso de penalidade */}
          {temPenalidade && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Atenção</p>
                  <p className="text-yellow-700">
                    Cancelamentos pelo vendedor podem afetar sua reputação.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Observações opcionais */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <Textarea
              id="observacoes"
              placeholder="Adicione detalhes se necessário..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-gray-500">
              {observacoes.length}/200 caracteres
            </p>
          </div>

          {/* Resumo do reembolso */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <strong>💰 Reembolso:</strong> {reserva.valor_girinhas} Girinhas serão devolvidas
              {!isVendedor ? ' para você' : ' para o comprador'}.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Manter Reserva
          </Button>
          
          <Button 
            variant="destructive"
            onClick={handleCancelar} 
            disabled={loading || !motivoSelecionado}
            className="w-full sm:w-auto"
          >
            {loading ? "Cancelando..." : "Confirmar Cancelamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};