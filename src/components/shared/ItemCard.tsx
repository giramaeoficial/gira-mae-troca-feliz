import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, School, Truck, Home, Clock, Users, Sparkles, CheckCircle, MessageCircle } from 'lucide-react';
import LazyImage from '@/components/ui/lazy-image';
import { useCommonSchool } from '@/hooks/useCommonSchool';
import { cn } from '@/lib/utils';
import ActionFeedback from '@/components/loading/ActionFeedback';

interface ItemCardProps {
  item: {
    id: string;
    titulo: string;
    valor_girinhas: number;
    categoria: string;
    subcategoria?: string;
    estado_conservacao: string;
    status: string; // ✅ ADICIONADO: Campo status
    fotos?: string[];
    // ✅ ADICIONADO: Campos novos para filtros
    genero?: string;
    tamanho_valor?: string;
    tamanho_categoria?: string;
    // Localização
    endereco_bairro?: string;
    endereco_cidade?: string;
    endereco_estado?: string;
    aceita_entrega?: boolean;
    raio_entrega_km?: number;
    publicado_por: string;
    escolas_inep?: {
      escola: string;
    };
    publicado_por_profile?: {
      nome: string;
      avatar_url?: string;
      reputacao?: number;
      whatsapp?: string; // 🆕 ADICIONADO: Campo WhatsApp do vendedor
    };
  };
  // ✅ ADICIONADO: Props para integração com Feed
  isFavorito?: boolean;
  onToggleFavorito?: () => void;
  onEntrarFila?: () => void;
  onReservar?: () => void; // ✅ ADICIONADO: Handler para reservar
  onItemClick?: (itemId: string) => void;
  actionState?: 'loading' | 'success' | 'error' | 'idle';
  filaInfo?: {
    posicao?: number;
    total?: number;
    posicao_usuario?: number; // ✅ ADICIONADO: Para verificar se usuário está na fila
  };
  isReservado?: boolean; // ✅ MODIFICADO: Agora calculado do status
  // ✅ ADICIONADO: Props para verificação de estado
  reservas?: Array<{
    item_id: string;
    status: string;
    usuario_reservou?: string;
  }>;
  currentUserId?: string;
  // Configurações de exibição
  showActions?: boolean;
  showLocation?: boolean;
  showAuthor?: boolean;
  compact?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({ 
  item, 
  isFavorito = false,
  onToggleFavorito,
  onEntrarFila,
  onReservar, // ✅ ADICIONADO
  onItemClick,
  actionState = 'idle',
  filaInfo,
  isReservado, // ✅ MODIFICADO: Agora pode ser override
  reservas = [], // ✅ ADICIONADO
  currentUserId, // ✅ ADICIONADO
  showActions = true,
  showLocation = true,
  showAuthor = true,
  compact = false
}) => {
  const { hasCommonSchool } = useCommonSchool(item.publicado_por);

  // ✅ ADICIONADO: Calcular status baseado no item ou prop
  const itemIsReservado = isReservado ?? item.status === 'reservado';
  const itemIsDisponivel = item.status === 'disponivel';

  // ✅ ADICIONADO: Verificar se o usuário já está na fila ou tem reserva ativa
  const isUserInQueue = filaInfo && filaInfo.posicao_usuario && filaInfo.posicao_usuario > 0;
  const hasActiveReservation = reservas.some(r => 
    r.item_id === item.id && 
    ['pendente', 'confirmada'].includes(r.status) && 
    r.usuario_reservou === currentUserId
  );

  // 🆕 ADICIONADO: Verificar se pode mostrar WhatsApp
  const canShowWhatsApp = item.publicado_por_profile?.whatsapp && 
    hasActiveReservation && 
    item.publicado_por !== currentUserId;

  // ✅ ADICIONADO: Determinar se deve mostrar o botão de ação
  const shouldShowActionButton = showActions && 
    (onEntrarFila || onReservar) && 
    !isUserInQueue && 
    !hasActiveReservation &&
    item.publicado_por !== currentUserId; // Não pode reservar próprio item

  const handleClick = () => {
    if (onItemClick) {
      onItemClick(item.id);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorito) {
      onToggleFavorito();
    }
  };

  // ✅ MODIFICADO: Handler inteligente baseado no status
  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (itemIsReservado && onEntrarFila) {
      onEntrarFila();
    } else if (itemIsDisponivel && onReservar) {
      onReservar();
    }
  };

