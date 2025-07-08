import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, School, Truck, Home, Clock, Users, Sparkles, CheckCircle, MessageCircle, Car, ChevronDown, ChevronUp } from 'lucide-react';
import LazyImage from '@/components/ui/lazy-image';
import { cn } from '@/lib/utils';
import ActionFeedback from '@/components/loading/ActionFeedback';
import { supabase } from '@/integrations/supabase/client';

interface LogisticaInfo {
  entrega_disponivel: boolean;
  busca_disponivel: boolean;
  distancia_km: number | null;
}

interface ItemCardProps {
  item: {
    id: string;
    titulo: string;
    valor_girinhas: number;
    categoria: string;
    subcategoria?: string;
    estado_conservacao: string;
    status: string;
    fotos?: string[];
    genero?: string;
    tamanho_valor?: string;
    tamanho_categoria?: string;
    endereco_bairro?: string;
    endereco_cidade?: string;
    endereco_estado?: string;
    aceita_entrega?: boolean;
    raio_entrega_km?: number;
    logistica?: LogisticaInfo;
    escola_comum?: boolean;
    publicado_por: string;
    escolas_inep?: {
      escola: string;
    };
    publicado_por_profile?: {
      nome: string;
      avatar_url?: string;
      reputacao?: number;
      whatsapp?: string;
    };
  };
  feedData: {
    favoritos: string[];
    reservas_usuario: Array<{
      item_id: string;
      status: string;
      id?: string;
      usuario_reservou?: string;
    }>;
    filas_espera: Record<string, {
      total_fila: number;
      posicao_usuario?: number;
      usuario_id?: string;
    }>;
  };
  currentUserId: string;
  taxaTransacao?: number;
  
  // Actions
  onToggleFavorito?: () => void;
  onEntrarFila?: () => void;
  onReservar?: () => void;
  onItemClick?: (itemId: string) => void;
  actionState?: 'loading' | 'success' | 'error' | 'idle';
  
