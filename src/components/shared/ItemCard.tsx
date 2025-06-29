
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles, Users, MapPin } from 'lucide-react';
import LazyImage from '@/components/ui/lazy-image';
import { ItemFeed } from '@/hooks/useFeedInfinito';

interface ItemCardProps {
  item: ItemFeed;
  onItemClick: (itemId: string) => void;
  showActions?: boolean;
  isFavorito?: boolean;
  onToggleFavorito?: () => void;
  onReservar?: () => void;
  onEntrarFila?: () => void;
  actionState?: 'loading' | 'success' | 'error' | 'idle';
  filaInfo?: {
    posicao_usuario: number;
    total: number;
  };
  reservas?: any[];
  currentUserId?: string;
  valorOriginal?: number; // Valor sem taxa
  valorTaxa?: number; // Valor da taxa
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onItemClick,
  showActions = false,
  isFavorito = false,
  onToggleFavorito,
  onReservar,
  onEntrarFila,
  actionState = 'idle',
  filaInfo,
  reservas = [],
  currentUserId,
  valorOriginal,
  valorTaxa
}) => {
  const getStatusBadge = () => {
    switch (item.status) {
      case 'disponivel':
        return <Badge className="bg-green-500 text-white text-xs">Disponível</Badge>;
      case 'reservado':
        return <Badge className="bg-orange-500 text-white text-xs">Reservado</Badge>;
      case 'vendido':
        return <Badge className="bg-blue-500 text-white text-xs">Vendido</Badge>;
      default:
        return null;
    }
  };

  const getGeneroIcon = () => {
    switch (item.genero?.toLowerCase()) {
      case 'menina':
        return <span className="text-pink-500 text-sm">👧</span>;
      case 'menino':
        return <span className="text-blue-500 text-sm">👦</span>;
      case 'unissex':
        return <span className="text-purple-500 text-sm">👦👧</span>;
      default:
        return null;
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getActionButton = () => {
    if (!showActions || !currentUserId) return null;

    const isMyItem = item.publicado_por === currentUserId;
    if (isMyItem) return null;

    const minhaReserva = reservas.find(r => r.item_id === item.id && r.usuario_reservou === currentUserId);
    const isReservadoPorMim = !!minhaReserva;

    if (isReservadoPorMim) {
      return (
        <Button size="sm" variant="outline" disabled className="text-xs">
          Reservado por você
        </Button>
      );
    }

    if (filaInfo && filaInfo.posicao_usuario > 0) {
      return (
        <Button size="sm" variant="outline" disabled className="text-xs">
          Na fila (#{filaInfo.posicao_usuario})
        </Button>
      );
    }

    if (item.status === 'disponivel') {
      return (
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onReservar?.();
          }}
          disabled={actionState === 'loading'}
          className="bg-primary hover:bg-primary/90 text-white text-xs"
        >
          {actionState === 'loading' ? 'Reservando...' : 'Reservar'}
        </Button>
      );
    }

    if (item.status === 'reservado') {
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onEntrarFila?.();
          }}
          disabled={actionState === 'loading'}
          className="text-xs"
        >
          <Users className="w-3 h-3 mr-1" />
          {actionState === 'loading' ? 'Entrando...' : 'Entrar na Fila'}
        </Button>
      );
    }

    return null;
  };

  // Extrair informações do vendedor
  const vendedorNome = item.publicado_por_profile?.nome || 'Vendedor';
  const vendedorNomeTruncado = truncateText(vendedorNome, 15);

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 overflow-hidden bg-white/90 backdrop-blur-sm border-0 cursor-pointer"
      onClick={() => onItemClick(item.id)}
    >
      <div className="aspect-square bg-gray-100 overflow-hidden relative">
        {item.fotos && item.fotos.length > 0 ? (
          <LazyImage
            src={item.fotos[0]}
            alt={item.titulo}
            bucket="itens"
            size="medium"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            placeholder="📷"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl">📷</span>
          </div>
        )}
        
        {/* Status badge - posicionado no topo esquerdo */}
        <div className="absolute top-2 left-2">
          {getStatusBadge()}
        </div>

        {/* Favorito - posicionado no topo direito */}
        {showActions && onToggleFavorito && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorito();
            }}
            className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-white rounded-full transition-colors"
          >
            <Heart 
              className={`w-4 h-4 ${isFavorito ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
            />
          </button>
        )}
      </div>

      <CardContent className="p-3 space-y-2">
        {/* Título */}
        <h3 className="font-semibold line-clamp-2 text-sm leading-tight">
          {item.titulo}
        </h3>
        
        {/* Categoria e Subcategoria */}
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="font-medium">{item.categoria}</span>
          {item.subcategoria && (
            <>
              <span>•</span>
              <span>{item.subcategoria}</span>
            </>
          )}
        </div>

        {/* Gênero e Tamanho */}
        <div className="flex items-center gap-2 text-xs">
          {getGeneroIcon()}
          {item.tamanho_valor && (
            <span className="bg-gray-100 px-2 py-1 rounded text-gray-700 font-medium">
              {item.tamanho_valor}
            </span>
          )}
        </div>

        {/* Localização */}
        {(item.endereco_cidade || item.endereco_bairro) && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            <span>
              {item.endereco_bairro && `${item.endereco_bairro}, `}
              {item.endereco_cidade}
            </span>
          </div>
        )}

        {/* Vendedor */}
        <div className="text-xs text-gray-600">
          <span className="font-medium">Por:</span> {vendedorNomeTruncado}
        </div>

        {/* Preço */}
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-bold text-primary text-sm">
              {item.valor_girinhas} {item.valor_girinhas === 1 ? 'Girinha' : 'Girinhas'}
            </span>
          </div>
          
          {/* Detalhamento do preço se disponível */}
          {valorOriginal && valorTaxa && (
            <div className="text-xs text-gray-500 space-y-0.5">
              <div>Item: {valorOriginal} Girinhas</div>
              <div>Taxa: {valorTaxa} Girinhas</div>
            </div>
          )}
        </div>
        
        {getActionButton()}
      </CardContent>
    </Card>
  );
};