  // 🆕 ADICIONADO: Handler para WhatsApp
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.publicado_por_profile?.whatsapp) return;
    
    const whatsappNumber = item.publicado_por_profile.whatsapp;
    const vendedorNome = item.publicado_por_profile.nome;
    const mensagem = `Olá ${vendedorNome}! Sobre o item "${item.titulo}" que reservei. Quando podemos combinar a entrega? 😊`;
    const whatsappUrl = `https://wa.me/55${whatsappNumber}?text=${encodeURIComponent(mensagem)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  // ✅ MELHORADO: Função para obter ícone de gênero
  const getGeneroIcon = (genero?: string) => {
    switch (genero) {
      case 'menino': return '👦';
      case 'menina': return '👧';
      case 'unissex': return '👦👧';
      default: return null;
    }
  };

  // ✅ MELHORADO: Função para obter cor do estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'novo': return 'bg-green-100 text-green-800';
      case 'seminovo': return 'bg-blue-100 text-blue-800';
      case 'usado': return 'bg-yellow-100 text-yellow-800';
      case 'muito_usado': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // ✅ MELHORADO: Localização mais inteligente
  const getLocationText = () => {
    if (item.endereco_bairro) return item.endereco_bairro;
    if (item.endereco_cidade) return item.endereco_cidade;
    return 'Local não informado';
  };

  // ✅ ADICIONADO: Verificar se tem dados de localização
  const hasLocationData = item.endereco_bairro || item.endereco_cidade;

  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-200 cursor-pointer relative overflow-hidden",
      compact ? "max-w-[200px]" : "max-w-sm",
      itemIsReservado && "opacity-75" // ✅ MODIFICADO: Usar variável calculada
    )}>
      {/* 🔧 CORRIGIDO: Badge de localização no canto superior esquerdo */}
      {showLocation && hasLocationData && !itemIsReservado && (
        <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium shadow-sm z-10">
          <MapPin className="w-3 h-3 inline mr-1 text-gray-500" />
          {getLocationText()}
        </div>
      )}

      {/* 🔧 CORRIGIDO: Badge de status reservado no topo esquerdo (prioritário) */}
      {itemIsReservado && (
        <div className="absolute top-2 left-2 bg-orange-500 text-white rounded-full px-3 py-1 text-xs font-medium shadow-sm z-10 flex items-center gap-1">
          <Users className="w-3 h-3" />
          Reservado
        </div>
      )}

      {/* ✅ MELHORADO: Badge de mesma escola - ajustado posição */}
      {hasCommonSchool && !compact && (
        <div className="absolute top-2 right-12 bg-green-500 text-white rounded-full px-2 py-1 text-xs font-medium shadow-sm z-10">
          <School className="w-3 h-3 inline mr-1" />
          Mesma escola!
        </div>
      )}

      {/* ✅ MELHORADO: Botão de favorito */}
      {showActions && onToggleFavorito && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/95 backdrop-blur-sm hover:bg-white/100 z-10"
          onClick={handleFavoriteClick}
        >
          <Heart 
            className={cn(
              "w-4 h-4 transition-colors",
              isFavorito 
                ? 'fill-red-500 text-red-500' 
                : 'text-gray-500 hover:text-red-400'
            )} 
          />
        </Button>
      )}

      <CardContent className="p-0" onClick={handleClick}>
        {/* ✅ CORRIGIDO: Imagem do item */}
        <div className={cn(
          "relative",
          compact ? "aspect-square" : "aspect-[4/3]"
        )}>
          <LazyImage
            src={item.fotos?.[0] || '/placeholder-item.jpg'}
            alt={item.titulo}
            className={cn(
              "w-full h-full object-cover",
              itemIsReservado && "filter grayscale-[20%]" // ✅ ADICIONADO: Filtro visual sutil
            )}
          />
          
          {/* ✅ ADICIONADO: Badge de estado de conservação */}
          <Badge 
            className={cn(
              "absolute bottom-2 left-2 text-xs",
              getEstadoColor(item.estado_conservacao)
            )}
          >
            {item.estado_conservacao.charAt(0).toUpperCase() + item.estado_conservacao.slice(1)}
          </Badge>

          {/* ✅ ADICIONADO: Badge de gênero */}
          {item.genero && getGeneroIcon(item.genero) && !compact && (
            <div className="absolute bottom-2 right-2 bg-white/90 rounded-full px-2 py-1 text-xs">
              {getGeneroIcon(item.genero)}
            </div>
          )}
        </div>

        {/* ✅ MELHORADO: Conteúdo do card */}
        <div className={cn("p-3", compact && "p-2")}>
          {/* Título */}
          <h3 className={cn(
            "font-medium leading-tight line-clamp-2 mb-2",
            compact ? "text-sm min-h-[2.5rem]" : "text-base min-h-[3rem]"
          )}>
            {item.titulo}
          </h3>

          {/* 🔧 CORRIGIDO: Localização integrada ao conteúdo quando reservado */}
          {showLocation && hasLocationData && itemIsReservado && !compact && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
              <MapPin className="w-3 h-3" />
              <span>📍 {getLocationText()}</span>
            </div>
          )}

          {/* ✅ ADICIONADO: Categoria, subcategoria e tamanho */}
          {!compact && (
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <span className="capitalize">{item.categoria}</span>
              {item.subcategoria && (
                <>
                  <span>•</span>
                  <span>{item.subcategoria}</span>
                </>
              )}
              {item.tamanho_valor && (
                <>
                  <span>•</span>
                  <span>{item.tamanho_valor}</span>
                </>
              )}
            </div>
          )}

          {/* ✅ MELHORADO: Preço */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className={cn(
                "font-bold text-primary",
                compact ? "text-base" : "text-lg"
              )}>
                {item.valor_girinhas}
              </span>
              <span className="text-sm text-gray-500">Girinhas</span>
            </div>
          </div>

          {/* ✅ MELHORADO: Perfil do autor */}
          {showAuthor && item.publicado_por_profile && !compact && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 mb-3">
              <div className="w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-semibold">
                  {item.publicado_por_profile.nome.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-xs text-gray-600 truncate">
                {item.publicado_por_profile.nome}
              </span>
              {item.publicado_por_profile.reputacao && (
                <div className="flex items-center gap-1 ml-auto">
                  <span className="text-xs text-yellow-600">
                    {item.publicado_por_profile.reputacao.toFixed(1)}
                  </span>
                  <span className="text-yellow-500 text-xs">⭐</span>
                </div>
              )}
            </div>
          )}

          {/* 🆕 ULTRA-COMPACTO: Seção WhatsApp minimal para mobile */}
          {canShowWhatsApp && !compact && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3">
              <MessageCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-green-800 block truncate">
                  Combine com {item.publicado_por_profile?.nome?.split(' ')[0]}
                </span>
              </div>
              <Button 
                size="sm" 
                className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 text-xs h-7 flex-shrink-0"
                onClick={handleWhatsAppClick}
              >
                WhatsApp
              </Button>
            </div>
          )}

          {/* ✅ MODIFICADO: Botão de ação inteligente baseado no status */}
          {shouldShowActionButton && (
            <Button 
              size="sm" 
              className={cn(
                "w-full",
                itemIsReservado 
                  ? "bg-orange-500 hover:bg-orange-600" 
                  : "bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90"
              )}
              onClick={handleActionClick}
              disabled={actionState === 'loading' || (!itemIsDisponivel && !itemIsReservado)}
            >
              {actionState === 'loading' ? (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 animate-spin" />
                  {itemIsReservado ? 'Entrando...' : 'Reservando...'}
                </div>
              ) : itemIsReservado ? (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Entrar na Fila
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Reservar
                </div>
              )}
            </Button>
          )}

          {/* 🔧 MELHORADO: Status expandido com informações do tooltip */}
          {(isUserInQueue || hasActiveReservation) && !canShowWhatsApp && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              {hasActiveReservation ? (
                <div>
                  <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Item Reservado</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Você tem uma reserva ativa. Aguarde o vendedor entrar em contato ou combine a entrega.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">Na fila - Posição {filaInfo?.posicao_usuario}</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {filaInfo?.total && filaInfo.total > 1 
                      ? `Há ${filaInfo.total - (filaInfo.posicao_usuario || 0)} pessoas na sua frente.`
                      : 'Você será notificado se o item ficar disponível.'
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ✅ ADICIONADO: Feedback de ação */}
          {actionState !== 'idle' && actionState !== 'loading' && (
            <ActionFeedback
              state={actionState}
              successMessage={itemIsReservado ? "Adicionado à fila!" : "Item reservado!"}
              errorMessage={itemIsReservado ? "Erro ao entrar na fila" : "Erro ao reservar"}
              className="mt-2"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