  // Display options
  showActions?: boolean;
  showLocation?: boolean;
  showAuthor?: boolean;
  compact?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({ 
  item, 
  feedData,
  currentUserId,
  taxaTransacao = 0,
  onToggleFavorito,
  onEntrarFila,
  onReservar,
  onItemClick,
  actionState = 'idle',
  showActions = true,
  showLocation = true,
  showAuthor = true,
  compact = false
}) => {
  const [showPriceDetails, setShowPriceDetails] = useState(false);
  
  // ✅ CALCULAR STATUS DOS DADOS CONSOLIDADOS (sem hooks externos)
  const isFavorito = feedData.favoritos.includes(item.id);
  
  const hasActiveReservation = feedData.reservas_usuario.some(r => 
    r.item_id === item.id && 
    ['pendente', 'confirmada'].includes(r.status) && 
    r.usuario_reservou === currentUserId
  );

  const filaInfo = feedData.filas_espera[item.id];
  const isUserInQueue = filaInfo?.posicao_usuario && filaInfo.posicao_usuario > 0;

  // ✅ VERIFICAR MESMA ESCOLA (agora vem do backend)
  const hasCommonSchool = Boolean(item.escola_comum);

  // Status do item
  const itemIsReservado = item.status === 'reservado';
  const itemIsDisponivel = item.status === 'disponivel';

  // ✅ VERIFICAR SE PODE MOSTRAR WHATSAPP
  const canShowWhatsApp = item.publicado_por_profile?.whatsapp && 
    hasActiveReservation && 
    item.publicado_por !== currentUserId;

  // ✅ CALCULAR VALORES COM TAXA
  const calcularValores = () => {
    const valorItem = item.valor_girinhas;
    const taxa = taxaTransacao > 0 ? valorItem * (taxaTransacao / 100) : 0;
    const total = valorItem + taxa;
    
    return {
      valorItem,
      taxa: Math.round(taxa * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  };

  const valores = calcularValores();

  // ✅ DETERMINAR SE DEVE MOSTRAR BOTÃO DE AÇÃO
  const shouldShowActionButton = showActions && 
    (onEntrarFila || onReservar) && 
    !isUserInQueue && 
    !hasActiveReservation &&
    item.publicado_por !== currentUserId;

  // ✅ FUNÇÃO PARA GERAR BADGES DE LOGÍSTICA
  const getLogisticaBadges = () => {
    const badges = [];

    // 🏫 Escola em comum (máxima prioridade)
    if (hasCommonSchool) {
      badges.push({
        icon: <School className="w-3 h-3" />,
        label: 'Mesma escola',
        className: 'bg-purple-100 text-purple-800 border-purple-200'
      });
    }

    // 🚚 Entrega disponível
    if (item.logistica?.entrega_disponivel) {
      badges.push({
        icon: <Truck className="w-3 h-3" />,
        label: 'Entrega grátis',
        className: 'bg-green-100 text-green-800 border-green-200'
      });
    }
    // 🚗 Busca disponível (só se não tem entrega)
    else if (item.logistica?.busca_disponivel) {
      badges.push({
        icon: <Car className="w-3 h-3" />,
        label: 'Você pode buscar',
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      });
    }

    // 📍 Distância (sempre mostrar se disponível)
    if (item.logistica?.distancia_km !== null && item.logistica?.distancia_km !== undefined) {
      badges.push({
        icon: <MapPin className="w-3 h-3" />,
        label: `${item.logistica.distancia_km}km`,
        className: 'bg-gray-50 text-gray-600 border-gray-200'
      });
    }

    return badges;
  };

  const logisticaBadges = getLogisticaBadges();

  // Event handlers
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

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (itemIsReservado && onEntrarFila) {
      onEntrarFila();
    } else if (itemIsDisponivel && onReservar) {
      onReservar();
    }
  };

  // ✅ HANDLER WHATSAPP COM REGISTRO NO BANCO
  const handleWhatsAppClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.publicado_por_profile?.whatsapp) return;
    
    const whatsappNumber = item.publicado_por_profile.whatsapp;
    const vendedorNome = item.publicado_por_profile.nome;
    const mensagem = `Olá ${vendedorNome}! Sobre o item "${item.titulo}" que reservei. Quando podemos combinar a entrega? 😊`;
    const whatsappUrl = `https://wa.me/55${whatsappNumber}?text=${encodeURIComponent(mensagem)}`;
    
    try {
      const reservaAtiva = feedData.reservas_usuario.find(r => 
        r.item_id === item.id && 
        ['pendente', 'confirmada'].includes(r.status) && 
        r.usuario_reservou === currentUserId
      );
      
      if (reservaAtiva) {
        await supabase.rpc('registrar_conversa_whatsapp', {
          p_reserva_id: reservaAtiva.id,
          p_usuario_recebeu: item.publicado_por
        });
        console.log('✅ Comunicação WhatsApp registrada no banco');
      }
    } catch (error) {
      console.error('❌ Erro ao registrar comunicação WhatsApp:', error);
    }
    
    window.open(whatsappUrl, '_blank');
  };

  // Helper functions
  const getGeneroIcon = (genero?: string) => {
    switch (genero) {
      case 'menino': return '👦';
      case 'menina': return '👧';
      case 'unissex': return '👦👧';
      default: return null;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'novo': return 'bg-green-100 text-green-800';
      case 'seminovo': return 'bg-blue-100 text-blue-800';
      case 'usado': return 'bg-yellow-100 text-yellow-800';
      case 'muito_usado': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLocationText = () => {
    const parts = [];
    if (item.endereco_bairro) parts.push(item.endereco_bairro);
    if (item.endereco_cidade) parts.push(item.endereco_cidade);
    return parts.length > 0 ? parts.join(', ') : 'Local não informado';
  };

  const hasLocationData = item.endereco_bairro || item.endereco_cidade;

  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-200 cursor-pointer relative overflow-hidden w-full",
      itemIsReservado && "opacity-75"
    )}>
      {/* Botão de favorito - ÚNICA COISA SOBRE A IMAGEM */}
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
        {/* Imagem do item - LIMPA */}
        <div className="relative aspect-[4/3]">
          <LazyImage
            src={item.fotos?.[0] || '/placeholder-item.jpg'}
            alt={item.titulo}
            className={cn(
              "w-full h-full object-cover",
              itemIsReservado && "filter grayscale-[20%]"
            )}
          />
        </div>

        {/* Conteúdo do card */}
        <div className="p-4">
          {/* Status e badges MOVIDOS PARA BAIXO DA IMAGEM */}
          <div className="flex flex-wrap gap-2 mb-3">
            {/* Badge de status reservado */}
            {itemIsReservado && (
              <Badge className="bg-red-500 text-white">
                Reservado
              </Badge>
            )}
            
            {/* Badge de estado de conservação */}
            <Badge className={getEstadoColor(item.estado_conservacao)}>
              {item.estado_conservacao.charAt(0).toUpperCase() + item.estado_conservacao.slice(1)}
            </Badge>

