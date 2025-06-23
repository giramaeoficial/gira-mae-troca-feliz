
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, School, Truck, Home } from 'lucide-react';
import LazyImage from '@/components/ui/lazy-image';
import { useCommonSchool } from '@/hooks/useCommonSchool';
import { useFavoritos } from '@/hooks/useFavoritos';

interface ItemCardProps {
  item: {
    id: string;
    titulo: string;
    valor_girinhas: number;
    categoria: string;
    estado_conservacao: string;
    fotos?: string[];
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
    };
  };
  onItemClick?: (itemId: string) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onItemClick }) => {
  const { hasCommonSchool } = useCommonSchool(item.publicado_por);
  const { verificarSeFavorito, toggleFavorito } = useFavoritos();

  const handleClick = () => {
    if (onItemClick) {
      onItemClick(item.id);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorito(item.id);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer relative overflow-hidden">
      {/* Badge de localização - SEMPRE VISÍVEL */}
      <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium shadow-sm z-10">
        <MapPin className="w-3 h-3 inline mr-1 text-gray-500" />
        {item.endereco_bairro || item.endereco_cidade || 'Local não informado'}
      </div>

      {/* Badge de mesma escola */}
      {hasCommonSchool && (
        <div className="absolute top-2 right-10 bg-green-500 text-white rounded-full px-2 py-1 text-xs font-medium shadow-sm z-10">
          <School className="w-3 h-3 inline mr-1" />
          Mesma escola!
        </div>
      )}

      {/* Botão de favorito */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/95 backdrop-blur-sm hover:bg-white/100 z-10"
        onClick={handleFavoriteClick}
      >
        <Heart 
          className={`w-4 h-4 ${
            verificarSeFavorito(item.id) 
              ? 'fill-red-500 text-red-500' 
              : 'text-gray-500'
          }`} 
        />
      </Button>

      <CardContent className="p-0" onClick={handleClick}>
        {/* Imagem do item */}
        <div className="aspect-square relative">
          <LazyImage
            src={item.fotos?.[0] || '/placeholder.svg'}
            alt={item.titulo}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Informações do item */}
        <div className="p-3">
          <h3 className="font-medium text-sm line-clamp-2 mb-2 min-h-[2.5rem]">
            {item.titulo}
          </h3>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-bold text-primary">
              {item.valor_girinhas} G
            </span>
            <Badge variant="secondary" className="text-xs">
              {item.estado_conservacao.replace('_', ' ')}
            </Badge>
          </div>

          {/* Informações da vendedora */}
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
            <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
              {item.publicado_por_profile?.nome?.[0] || '?'}
            </div>
            <span className="truncate">{item.publicado_por_profile?.nome || 'Usuário'}</span>
            {item.publicado_por_profile?.reputacao && (
              <span className="text-yellow-600">
                ⭐ {item.publicado_por_profile.reputacao}
              </span>
            )}
          </div>
        </div>

        {/* Rodapé com informações de entrega */}
        <div className="px-3 pb-3 border-t bg-gray-50/50">
          <div className="py-2 flex items-center justify-between">
            {item.aceita_entrega ? (
              <span className="text-xs text-green-600 flex items-center">
                <Truck className="w-3 h-3 mr-1" />
                Entrega até {item.raio_entrega_km}km
              </span>
            ) : (
              <span className="text-xs text-gray-500 flex items-center">
                <Home className="w-3 h-3 mr-1" />
                Retirar no local
              </span>
            )}
            
            {item.endereco_cidade && (
              <span className="text-xs text-gray-500">
                {item.endereco_cidade}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
