
import React from 'react';
import { ItemCard } from './ItemCard';
import ItemActions from '../perfil/ItemActions';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';

interface ItemCardWithActionsProps {
  item: any; // Usar any para compatibilidade com ItemCard existente
  onItemClick: (itemId: string) => void;
  showActions?: boolean;
  onUpdate?: () => void;
}

const ItemCardWithActions: React.FC<ItemCardWithActionsProps> = ({
  item,
  onItemClick,
  showActions = false,
  onUpdate
}) => {
  const { user } = useAuth();
  
  // Verificar se o usuário é o dono do item
  const isOwner = user?.id === item.publicado_por;
  const shouldShowActions = showActions && isOwner;

  return (
    <div className="relative">
      <ItemCard 
        item={item} 
        onItemClick={onItemClick}
      />
      
      {shouldShowActions && (
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-sm">
          <ItemActions 
            item={item as Tables<'itens'>}
            onUpdate={onUpdate}
          />
        </div>
      )}
    </div>
  );
};

export default ItemCardWithActions;
