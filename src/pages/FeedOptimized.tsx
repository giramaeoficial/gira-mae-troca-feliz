
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import ItemCardSkeleton from '@/components/loading/ItemCardSkeleton';
import EmptyState from '@/components/loading/EmptyState';
import { ItemCard } from '@/components/shared/ItemCard';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useItensInteligentes } from '@/hooks/useItensInteligentes';
import { useDebounce } from '@/hooks/useDebounce';
import { useSimpleGeolocation } from '@/hooks/useSimpleGeolocation';
import { useConfigCategorias } from '@/hooks/useConfigCategorias';
import { useSubcategorias } from '@/hooks/useSubcategorias';
import { useTiposTamanho } from '@/hooks/useTamanhosPorCategoria';

const FeedOptimized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  
  // Estados dos filtros - versão simplificada
  const [busca, setBusca] = useState('');
  const [cidadeManual, setCidadeManual] = useState('');
  const [categoria, setCategoria] = useState('todas');
  const [subcategoria, setSubcategoria] = useState('todas');
  const [genero, setGenero] = useState('todos');
  const [tamanho, setTamanho] = useState('todos');
  const [precoRange, setPrecoRange] = useState([0, 200]);
  const [mostrarFiltrosAvancados, setMostrarFiltrosAvancados] = useState(false);
  const [filtrosAplicados, setFiltrosAplicados] = useState(true); // Sempre mostrar itens por padrão
  
  // Geolocalização
  const { location, loading: geoLoading, error: geoError, detectarLocalizacao, limparLocalizacao } = useSimpleGeolocation();
  
  // Dados dos dropdowns
  const { configuracoes: categorias = [], isLoading: loadingCategorias } = useConfigCategorias();
  const { subcategorias: todasSubcategorias = [], isLoading: loadingSubcategorias } = useSubcategorias();
  const { tiposTamanho, isLoading: loadingTamanhos } = useTiposTamanho(categoria !== 'todas' ? categoria : undefined);

  // Debug logs para verificar os dados
  console.log('🔍 Debug FeedOptimized:', {
    categoria,
    subcategoria,
    tamanho,
    genero,
    categorias: categorias.length,
    todasSubcategorias: todasSubcategorias.length,
    tiposTamanho: Object.keys(tiposTamanho || {}).length,
    loadingCategorias,
    loadingSubcategorias,
    loadingTamanhos
  });

  // Filtrar subcategorias baseado na categoria selecionada
  const subcategoriasFiltradas = React.useMemo(() => {
    if (!todasSubcategorias || categoria === 'todas') return [];
    
    const filtradas = todasSubcategorias.filter(sub => sub.categoria_pai === categoria);
    
    // Remover duplicatas baseado no nome
    const subcategoriasUnicas = filtradas.reduce((acc, sub) => {
      if (!acc.some(item => item.nome === sub.nome)) {
        acc.push(sub);
      }
      return acc;
    }, [] as typeof filtradas);
    
    return subcategoriasUnicas;
  }, [todasSubcategorias, categoria]);

  // Obter tamanhos do primeiro tipo disponível sem duplicação
  const tamanhosDisponiveis = React.useMemo(() => {
    const tipos = Object.keys(tiposTamanho || {});
    const tipoUnico = tipos[0];
    const tamanhos = tipoUnico ? (tiposTamanho[tipoUnico] || []) : [];
    
    // Remover duplicatas baseado no valor
    const tamanhosUnicos = tamanhos.reduce((acc, tamanho) => {
      if (!acc.some(item => item.valor === tamanho.valor)) {
        acc.push(tamanho);
      }
      return acc;
    }, [] as typeof tamanhos);
    
    return tamanhosUnicos;
  }, [tiposTamanho]);

  // Debug para subcategorias
  console.log('🔍 Debug Subcategorias:', {
    categoria,
    subcategoriasFiltradas: subcategoriasFiltradas.length,
    exemplos: subcategoriasFiltradas.slice(0, 3).map(s => ({ nome: s.nome, categoria_pai: s.categoria_pai }))
  });

  // Debug para tamanhos
  console.log('🔍 Debug Tamanhos:', {
    categoria,
    tamanhosDisponiveis: tamanhosDisponiveis.length,
    exemplos: tamanhosDisponiveis.slice(0, 3).map(t => ({ valor: t.valor, label: t.label_display }))
  });

  const debouncedBusca = useDebounce(busca, 500);

  // Localização para busca
  const locationForSearch = location || (cidadeManual ? { 
    cidade: cidadeManual, 
    estado: '',
    bairro: undefined 
  } : (profile?.cidade && profile?.estado ? {
    cidade: profile.cidade,
    estado: profile.estado,
    bairro: profile.bairro || undefined
  } : null));

  // Buscar itens inteligentes
  const { 
    data: itens = [], 
    isLoading, 
    error,
    refetch 
  } = useItensInteligentes({
    location: locationForSearch,
    categoria: categoria !== 'todas' ? categoria : undefined,
    subcategoria: subcategoria !== 'todas' ? subcategoria : undefined,
    busca: debouncedBusca,
    precoMin: precoRange[0],
    precoMax: precoRange[1],
    ordem: 'recentes'
  });

  const handleItemClick = useCallback((itemId: string) => {
    navigate(`/item/${itemId}`);
  }, [navigate]);

  const handleAplicarFiltros = () => {
    setFiltrosAplicados(true);
    refetch();
  };

  const handleLimparFiltros = () => {
    setBusca('');
    setCidadeManual('');
    setCategoria('todas');
    setSubcategoria('todas');
    setGenero('todos');
    setTamanho('todos');
    setPrecoRange([0, 200]);
    limparLocalizacao();
    setMostrarFiltrosAvancados(false);
    refetch();
  };

  const handleLocationClick = () => {
    if (location) {
      limparLocalizacao();
    } else {
      detectarLocalizacao();
    }
  };

  const toggleFiltrosAvancados = () => {
    setMostrarFiltrosAvancados(!mostrarFiltrosAvancados);
  };

  const handleCategoriaChange = (novaCategoria: string) => {
    setCategoria(novaCategoria);
    setSubcategoria('todas'); // Reset subcategoria
    setTamanho('todos'); // Reset tamanho
  };

  const handleTamanhoChange = (valor: string) => {
    setTamanho(valor);
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

  const getLocationText = () => {
    if (locationForSearch) {
      return `em ${locationForSearch.cidade}`;
    }
    return 'próximos';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-24">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent mb-2">
            Encontre Tesouros {getLocationText()}
          </h1>
          <p className="text-gray-600 text-lg">
            Descubra itens incríveis na sua região
          </p>
        </div>

        {/* Header com localização e publicar */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Buscar Itens
              </h2>
              {locationForSearch && (
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>
                    {locationForSearch.cidade}{locationForSearch.bairro ? `, ${locationForSearch.bairro}` : ''}
                  </span>
                </div>
              )}
            </div>
            
            <Button
              onClick={() => navigate('/publicar')}
              size="sm"
              className="bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Publicar
            </Button>
          </div>

          {/* Campo de busca com ícone de filtro */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Busque por vestido, carrinho, lego..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 pr-12 h-12 text-base"
            />
            <button
              onClick={toggleFiltrosAvancados}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
            >
              <Filter className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Filtros Avançados - só aparecem quando clicado no ícone */}
          {mostrarFiltrosAvancados && (
            <div className="space-y-6 border-t pt-4">
              {/* Seção Localização */}
              <div>
                <h3 className="font-medium mb-3 text-gray-700 uppercase text-sm tracking-wide">LOCALIZAÇÃO</h3>
                
                <Input
                  type="text"
                  placeholder="Digite sua cidade..."
                  value={cidadeManual}
                  onChange={(e) => setCidadeManual(e.target.value)}
                  className="w-full h-12 text-base mb-3"
                />
                
                <Button
                  onClick={handleLocationClick}
                  disabled={geoLoading}
                  variant="outline"
                  className="w-full h-12 flex items-center justify-start"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {geoLoading ? 'Detectando localização...' : 
                   location ? `✅ ${location.cidade}, ${location.estado} - Alterar` :
                   '📍 Usar Minha Localização Atual'}
                </Button>
                
                {geoError && (
                  <p className="text-red-500 text-sm mt-2">{geoError}</p>
                )}
              </div>

              {/* Categoria e Subcategoria */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-3 text-gray-700 uppercase text-sm tracking-wide">CATEGORIA</h3>
                  <Select value={categoria} onValueChange={handleCategoriaChange}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 rounded-lg shadow-lg max-h-60 z-50">
                      <SelectItem value="todas">Todas</SelectItem>
                      {loadingCategorias ? (
                        <SelectItem value="loading" disabled>Carregando...</SelectItem>
                      ) : (
                        categorias.map((cat) => (
                          <SelectItem key={cat.codigo} value={cat.codigo}>
                            <span className="flex items-center gap-2">
                              <span className="text-sm">{cat.icone}</span>
                              {cat.nome}
                            </span>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3 className="font-medium mb-3 text-gray-700 uppercase text-sm tracking-wide">SUBCATEGORIA</h3>
                  <Select 
                    value={subcategoria} 
                    onValueChange={setSubcategoria}
                    disabled={categoria === 'todas' || loadingSubcategorias}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 rounded-lg shadow-lg max-h-60 z-50">
                      <SelectItem value="todas">Todas</SelectItem>
                      {loadingSubcategorias ? (
                        <SelectItem value="loading" disabled>Carregando...</SelectItem>
                      ) : subcategoriasFiltradas.length === 0 ? (
                        <SelectItem value="none" disabled>Nenhuma subcategoria encontrada</SelectItem>
                      ) : (
                        subcategoriasFiltradas.map((sub) => (
                          <SelectItem key={sub.id} value={sub.nome}>
                            <span className="flex items-center gap-2">
                              <span className="text-sm">{sub.icone}</span>
                              {sub.nome}
                            </span>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Gênero e Tamanho */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-3 text-gray-700 uppercase text-sm tracking-wide">GÊNERO</h3>
                  <Select value={genero} onValueChange={setGenero}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 rounded-lg shadow-lg z-50">
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="menino">
                        <span className="flex items-center gap-2">
                          <span className="text-sm">👦</span>
                          Menino
                        </span>
                      </SelectItem>
                      <SelectItem value="menina">
                        <span className="flex items-center gap-2">
                          <span className="text-sm">👧</span>
                          Menina
                        </span>
                      </SelectItem>
                      <SelectItem value="unissex">
                        <span className="flex items-center gap-2">
                          <span className="text-sm">👶</span>
                          Unissex
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3 className="font-medium mb-3 text-gray-700 uppercase text-sm tracking-wide">
                    {categoria === 'calcados' ? 'NÚMERO' : 
                     categoria === 'brinquedos' ? 'IDADE' : 
                     categoria === 'livros' ? 'FAIXA ETÁRIA' : 'TAMANHO'}
                  </h3>
                  <Select 
                    value={tamanho} 
                    onValueChange={handleTamanhoChange}
                    disabled={categoria === 'todas' || loadingTamanhos}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 rounded-lg shadow-lg max-h-60 z-50">
                      <SelectItem value="todos">Todos</SelectItem>
                      {loadingTamanhos ? (
                        <SelectItem value="loading" disabled>Carregando...</SelectItem>
                      ) : tamanhosDisponiveis.length === 0 ? (
                        <SelectItem value="none" disabled>Nenhum tamanho encontrado</SelectItem>
                      ) : (
                        tamanhosDisponiveis.map((tam) => (
                          <SelectItem key={tam.id} value={tam.valor}>
                            {tam.label_display}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Faixa de Preço */}
              <div>
                <h3 className="font-medium mb-3 text-gray-700 uppercase text-sm tracking-wide">
                  PREÇO: {precoRange[0]} - {precoRange[1]} Girinhas
                </h3>
                <div className="px-2">
                  <Slider
                    value={precoRange}
                    onValueChange={setPrecoRange}
                    max={200}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleLimparFiltros}
                  variant="outline"
                  className="flex-1 h-12"
                >
                  Limpar Filtros
                </Button>
                <Button
                  onClick={handleAplicarFiltros}
                  className="flex-1 h-12 bg-gradient-to-r from-primary to-pink-500"
                >
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          )}
        </div>

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
            title={locationForSearch?.cidade ? 
              `Nenhum item encontrado em ${locationForSearch.cidade}` : 
              "Nenhum item encontrado"
            }
            description="Tente ajustar os filtros para ver mais opções"
            actionLabel="Limpar filtros"
            onAction={handleLimparFiltros}
          />
        )}

        {/* Grid de itens */}
        {!isLoading && !error && itens.length > 0 && (
          <>
            {/* Contador de resultados */}
            <div className="mb-4 text-sm text-gray-600">
              {itens.length} {itens.length === 1 ? 'item encontrado' : 'itens encontrados'}
              {locationForSearch && ` em ${locationForSearch.cidade}`}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {itens.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onItemClick={handleItemClick}
                />
              ))}
            </div>
          </>
        )}
      </main>
      
      <QuickNav />
    </div>
  );
};

export default FeedOptimized;
