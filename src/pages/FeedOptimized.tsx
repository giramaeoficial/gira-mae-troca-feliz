
import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import ItemCardSkeleton from '@/components/loading/ItemCardSkeleton';
import EmptyState from '@/components/loading/EmptyState';
import { ItemCard } from '@/components/shared/ItemCard';
import { LocationPrompt } from '@/components/shared/LocationPrompt';
import AdvancedFilters from '@/components/shared/AdvancedFilters';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useItensInteligentes } from '@/hooks/useItensInteligentes';
import { useDebounce } from '@/hooks/useDebounce';
import { useFeedFilters } from '@/contexts/FeedFiltersContext';
import { FeedFiltersProvider } from '@/contexts/FeedFiltersContext';
import ManualLocationSelector from '@/components/shared/ManualLocationSelector';

const FeedContent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { filters, updateFilter } = useFeedFilters();
  
  const debouncedBusca = useDebounce(filters.busca, 500);

  // Configurar localização padrão baseada no perfil
  useEffect(() => {
    if (profile?.cidade && profile?.estado && !filters.location) {
      const profileLocation = {
        estado: profile.estado,
        cidade: profile.cidade,
        bairro: profile.bairro || undefined
      };
      updateFilter('location', profileLocation);
    }
  }, [profile, filters.location, updateFilter]);

  // Buscar itens inteligentes
  const { 
    data: itens = [], 
    isLoading, 
    error,
    refetch 
  } = useItensInteligentes({
    location: filters.location,
    mesmaEscola: filters.mesmaEscola,
    mesmoBairro: filters.mesmoBairro,
    paraFilhos: filters.paraFilhos,
    apenasFavoritos: filters.apenasFavoritos,
    apenasSeguidoras: filters.apenasSeguidoras,
    categoria: filters.categoria !== 'todas' ? filters.categoria : undefined,
    ordem: filters.ordem,
    busca: debouncedBusca
  });

  const handleItemClick = useCallback((itemId: string) => {
    navigate(`/item/${itemId}`);
  }, [navigate]);

  const handleConfigureLocation = useCallback(() => {
    navigate('/perfil');
  }, [navigate]);

  const handleManualLocationChange = useCallback((newLocation: { estado: string; cidade: string } | null) => {
    if (newLocation) {
      updateFilter('location', {
        estado: newLocation.estado,
        cidade: newLocation.cidade
      });
    } else {
      updateFilter('location', null);
    }
  }, [updateFilter]);

  const handleSearch = useCallback(() => {
    refetch();
  }, [refetch]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
        <QuickNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-24">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent mb-2">
            Encontre Tesouros {filters.location?.cidade ? `em ${filters.location.cidade}` : 'próximos'}
          </h1>
          <p className="text-gray-600 text-lg">
            Descubra itens incríveis com filtros inteligentes
          </p>
        </div>

        {/* Header com localização e publicar */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Filtros Inteligentes
              </h2>
              {filters.location?.cidade && (
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>
                    {filters.location.cidade}{filters.location.bairro ? `, ${filters.location.bairro}` : ''}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <ManualLocationSelector
                currentLocation={filters.location}
                onLocationChange={handleManualLocationChange}
              />
              
              <Button
                onClick={() => navigate('/publicar')}
                size="sm"
                className="bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                Publicar
              </Button>
            </div>
          </div>
        </div>

        {/* Filtros principais */}
        <AdvancedFilters onSearch={handleSearch} />

        {/* Prompt de localização */}
        {!filters.location && (
          <LocationPrompt
            onConfigureClick={handleConfigureLocation}
            onDismiss={() => {}}
          />
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <ItemCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <EmptyState
            type="generic"
            title="Erro ao carregar itens"
            description="Tente novamente em alguns instantes"
            actionLabel="Tentar novamente"
            onAction={() => refetch()}
          />
        )}

        {/* Empty state */}
        {!isLoading && !error && itens.length === 0 && (
          <EmptyState
            type="search"
            title={filters.location?.cidade ? 
              `Nenhum item encontrado em ${filters.location.cidade}` : 
              "Nenhum item encontrado"
            }
            description="Tente ajustar os filtros para ver mais opções"
            actionLabel="Limpar filtros"
            onAction={() => updateFilter('busca', '')}
          />
        )}

        {/* Grid de itens */}
        {!isLoading && !error && itens.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {itens.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onItemClick={handleItemClick}
              />
            ))}
          </div>
        )}
      </main>
      
      <QuickNav />
    </div>
  );
};

const FeedOptimized = () => {
  return (
    <FeedFiltersProvider>
      <FeedContent />
    </FeedFiltersProvider>
  );
};

export default FeedOptimized;
