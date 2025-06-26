
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import EmptyState from '@/components/loading/EmptyState';
import ItemCardWithActions from '@/components/shared/ItemCardWithActions';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useItensOptimized } from '@/hooks/useItensOptimized';

const MeusItens = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: itens = [], isLoading, error, refetch } = useItensOptimized.useMeusItens(user?.id || '');

  const handleItemClick = (itemId: string) => {
    navigate(`/item/${itemId}`);
  };

  const handleUpdate = () => {
    refetch();
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-24">
        <Header />
        
        <main className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Meus Itens</h1>
              <p className="text-gray-600">Gerencie seus itens publicados</p>
            </div>
            
            <Button
              onClick={() => navigate('/publicar')}
              className="bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Item
            </Button>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          )}

          {/* Error */}
          {error && (
            <EmptyState
              type="generic"
              title="Erro ao carregar itens"
              description="Tente novamente em alguns instantes"
              actionLabel="Tentar novamente"
              onAction={() => refetch()}
            />
          )}

          {/* Empty State */}
          {!isLoading && !error && itens.length === 0 && (
            <EmptyState
              type="search"
              title="Nenhum item encontrado"
              description="Você ainda não publicou nenhum item"
              actionLabel="Publicar primeiro item"
              onAction={() => navigate('/publicar')}
            />
          )}

          {/* Grid de Itens */}
          {!isLoading && !error && itens.length > 0 && (
            <>
              <div className="mb-4 text-sm text-gray-600">
                {itens.length} {itens.length === 1 ? 'item encontrado' : 'itens encontrados'}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {itens.map((item) => (
                  <ItemCardWithActions
                    key={item.id}
                    item={item}
                    onItemClick={handleItemClick}
                    showActions={true}
                    onUpdate={handleUpdate}
                  />
                ))}
              </div>
            </>
          )}
        </main>
        
        <QuickNav />
      </div>
    </AuthGuard>
  );
};

export default MeusItens;
