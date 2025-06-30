
import React, { useCallback, useMemo } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, MessageSquare, MapPin, User, Loader2, ShoppingBag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface ItemCardProps {
  item: any;
  feedData: {
    favoritos: string[];
    reservas_usuario: Array<{
      item_id: string;
      status: string;
      usuario_reservou?: string; // ✅ Mantido opcional
      id?: string; // ✅ Mantido opcional
    }>;
    filas_espera: Record<string, {
      total_fila: number;
      posicao_usuario?: number;
      usuario_id?: string; // ✅ Mantido opcional
    }>;
  };
  currentUserId: string;
  taxaTransacao?: number;
  compact?: boolean;
  showActions?: boolean;
  showLocation?: boolean;
  showAuthor?: boolean;
  onItemClick?: (itemId: string) => void;
  onToggleFavorito?: () => void;
  onReservar?: () => void;
  onEntrarFila?: () => void;
  actionState?: 'loading' | 'success' | 'error' | 'idle';
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  feedData,
  currentUserId,
  taxaTransacao = 5,
  compact = false,
  showActions = true,
  showLocation = true,
  showAuthor = true,
  onItemClick,
  onToggleFavorito,
  onReservar,
  onEntrarFila,
  actionState
}) => {
  const isFavorito = useMemo(() => feedData.favoritos.includes(item.id), [feedData.favoritos, item.id]);
  const isReservado = useMemo(() => feedData.reservas_usuario.some(reserva => reserva.item_id === item.id && reserva.status === 'pendente'), [feedData.reservas_usuario, item.id]);
  const filaEspera = useMemo(() => feedData.filas_espera[item.id]?.total_fila || 0, [feedData.filas_espera, item.id]);
  const posicaoFila = useMemo(() => feedData.filas_espera[item.id]?.posicao_usuario || 0, [feedData.filas_espera, item.id]);

  const handleCardClick = useCallback(() => {
    if (onItemClick) {
      onItemClick(item.id);
    }
  }, [item.id, onItemClick]);

  const renderActions = () => {
    if (!showActions) return null;

    const isLoading = actionState === 'loading';
    const isSuccess = actionState === 'success';

    return (
      <div className="flex items-center justify-between w-full">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onToggleFavorito) onToggleFavorito();
                }}
                disabled={isLoading}
              >
                {isFavorito ? <Heart fill="red" className="h-4 w-4 text-red-500" /> : <Heart className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <span>{isFavorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {isReservado ? (
          <Badge variant="secondary">Reservado</Badge>
        ) : (
          <div className="flex gap-2">
            {filaEspera > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline">
                      Fila: {posicaoFila}/{filaEspera}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>Você está na posição {posicaoFila} de {filaEspera} na fila de espera</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Button
              variant="default"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (onReservar) onReservar();
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aguarde...
                </>
              ) : isSuccess ? (
                <>Reservado!</>
              ) : (
                <>
                  Reservar
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderLocation = () => {
    if (!showLocation || !item.endereco_cidade) return null;

    return (
      <div className="flex items-center text-xs text-gray-500">
        <MapPin className="w-3 h-3 mr-1" />
        {item.endereco_cidade}{item.endereco_bairro ? `, ${item.endereco_bairro}` : ''}
      </div>
    );
  };

  const renderAuthor = () => {
    if (!showAuthor || !item.publicado_por_profile) return null;

    return (
      <div className="flex items-center space-x-2">
        <Avatar className="w-6 h-6">
          <AvatarImage src={item.publicado_por_profile.avatar_url} />
          <AvatarFallback>{item.publicado_por_profile.nome?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="text-xs text-gray-500">{item.publicado_por_profile.nome}</div>
      </div>
    );
  };

  const calcularValorComTaxa = () => {
    const valorBase = item.valor_girinhas || 0;
    const taxa = taxaTransacao || 5;
    const valorComTaxa = valorBase + (valorBase * taxa / 100);
    return valorComTaxa.toFixed(2);
  };

  return (
    <Card onClick={handleCardClick} className="hover:shadow-md transition-shadow duration-200 ease-in-out cursor-pointer">
      <div className="relative">
        <img
          src={item.fotos?.[0] || '/placeholder-image.png'}
          alt={item.titulo}
          className="aspect-square object-cover rounded-md w-full"
        />
        {item.status !== 'disponivel' && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs py-1 px-2 rounded-md z-10">
            {item.status === 'reservado' ? 'Reservado' : 'Indisponível'}
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold truncate">{item.titulo}</h3>
          <Badge className="bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100 rounded-full px-2 py-1 text-xs font-medium">
            G {calcularValorComTaxa()}
          </Badge>
        </div>

        {renderLocation()}
        {renderAuthor()}
      </CardContent>

      <CardFooter className="flex items-center justify-between p-4">
        <div className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}
        </div>
        {renderActions()}
      </CardFooter>
    </Card>
  );
};
