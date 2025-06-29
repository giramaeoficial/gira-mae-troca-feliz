
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Package, User, MapPin } from 'lucide-react';
import { BotaoWhatsApp } from '@/components/shared/BotaoWhatsApp';
import LazyImage from '@/components/ui/lazy-image';
import CodigoConfirmacaoModal from './CodigoConfirmacaoModal';

interface ReservaCardProps {
  reserva: any;
  onConfirmarEntrega?: (reservaId: string, codigo: string) => Promise<boolean>;
  onCancelarReserva?: (reservaId: string) => void;
  onVerificarCodigo?: (reservaId: string) => void;
  onRefresh?: () => void;
  isVendedor?: boolean;
}

export const ReservaCard: React.FC<ReservaCardProps> = ({
  reserva,
  onConfirmarEntrega,
  onCancelarReserva,
  onVerificarCodigo,
  onRefresh,
  isVendedor = false
}) => {
  const [showCodigoModal, setShowCodigoModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const getStatusBadge = () => {
    switch (reserva.status) {
      case 'pendente':
        return <Badge className="bg-orange-500 text-white">Pendente</Badge>;
      case 'confirmada':
        return <Badge className="bg-green-500 text-white">Confirmada</Badge>;
      case 'cancelada':
        return <Badge className="bg-red-500 text-white">Cancelada</Badge>;
      case 'expirada':
        return <Badge className="bg-gray-500 text-white">Expirada</Badge>;
      default:
        return <Badge variant="secondary">{reserva.status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleConfirmarEntrega = () => {
    if (isVendedor) {
      setShowCodigoModal(true);
    }
  };

  const handleConfirmarCodigo = async (codigo: string): Promise<boolean> => {
    if (!onConfirmarEntrega) return false;
    
    setLoading(true);
    try {
      const sucesso = await onConfirmarEntrega(reserva.id, codigo);
      if (sucesso) {
        setShowCodigoModal(false);
        onRefresh?.();
      }
      return sucesso;
    } finally {
      setLoading(false);
    }
  };

  const getActionButtons = () => {
    if (reserva.status !== 'pendente') return null;

    if (isVendedor) {
      return (
        <div className="flex gap-2 mt-4">
          <Button
            onClick={handleConfirmarEntrega}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Confirmar Entrega
          </Button>
          <Button
            onClick={() => onCancelarReserva?.(reserva.id)}
            variant="outline"
            className="flex-1"
          >
            Cancelar
          </Button>
        </div>
      );
    } else {
      return (
        <div className="flex gap-2 mt-4">
          <Button
            onClick={() => onCancelarReserva?.(reserva.id)}
            variant="outline"
            className="flex-1"
          >
            Cancelar Reserva
          </Button>
        </div>
      );
    }
  };

  const getWhatsAppButton = () => {
    if (reserva.status !== 'pendente') return null;

    const contato = isVendedor ? reserva.profiles_reservador : reserva.profiles_vendedor;
    const numeroWhatsApp = contato?.numero_whatsapp || contato?.telefone?.replace('55', '');
    
    if (!numeroWhatsApp) return null;

    return (
      <BotaoWhatsApp
        reservaId={reserva.id}
        numeroWhatsApp={numeroWhatsApp}
        nomeContato={contato?.nome || 'Usuário'}
        tituloItem={reserva.itens?.titulo || 'Item'}
        usuarioRecebeuId={contato?.id}
        isVendedor={isVendedor}
        className="mt-2"
        size="sm"
      />
    );
  };

  // Determinar se é vendedor baseado na estrutura dos dados
  const eVendedor = reserva.usuario_item && reserva.profiles_reservador;
  const eComprador = reserva.usuario_reservou && reserva.profiles_vendedor;

  return (
    <>
      <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              {reserva.itens?.titulo || 'Item não encontrado'}
            </CardTitle>
            {getStatusBadge()}
          </div>
          <div className="text-sm text-gray-600">
            <Clock className="w-4 h-4 inline mr-1" />
            Reservado em {formatDate(reserva.data_reserva || reserva.created_at)}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Imagem do item */}
          {reserva.itens?.fotos?.[0] && (
            <div className="w-full h-32 rounded-lg overflow-hidden">
              <LazyImage
                src={reserva.itens.fotos[0]}
                alt={reserva.itens.titulo}
                bucket="itens"
                size="medium"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Informações do item */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Valor:</span>
              <div className="text-primary font-bold">
                {reserva.valor_girinhas} {reserva.valor_girinhas === 1 ? 'Girinha' : 'Girinhas'}
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Taxa:</span>
              <div className="text-gray-600">
                {reserva.valor_taxa} {reserva.valor_taxa === 1 ? 'Girinha' : 'Girinhas'}
              </div>
            </div>
          </div>

          {/* Informações de contato */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-gray-600" />
              <span className="font-medium">
                {eVendedor ? 'Comprador' : 'Vendedor'}:
              </span>
              <span>{eVendedor ? reserva.profiles_reservador?.nome : reserva.profiles_vendedor?.nome}</span>
            </div>
            
            {(reserva.profiles_vendedor?.cidade || reserva.profiles_vendedor?.bairro) && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">
                  {[reserva.profiles_vendedor?.bairro, reserva.profiles_vendedor?.cidade]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Código de confirmação para vendedor */}
          {eVendedor && reserva.status === 'pendente' && reserva.codigo_confirmacao && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-800 mb-1">
                Código de Confirmação:
              </div>
              <div className="text-2xl font-bold text-blue-600 text-center">
                {reserva.codigo_confirmacao}
              </div>
              <div className="text-xs text-blue-700 mt-1 text-center">
                Peça este código ao comprador no momento da entrega
              </div>
            </div>
          )}

          {/* Instruções para comprador */}
          {eComprador && reserva.status === 'pendente' && (
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="text-sm text-green-800">
                <strong>📱 Próximos passos:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Entre em contato pelo WhatsApp</li>
                  <li>Combine local e horário</li>
                  <li>Informe o código ao vendedor na entrega</li>
                </ol>
              </div>
            </div>
          )}

          {/* Botão WhatsApp */}
          {getWhatsAppButton()}

          {/* Botões de ação */}
          {getActionButtons()}
        </CardContent>
      </Card>

      {/* Modal de confirmação de código */}
      <CodigoConfirmacaoModal
        isOpen={showCodigoModal}
        onClose={() => setShowCodigoModal(false)}
        reserva={reserva}
        isVendedor={eVendedor}
        onConfirmarCodigo={handleConfirmarCodigo}
        loading={loading}
      />
    </>
  );
};

export default ReservaCard;
