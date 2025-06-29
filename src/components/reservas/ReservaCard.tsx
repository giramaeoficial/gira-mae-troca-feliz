
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Package, User, MapPin, MessageCircle } from 'lucide-react';
import { BotaoWhatsApp } from '@/components/shared/BotaoWhatsApp';
import LazyImage from '@/components/ui/lazy-image';

interface ReservaCardProps {
  reserva: any;
  onConfirmarEntrega?: (reservaId: string) => void;
  onCancelarReserva?: (reservaId: string) => void;
  onVerificarCodigo?: (reservaId: string) => void;
  isVendedor?: boolean;
}

export const ReservaCard: React.FC<ReservaCardProps> = ({
  reserva,
  onConfirmarEntrega,
  onCancelarReserva,
  onVerificarCodigo,
  isVendedor = false
}) => {
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

  const getActionButtons = () => {
    if (reserva.status !== 'pendente') return null;

    if (isVendedor) {
      return (
        <div className="flex gap-2 mt-4">
          <Button
            onClick={() => onVerificarCodigo?.(reserva.id)}
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

    const contato = isVendedor ? reserva.comprador : reserva.vendedor;
    const numeroWhatsApp = contato?.numero_whatsapp || contato?.telefone?.replace('55', '');
    
    if (!numeroWhatsApp) return null;

    return (
      <BotaoWhatsApp
        reservaId={reserva.id}
        numeroWhatsApp={numeroWhatsApp}
        nomeContato={contato?.nome || 'Usuário'}
        tituloItem={reserva.item?.titulo || 'Item'}
        usuarioRecebeuId={contato?.id}
        isVendedor={isVendedor}
        className="mt-2"
        size="sm"
      />
    );
  };

  return (
    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {reserva.item?.titulo || 'Item não encontrado'}
          </CardTitle>
          {getStatusBadge()}
        </div>
        <div className="text-sm text-gray-600">
          <Clock className="w-4 h-4 inline mr-1" />
          Reservado em {formatDate(reserva.data_reserva)}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Imagem do item */}
        {reserva.item?.fotos?.[0] && (
          <div className="w-full h-32 rounded-lg overflow-hidden">
            <LazyImage
              src={reserva.item.fotos[0]}
              alt={reserva.item.titulo}
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
              {isVendedor ? 'Comprador' : 'Vendedor'}:
            </span>
            <span>{isVendedor ? reserva.comprador?.nome : reserva.vendedor?.nome}</span>
          </div>
          
          {(reserva.vendedor?.cidade || reserva.vendedor?.bairro) && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">
                {[reserva.vendedor?.bairro, reserva.vendedor?.cidade]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Código de confirmação para vendedor */}
        {isVendedor && reserva.status === 'pendente' && reserva.codigo_confirmacao && (
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
        {!isVendedor && reserva.status === 'pendente' && (
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
  );
};

export default ReservaCard;
