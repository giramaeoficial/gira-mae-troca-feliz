import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { Heart, MapPin, School, Truck, Home, Clock, Users, Sparkles, CheckCircle, MessageCircle, Car, Info, User, MoreVertical, Flag, ZoomIn, ZoomOut, X, ChevronLeft, ChevronRight } from 'lucide-react';
import LazyImage from '@/components/ui/lazy-image';
import { cn } from '@/lib/utils';
import { buildItemImageUrl } from '@/lib/cdn';
import ActionFeedback from '@/components/loading/ActionFeedback';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LogisticaInfo {
  entrega_disponivel: boolean;
  busca_disponivel: boolean;
  distancia_km: number | null;
}

interface ItemCardProps {
  item: {
    id: string;
    titulo: string;
    descricao: string;
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
    created_at: string;
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
  isModal?: boolean;
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportMotivo, setReportMotivo] = useState('');
  const [reportDescricao, setReportDescricao] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageZoom, setImageZoom] = useState(1);

  const isFavorito = feedData.favoritos.includes(item.id);

  const hasActiveReservation = feedData.reservas_usuario.some(r =>
    r.item_id === item.id &&
    ['pendente', 'confirmada'].includes(r.status) &&
    r.usuario_reservou === currentUserId
  );

  const filaInfo = feedData.filas_espera[item.id];
  const isUserInQueue = filaInfo?.posicao_usuario && filaInfo.posicao_usuario > 0;

  const hasCommonSchool = Boolean(item.escola_comum);

  const itemIsReservado = item.status === 'reservado';
  const itemIsDisponivel = item.status === 'disponivel';

  const canShowWhatsApp = item.publicado_por_profile?.whatsapp &&
    hasActiveReservation &&
    item.publicado_por !== currentUserId;

  const hasMultiplePhotos = item.fotos && item.fotos.length > 1;

  const handleReportSubmit = async () => {
    try {
      const { error } = await supabase
        .from('denuncias')
        .insert({
          item_id: item.id,
          denunciante_id: currentUserId,
          motivo: reportMotivo,
          descricao: reportDescricao
        });

      if (error) throw error;

      setShowReportDialog(false);
      setReportMotivo('');
      setReportDescricao('');

      toast({
        title: "Obrigada pela denúncia!",
        description: "Vamos analisar este item e tomar as providências necessárias.",
      });
    } catch (error) {
      console.error('Erro ao denunciar item:', error);
    }
  };

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

  const shouldShowActionButton = showActions &&
    (onEntrarFila || onReservar) &&
    !isUserInQueue &&
    !hasActiveReservation &&
    item.publicado_por !== currentUserId;

  const handleClick = () => {
    // Removido - não navega mais para página separada
  };

  const handleImageClick = (e: React.MouseEvent, index: number = 0) => {
    e.stopPropagation();
    setSelectedImageIndex(index);
    setShowImageModal(true);
    setImageZoom(1);
  };

  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.5, 1));
  };

  const handleNextImage = () => {
    if (item.fotos && selectedImageIndex < item.fotos.length - 1) {
      setSelectedImageIndex(prev => prev + 1);
      setImageZoom(1);
    }
  };

  const handlePrevImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(prev => prev - 1);
      setImageZoom(1);
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

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.publicado_por_profile) {
      navigate(`/perfil/${item.publicado_por}`);
    }
  };

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Card
      data-tour="item-card"
      className={cn(
        "group hover:shadow-lg transition-all duration-200 cursor-pointer relative overflow-hidden w-full flex flex-col h-full",
        itemIsReservado && "opacity-75"
      )}>
      <div className="absolute top-2 right-2 flex gap-2 z-10">
        {item.publicado_por !== currentUserId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-white/95 backdrop-blur-sm hover:bg-white/100"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                <Flag className="mr-2 h-4 w-4" />
                Reportar item
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {showActions && onToggleFavorito && (
          <Button
            data-tour="btn-favorito"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-white/95 backdrop-blur-sm hover:bg-white/100"
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
      </div>

      <CardContent className="p-0 flex flex-col h-full" onClick={handleClick}>
        {/* MUDANÇA AQUI: aspect-[4/3] para forçar horizontal e object-cover para preencher */}
        <div className="relative w-full aspect-[4/3] bg-gray-50 overflow-hidden">
          <div className="relative w-full h-full cursor-pointer" onClick={(e) => handleImageClick(e, 0)}>
            {hasMultiplePhotos ? (
              <Carousel className="w-full h-full">
                <CarouselContent className="h-full ml-0">
                  {item.fotos!.map((foto, index) => (
                    <CarouselItem key={index} className="h-full pl-0">
                      <div className="w-full h-full" onClick={(e) => handleImageClick(e, index)}>
                        <LazyImage
                          src={buildItemImageUrl(foto)}
                          alt={`${item.titulo} - Foto ${index + 1}`}
                          className={cn(
                            "w-full h-full object-cover",
                            itemIsReservado && "filter grayscale-[20%]"
                          )}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white border-0" />
                  <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white border-0" />
                </div>

                <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm z-10">
                  {item.fotos!.length} fotos
                </div>
              </Carousel>
            ) : (
              <LazyImage
                src={item.fotos?.[0] ? buildItemImageUrl(item.fotos[0]) : '/placeholder-item.jpg'}
                alt={item.titulo}
                className={cn(
                  "w-full h-full object-cover",
                  itemIsReservado && "filter grayscale-[20%]"
                )}
              />
            )}

            {item.logistica?.distancia_km !== null && item.logistica?.distancia_km !== undefined && (
              <div className="absolute bottom-2 left-2 bg-white/90 rounded-full px-2 py-1 text-xs backdrop-blur-sm z-10">
                <MapPin className="w-3 h-3 inline mr-1" />
                {item.logistica.distancia_km}km
              </div>
            )}

            {item.genero && getGeneroIcon(item.genero) && (
              <div className="absolute bottom-2 right-2 bg-white/90 rounded-full px-2 py-1 text-xs backdrop-blur-sm z-10">
                {getGeneroIcon(item.genero)}
              </div>
            )}
          </div>
        </div>

        {/* MUDANÇA AQUI: flex-1 para o conteúdo ocupar o espaço restante */}
        <div className="p-3 flex flex-col flex-1">
          <div className="flex flex-wrap gap-2 mb-2">
            {itemIsReservado && (
              <Badge className="bg-red-500 text-white">
                Reservado
              </Badge>
            )}

            <Badge className={getEstadoColor(item.estado_conservacao)}>
              {item.estado_conservacao.charAt(0).toUpperCase() + item.estado_conservacao.slice(1)}
            </Badge>

            {item.tamanho_valor && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Tam. {item.tamanho_valor}
              </Badge>
            )}
          </div>

          {(hasCommonSchool || item.logistica?.entrega_disponivel || item.logistica?.busca_disponivel) && (
            <div className="flex flex-wrap gap-1 mb-2">
              {hasCommonSchool && (
                <Badge className="text-xs px-2 py-1 flex items-center gap-1 bg-purple-100 text-purple-800 border-purple-200">
                  <School className="w-3 h-3" />
                  Mesma escola
                </Badge>
              )}

              {item.logistica?.entrega_disponivel && (
                <Badge className="text-xs px-2 py-1 flex items-center gap-1 bg-green-100 text-green-800 border-green-200">
                  <Truck className="w-3 h-3" />
                  Entrega grátis
                </Badge>
              )}

              {!item.logistica?.entrega_disponivel && item.logistica?.busca_disponivel && (
                <Badge className="text-xs px-2 py-1 flex items-center gap-1 bg-blue-100 text-blue-800 border-blue-200">
                  <Car className="w-3 h-3" />
                  Você pode buscar
                </Badge>
              )}
            </div>
          )}

          <h3 className="font-medium leading-tight line-clamp-2 mb-1 text-base min-h-[2.5rem]">
            {item.titulo}
          </h3>

          {hasLocationData && (
            <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{getLocationText()}</span>
            </div>
          )}

          {/* MUDANÇA AQUI: mt-auto para empurrar o restante para o fundo do card */}
          <div className="mt-auto">
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <img src="/girinha_sem_fundo.png" alt="girinha" className='w-auto h-6' />
                  <span className="text-lg font-bold text-primary">
                    {valores.total} Girinhas
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetails(!showDetails);
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                  title="Ver detalhes do item"
                >
                  <Info className="w-3 h-3" />
                  Ver detalhes
                </button>
              </div>

              {showDetails && (
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 text-sm space-y-2">
                  {item.descricao && (
                    <div>
                      <span className="font-medium text-gray-700">Descrição:</span>
                      <p className="text-gray-600 mt-1 text-xs line-clamp-3">{item.descricao}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="font-medium">Categoria:</span>
                    <span className="capitalize">{item.categoria}</span>
                    {item.subcategoria && (
                      <>
                        <span>•</span>
                        <span>{item.subcategoria}</span>
                      </>
                    )}
                  </div>

                  {item.tamanho_valor && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="font-medium">Tamanho:</span>
                      <span>{item.tamanho_valor}</span>
                      {item.tamanho_categoria && (
                        <span className="text-xs">({item.tamanho_categoria})</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="font-medium">Publicado em:</span>
                    <span>{formatDate(item.created_at)}</span>
                  </div>

                  {taxaTransacao > 0 && valores.taxa > 0 && (
                    <>
                      <div className="border-t pt-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Item:</span>
                          <span className="font-medium">{valores.valorItem} Girinhas</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Taxa ({taxaTransacao}%):</span>
                          <span className="font-medium">+{valores.taxa} Girinhas</span>
                        </div>
                        <div className="border-t pt-1 flex justify-between font-bold text-primary">
                          <span>Total:</span>
                          <span>{valores.total} Girinhas</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {showAuthor && item.publicado_por_profile && (
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-2 pt-2 border-t border-gray-100 mb-3 w-full text-left hover:bg-gray-50 -mx-1 px-1 py-1 rounded transition-colors group/profile"
              >
                <div className="w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                  {item.publicado_por_profile.avatar_url ? (
                    <img
                      src={item.publicado_por_profile.avatar_url}
                      alt={item.publicado_por_profile.nome}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-3 h-3 text-white" />
                  )}
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <div className="text-xs text-gray-600 truncate">
                    {item.publicado_por_profile.nome}
                  </div>
                  <div className="text-xs text-blue-600 group-hover/profile:text-blue-700 font-medium">
                    Ver perfil →
                  </div>
                </div>
                {item.publicado_por_profile.reputacao && (
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-yellow-600">
                      {item.publicado_por_profile.reputacao.toFixed(1)}
                    </span>
                    <span className="text-yellow-500 text-xs">⭐</span>
                  </div>
                )}
              </button>
            )}

            {canShowWhatsApp && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-2 py-1.5 mb-2">
                <div className="text-xs text-green-800 mb-1 text-center">
                  Combine a entrega
                </div>
                <div className="flex items-center justify-center">
                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 text-xs h-6"
                    onClick={handleWhatsAppClick}
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            )}

            {shouldShowActionButton && (
              <Button
                size="default"
                className={cn(
                  "w-full h-10",
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
                    {/* <Sparkles className="w-4 h-4" /> */}
                    Reservar Item
                  </div>
                )}
              </Button>
            )}

            {(isUserInQueue || hasActiveReservation) && !canShowWhatsApp && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                {hasActiveReservation ? (
                  <div>
                    <div className="flex items-center justify-center gap-2 text-green-600 mb-1">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Item Reservado</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Você tem uma reserva ativa. Aguarde o vendedor entrar em contato ou combine a entrega.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-center gap-2 text-blue-600 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">Na fila - Posição {filaInfo?.posicao_usuario}</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {filaInfo?.total_fila && filaInfo.total_fila > 1
                        ? `Há ${filaInfo.total_fila - (filaInfo.posicao_usuario || 0)} pessoas na sua frente.`
                        : 'Você será notificado se o item ficar disponível.'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

            {actionState !== 'idle' && actionState !== 'loading' && (
              <ActionFeedback
                state={actionState}
                successMessage={itemIsReservado ? "Adicionado à fila!" : "Item reservado!"}
                errorMessage={itemIsReservado ? "Erro ao entrar na fila" : "Erro ao reservar"}
                className="mt-2"
              />
            )}
          </div>
        </div>
      </CardContent>

      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reportar Item</DialogTitle>
            <DialogDescription>
              Descreva o motivo da sua denúncia. Nossa equipe irá analisar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Motivo</label>
              <Select value={reportMotivo} onValueChange={setReportMotivo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conteudo_inapropriado">Conteúdo inapropriado</SelectItem>
                  <SelectItem value="preco_abusivo">Preço abusivo</SelectItem>
                  <SelectItem value="informacoes_falsas">Informações falsas</SelectItem>
                  <SelectItem value="item_danificado">Item danificado</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Descrição (opcional)</label>
              <Textarea
                placeholder="Descreva mais detalhes sobre o problema..."
                value={reportDescricao}
                onChange={(e) => setReportDescricao(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleReportSubmit}
              disabled={!reportMotivo}
              className="bg-red-500 hover:bg-red-600"
            >
              Reportar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Imagem com Zoom */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-[100vw] w-full h-screen max-h-screen p-0 bg-black/95 border-0 rounded-none">
          <DialogTitle className="sr-only">Visualização de imagem: {item.titulo}</DialogTitle>
          {/* Header com controles */}
          <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-3 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-2 text-white">
              <span className="text-xs font-medium">
                {selectedImageIndex + 1} / {item.fotos?.length || 1}
              </span>
            </div>

            {/* Controles de Zoom */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={imageZoom <= 1}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-white text-xs font-medium min-w-[45px] text-center">
                {Math.round(imageZoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={imageZoom >= 3}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowImageModal(false)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Container da imagem com scroll */}
          <div className="relative w-full h-full overflow-auto flex items-center justify-center pt-14 pb-32 px-4">
            <div
              className="transition-transform duration-200 origin-center"
              style={{
                transform: `scale(${imageZoom})`,
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            >
              <img
                src={item.fotos?.[selectedImageIndex] ? buildItemImageUrl(item.fotos[selectedImageIndex]) : '/placeholder-item.jpg'}
                alt={`${item.titulo} - Foto ${selectedImageIndex + 1}`}
                className="max-w-full max-h-[calc(100vh-200px)] w-auto h-auto object-contain"
                style={{
                  cursor: imageZoom > 1 ? 'grab' : 'default'
                }}
              />
            </div>
          </div>

          {/* Navegação entre fotos */}
          {hasMultiplePhotos && (
            <>
              {selectedImageIndex > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12 p-0 rounded-full"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
              )}

              {item.fotos && selectedImageIndex < item.fotos.length - 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12 p-0 rounded-full"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              )}
            </>
          )}

          {/* Footer com informações do item */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="text-white">
              <h3 className="font-semibold text-lg mb-1">{item.titulo}</h3>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  {valores.total} Girinhas
                </span>
                <span>•</span>
                <span className="capitalize">{item.estado_conservacao}</span>
                {item.tamanho_valor && (
                  <>
                    <span>•</span>
                    <span>Tamanho {item.tamanho_valor}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Dica de uso */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/60 text-xs text-center">
            Use os botões + / - para zoom • {hasMultiplePhotos ? 'Setas para navegar' : ''}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
