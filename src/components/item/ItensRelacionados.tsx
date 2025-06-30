
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ItemCard } from '@/components/shared/ItemCard';
import { useItensInteligentes } from '@/hooks/useItensInteligentes';
import { Sparkles, User } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

interface ItensRelacionadosProps {
  itemAtual: Tables<'itens'> & {
    publicado_por_profile?: {
      nome: string;
      avatar_url?: string;
      reputacao?: number;
    } | null;
  };
  location?: {
    cidade: string;
    estado: string;
    bairro?: string;
  } | null;
  // ✅ NOVOS PROPS - Dados consolidados passados pela tela pai
  feedData: {
    favoritos: string[];
    reservas_usuario: Array<{
      item_id: string;
      status: string;
      id: string;
      usuario_reservou: string;
    }>;
    filas_espera: Record<string, {
      total_fila: number;
      posicao_usuario?: number;
      usuario_id: string;
    }>;
  };
  currentUserId: string;
  userSchoolIds: number[];
}

const ItensRelacionados: React.FC<ItensRelacionadosProps> = ({ 
  itemAtual, 
  location,
  feedData,
  currentUserId,
  userSchoolIds
}) => {
  // ✅ MANTIDO - Busca de itens similares (isso é diferente dos dados do usuário)
  const { data: itensSimilares = [], isLoading: loadingSimilares } = useItensInteligentes({
    categoria: itemAtual.categoria,
    subcategoria: itemAtual.subcategoria || undefined,
    genero: itemAtual.genero || undefined,
    location: location,
    ordem: 'recentes'
  });

  const { data: itensVendedor = [], isLoading: loadingVendedor } = useItensInteligentes({
    location: location,
    ordem: 'recentes'
  });

  // Filtrar item atual e pegar apenas os 4 primeiros para itens similares
  const itensParaMostrar = itensSimilares
    .filter(item => item.id !== itemAtual.id)
    .slice(0, 4);

  // Filtrar itens do mesmo vendedor (excluindo o atual)
  const itensDoVendedor = itensVendedor
    .filter(item => 
      item.publicado_por === itemAtual.publicado_por && 
      item.id !== itemAtual.id
    )
    .slice(0, 4);

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-gray-200 animate-pulse rounded-lg aspect-square"></div>
      ))}
    </div>
  );

  // ✅ FUNÇÃO HELPER - Verificar escola em comum usando dados consolidados
  const hasCommonSchoolWithItem = (item: any): boolean => {
    if (!item.escolas_inep?.escola || userSchoolIds.length === 0) return false;
    // Lógica simples - se o item tem escola marcada e o usuário tem filhos em escolas
    return userSchoolIds.length > 0;
  };
  
  // ✅ FUNÇÃO HELPER - Enriquecer item com dados consolidados
  const enrichItemWithFeedData = (item: any) => ({
    ...item,
    escola_comum: hasCommonSchoolWithItem(item)
  });

  return (
    <div className="space-y-6">
      {/* Itens Relacionados */}
      {(loadingSimilares || itensParaMostrar.length > 0) && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5" />
              Itens Relacionados
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Outros itens similares que podem te interessar
            </p>
          </CardHeader>
          <CardContent>
            {loadingSimilares ? (
              <LoadingSkeleton />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {itensParaMostrar.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={enrichItemWithFeedData(item)}
                    feedData={feedData}
                    currentUserId={currentUserId}
                    compact={true}
                    showActions={false}
                    showLocation={false}
                    showAuthor={false}
                    onItemClick={(itemId) => {
                      window.location.href = `/item/${itemId}`;
                    }}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Itens do Mesmo Vendedor */}
      {(loadingVendedor || itensDoVendedor.length > 0) && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5" />
              Mais itens de {itemAtual.publicado_por_profile?.nome || 'Este vendedor'}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Outros itens disponíveis deste vendedor
            </p>
          </CardHeader>
          <CardContent>
            {loadingVendedor ? (
              <LoadingSkeleton />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {itensDoVendedor.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={enrichItemWithFeedData(item)}
                    feedData={feedData}
                    currentUserId={currentUserId}
                    compact={true}
                    showActions={false}
                    showLocation={false}
                    showAuthor={false}
                    onItemClick={(itemId) => {
                      window.location.href = `/item/${itemId}`;
                    }}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ItensRelacionados;
