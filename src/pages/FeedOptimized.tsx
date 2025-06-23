import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import ManualLocationSelector from '@/components/shared/ManualLocationSelector';

const FeedOptimized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('todas');
  const [ordem, setOrdem] = useState('recentes');
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  
  // Estado para localização manual (temporária)
  const [manualLocation, setManualLocation] = useState<{ estado: string; cidade: string; bairro?: string } | null>(null);
  
  // Estado padrão baseado no perfil
  const [defaultLocation, setDefaultLocation] = useState<{ estado: string; cidade: string; bairro?: string } | null>(null);
  
  const [filtrosAvancados, setFiltrosAvancados] = useState({
    mesmaEscola: false,
    mesmoBairro: false,
    paraFilhos: false,
  });

  const debouncedBusca = useDebounce(busca, 500);

  // Configurar localização padrão baseada no perfil
  useEffect(() => {
    if (profile?.cidade && profile?.estado) {
      const profileLocation = {
        estado: profile.estado,
        cidade: profile.cidade,
        bairro: profile.bairro || undefined
      };
      setDefaultLocation(profileLocation);
      setShowLocationPrompt(false);
    } else if (user && !showLocationPrompt) {
      setShowLocationPrompt(true);
    }
  }, [profile, user, showLocationPrompt]);

  // Determinar qual localização usar na busca
  const location = manualLocation || defaultLocation;

  // Buscar itens inteligentes
  const { 
    data: itens = [], 
    isLoading, 
    error,
    refetch 
  } = useItensInteligentes({
    location,
    mesmaEscola: filtrosAvancados.mesmaEscola,
    mesmoBairro: filtrosAvancados.mesmoBairro,
    paraFilhos: filtrosAvancados.paraFilhos,
    categoria: categoria !== 'todas' ? categoria : undefined,
    ordem,
    busca: debouncedBusca
  });

  // Filtrar por busca local (mais rápido que refazer query)
  const itensFiltrados = React.useMemo(() => {
    if (!debouncedBusca) return itens;
    
    return itens.filter(item =>
      item.titulo.toLowerCase().includes(debouncedBusca.toLowerCase()) ||
      item.descricao?.toLowerCase().includes(debouncedBusca.toLowerCase())
    );
  }, [itens, debouncedBusca]);

  const handleItemClick = (itemId: string) => {
    navigate(`/item/${itemId}`);
  };

  const handleConfigureLocation = () => {
    navigate('/perfil');
  };

  const handleFilterChange = (newFilters: any) => {
    console.log('🔧 Filtros alterados:', newFilters);
    
    // Atualizar filtros avançados
    if (newFilters.mesmaEscola !== undefined) {
      setFiltrosAvancados(prev => ({ ...prev, mesmaEscola: newFilters.mesmaEscola }));
    }
    if (newFilters.mesmoBairro !== undefined) {
      setFiltrosAvancados(prev => ({ ...prev, mesmoBairro: newFilters.mesmoBairro }));
    }
    if (newFilters.paraFilhos !== undefined) {
      setFiltrosAvancados(prev => ({ ...prev, paraFilhos: newFilters.paraFilhos }));
    }
    
    // Atualizar filtros básicos
    if (newFilters.categoria !== undefined) {
      setCategoria(newFilters.categoria);
    }
    if (newFilters.ordem !== undefined) {
      setOrdem(newFilters.ordem);
    }
    if (newFilters.busca !== undefined) {
      setBusca(newFilters.busca);
    }
  };

  const handleManualLocationChange = (newLocation: { estado: string; cidade: string } | null) => {
    if (newLocation) {
      setManualLocation({
        estado: newLocation.estado,
        cidade: newLocation.cidade
      });
    } else {
      setManualLocation(null);
    }
  };

  const limparFiltros = () => {
    setBusca('');
    setCategoria('todas');
    setOrdem('recentes');
    setFiltrosAvancados({
      mesmaEscola: false,
      mesmoBairro: false,
      paraFilhos: false,
    });
  };

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
            Encontre Tesouros {location?.cidade ? `em ${location.cidade}` : 'próximos'}
          </h1>
          <p className="text-gray-600 text-lg">
            Descubra itens incríveis com filtros inteligentes
          </p>
        </div>

        {/* Filtros principais em card */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          {/* Título e localização atual */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Filtros Inteligentes
              </h2>
              <div className="flex items-center gap-2 mt-1">
                {location?.cidade && (
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>
                      {location.cidade}{location.bairro ? `, ${location.bairro}` : ''}
                      {manualLocation && (
                        <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                          Local temporário
                        </span>
                      )}
                    </span>
                  </div>
                )}
                
                {/* Badges de filtros ativos */}
                {filtrosAvancados.mesmaEscola && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                    Mesma escola
                  </span>
                )}
                {filtrosAvancados.mesmoBairro && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    Mesmo bairro
                  </span>
                )}
                {filtrosAvancados.paraFilhos && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                    Para meus filhos
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Seletor manual de localização */}
              <ManualLocationSelector
                currentLocation={manualLocation}
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

          {/* Barra de busca */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar roupinha, brinquedo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtros rápidos */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="roupas">Roupas</SelectItem>
                <SelectItem value="calcados">Calçados</SelectItem>
                <SelectItem value="brinquedos">Brinquedos</SelectItem>
                <SelectItem value="livros">Livros</SelectItem>
                <SelectItem value="acessorios">Acessórios</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ordem} onValueChange={setOrdem}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recentes">Mais recentes</SelectItem>
                <SelectItem value="menor-preco">Menor preço</SelectItem>
                <SelectItem value="maior-preco">Maior preço</SelectItem>
              </SelectContent>
            </Select>

            <AdvancedFilters
              filters={{
                busca,
                categoria,
                ordem,
                escola: null,
                mesmaEscola: filtrosAvancados.mesmaEscola,
                mesmoBairro: filtrosAvancados.mesmoBairro,
                paraFilhos: filtrosAvancados.paraFilhos,
              }}
              onFilterChange={handleFilterChange}
              location={location}
            />
          </div>
        </div>

        {/* Prompt de localização */}
        {showLocationPrompt && !location && (
          <LocationPrompt
            onConfigureClick={handleConfigureLocation}
            onDismiss={() => setShowLocationPrompt(false)}
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
        {!isLoading && !error && itensFiltrados.length === 0 && (
          <EmptyState
            type="search"
            title={location?.cidade ? 
              `Nenhum item encontrado em ${location.cidade}` : 
              "Nenhum item encontrado"
            }
            description={
              filtrosAvancados.mesmaEscola || filtrosAvancados.mesmoBairro || filtrosAvancados.paraFilhos ?
              "Tente remover alguns filtros para ver mais opções" :
              location?.cidade ? 
                "Tente expandir sua busca ou selecionar outra localização" :
                "Configure sua localização para ver itens próximos"
            }
            actionLabel={
              filtrosAvancados.mesmaEscola || filtrosAvancados.mesmoBairro || filtrosAvancados.paraFilhos ?
                "Limpar filtros" :
                !location?.cidade ? "Selecionar localização" : "Limpar filtros"
            }
            onAction={
              filtrosAvancados.mesmaEscola || filtrosAvancados.mesmoBairro || filtrosAvancados.paraFilhos ?
                limparFiltros :
                !location?.cidade ? () => setShowLocationPrompt(true) : limparFiltros
            }
          />
        )}

        {/* Grid de itens */}
        {!isLoading && !error && itensFiltrados.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {itensFiltrados.map((item) => (
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

export default FeedOptimized;