            {/* Badge de gênero */}
            {item.genero && getGeneroIcon(item.genero) && (
              <Badge variant="outline" className="bg-white">
                {getGeneroIcon(item.genero)}
              </Badge>
            )}
          </div>

          {/* ✅ BADGES DE LOGÍSTICA MOVIDOS PARA BAIXO */}
          {logisticaBadges.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {logisticaBadges.map((badge, index) => (
                <Badge 
                  key={index}
                  className={`text-xs px-2 py-1 flex items-center gap-1 ${badge.className}`}
                >
                  {badge.icon}
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}

          {/* Título */}
          <h3 className="font-medium leading-tight line-clamp-2 mb-2 text-base min-h-[3rem]">
            {item.titulo}
          </h3>

          {/* Categoria, subcategoria e tamanho */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="capitalize">{item.categoria}</span>
              {item.subcategoria && (
                <>
                  <span className="mx-1">•</span>
                  <span>{item.subcategoria}</span>
                </>
              )}
            </div>
            
            {item.tamanho_valor && (
              <div className="inline-flex items-center bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
                <span className="text-sm font-medium text-blue-700">
                  Tamanho {item.tamanho_valor}
                </span>
              </div>
            )}
          </div>

          {/* Preço com breakdown EXPANSÍVEL */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-xl font-bold text-primary">
                {valores.total} Girinhas
              </span>
            </div>
            
            {/* Breakdown detalhado quando há taxa - EXPANSÍVEL */}
            {taxaTransacao > 0 && valores.taxa > 0 && (
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPriceDetails(!showPriceDetails);
                  }}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="text-sm font-medium text-gray-700">Ver detalhes do preço</span>
                  {showPriceDetails ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                
                {showPriceDetails && (
                  <div className="mt-3 pt-3 border-t border-gray-300 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Item:</span>
                      <span className="font-medium">{valores.valorItem} Girinhas</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxa ({taxaTransacao}%):</span>
                      <span className="font-medium">+{valores.taxa} Girinhas</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-primary">
                      <span>Total:</span>
                      <span>{valores.total} Girinhas</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Perfil do autor */}
          {showAuthor && item.publicado_por_profile && (
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-sm text-white font-semibold">
                  {item.publicado_por_profile.nome.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-gray-600 truncate flex-1">
                {item.publicado_por_profile.nome}
              </span>
              {item.publicado_por_profile.reputacao && (
                <div className="flex items-center gap-1">
                  <span className="text-sm text-yellow-600">
                    {item.publicado_por_profile.reputacao.toFixed(1)}
                  </span>
                  <span className="text-yellow-500">⭐</span>
                </div>
              )}
            </div>
          )}

          {/* WhatsApp */}
          {canShowWhatsApp && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="text-sm text-green-800 mb-3 text-center font-medium">
                Combine a entrega
              </div>
              <Button 
                size="sm" 
                className="w-full bg-green-500 hover:bg-green-600 text-white"
                onClick={handleWhatsAppClick}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Conversar no WhatsApp
              </Button>
            </div>
          )}

          {/* Botão de ação principal */}
          {shouldShowActionButton && (
            <Button 
              size="lg"
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
                  <Clock className="w-5 h-5 animate-spin" />
                  {itemIsReservado ? 'Entrando...' : 'Reservando...'}
                </div>
              ) : itemIsReservado ? (
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Entrar na Fila
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Reservar Item
                </div>
              )}
            </Button>
          )}

          {/* Status de reserva/fila */}
          {(isUserInQueue || hasActiveReservation) && !canShowWhatsApp && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              {hasActiveReservation ? (
                <div>
                  <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Item Reservado</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Você tem uma reserva ativa. Aguarde o vendedor entrar em contato ou combine a entrega.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Na fila - Posição {filaInfo?.posicao_usuario}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {filaInfo?.total_fila && filaInfo.total_fila > 1 
                      ? `Há ${filaInfo.total_fila - (filaInfo.posicao_usuario || 0)} pessoas na sua frente.`
                      : 'Você será notificado se o item ficar disponível.'
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Feedback de ação */}
          {actionState !== 'idle' && actionState !== 'loading' && (
            <ActionFeedback
              state={actionState}
              successMessage={itemIsReservado ? "Adicionado à fila!" : "Item reservado!"}
              errorMessage={itemIsReservado ? "Erro ao entrar na fila" : "Erro ao reservar"}
              className="mt-3"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
