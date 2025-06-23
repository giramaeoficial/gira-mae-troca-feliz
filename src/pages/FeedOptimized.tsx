
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

const FeedOptimized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('todas');
  const [ordem, setOrdem] = useState('recentes');
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [location, setLocation] = useState<{ estado: string; cidade: string; bairro?: string } | null>(null);
  const [filtrosAvancados, setFiltrosAvancados] = useState({
    mesmaEscola: false,
    mesmoBairro: false,
    paraFilhos: false,
  });

  const debouncedBusca = useDebounce(busca, 500);

  // Configurar localização padrão baseada no perfil
  useEffect(() => {
    if (profile?.cidade && profile?.estado) {
      setLocation({
        estado: profile.estado,
        cidade: profile.cidade,
        bairro: profile.bairro || undefined
      });
      setShowLocationPrompt(false);
    } else if (user && !showLocationPrompt) {
      setShowLocationPrompt(true);
    }
  }, [profile, user, showLocationPrompt]);

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
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fixo */}
      <div className="sticky top-0 bg-white border-b shadow-sm z-40">
        <div className="p-4 space-y-4">
          {/* Título e localização atual */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Roupinhas Próximas
              </h1>
              {location?.cidade && (
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <MapPin className="w-3 h-3 mr-1" />
                  {location.cidade}{location.bairro ? `, ${location.bairro}` : ''}
                  {filtrosAvancados.mesmaEscola && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      Mesma escola
                    </span>
                  )}
                  {filtrosAvancados.mesmoBairro && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      Mesmo bairro
                    </span>
                  )}
                  {filtrosAvancados.paraFilhos && (
                    <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                      Para meus filhos
                    </span>
                  )}
                </p>
              )}
            </div>
            <Button
              onClick={() => navigate('/publicar')}
              size="sm"
              className="bg-pink-500 hover:bg-pink-600 text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Publicar
            </Button>
          </div>

          {/* Barra de busca */}
          <div className="relative">
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
      </div>

      {/* Conteúdo principal */}
      <div className="pb-20">
        {/* Prompt de localização */}
        {showLocationPrompt && (
          <LocationPrompt
            onConfigureClick={handleConfigureLocation}
            onDismiss={() => setShowLocationPrompt(false)}
          />
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-2 gap-4 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <ItemCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-4">
            <EmptyState
              type="generic"
              title="Erro ao carregar itens"
              description="Tente novamente em alguns instantes"
              actionLabel="Tentar novamente"
              onAction={() => refetch()}
            />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && itensFiltrados.length === 0 && (
          <div className="p-4">
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
                  "Tente expandir sua busca ou verifique outras cidades próximas" :
                  "Configure sua localização para ver itens próximos"
              }
              actionLabel={
                filtrosAvancados.mesmaEscola || filtrosAvancados.mesmoBairro || filtrosAvancados.paraFilhos ?
                  "Limpar filtros" :
                  !location?.cidade ? "Configurar localização" : "Limpar filtros"
              }
              onAction={
                filtrosAvancados.mesmaEscola || filtrosAvancados.mesmoBairro || filtrosAvancados.paraFilhos ?
                  limparFiltros :
                  !location?.cidade ? handleConfigureLocation : limparFiltros
              }
            />
          </div>
        )}

        {/* Grid de itens */}
        {!isLoading && !error && itensFiltrados.length > 0 && (
          <div className="grid grid-cols-2 gap-4 p-4">
            {itensFiltrados.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onItemClick={handleItemClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedOptimized;
