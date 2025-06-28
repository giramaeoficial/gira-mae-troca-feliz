
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
import { ItemCard } from '@/components/shared/ItemCard';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useItensInteligentes } from '@/hooks/useItensOptimized';
import { useDebounce } from '@/hooks/useDebounce';
import { useSimpleGeolocation } from '@/hooks/useSimpleGeolocation';
import { useConfigCategorias } from '@/hooks/useConfigCategorias';
import { useSubcategorias } from '@/hooks/useSubcategorias';
import { useTiposTamanho } from '@/hooks/useTamanhosPorCategoria';
import { toast } from '@/hooks/use-toast';

const FeedOptimized = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile } = useProfile();
  
  // Estados dos filtros - versão simplificada
  const [filtros, setFiltros] = useState({
    categoria: '',
    subcategoria: '',
    genero: '',
    tamanho: '',
    estadoConservacao: '',
    precoMin: 0,
    precoMax: 1000,
    localizacao: '',
    raio: 10
  });

  const [showFiltros, setShowFiltros] = useState(false);
  const [ordenacao, setOrdenacao] = useState<'recentes' | 'preco_menor' | 'preco_maior' | 'distancia'>('recentes');
  
  const { location } = useSimpleGeolocation();
  const { configuracoes } = useConfigCategorias();
  const { subcategorias } = useSubcategorias();
  const { tiposTamanho } = useTiposTamanho();

  // Coordenadas simuladas baseadas na localização
  const coordenadas = location ? { 
    latitude: -23.5505, 
    longitude: -46.6333 
  } : null;

  // Hook principal para buscar itens
  const { 
    data: itens, 
    isLoading, 
    error, 
    isFetching,
    hasNextPage,
    fetchNextPage
  } = useItensInteligentes({
    ...filtros,
    coordenadas,
    ordenacao,
    enabled: !!user
  });

  const handleFiltroChange = useCallback((campo: string, valor: any) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor,
      // Limpar subcategoria se categoria mudou
      ...(campo === 'categoria' && { subcategoria: '' }),
      // Limpar tamanho se categoria mudou
      ...(campo === 'categoria' && { tamanho: '' })
    }));
  }, []);

  const limparFiltros = useCallback(() => {
    setFiltros({
      categoria: '',
      subcategoria: '',
      genero: '',
      tamanho: '',
      estadoConservacao: '',
      precoMin: 0,
      precoMax: 1000,
      localizacao: '',
      raio: 10
    });
    setOrdenacao('recentes');
  }, []);

  // Filtrar subcategorias sem duplicação
  const subcategoriasFiltradas = React.useMemo(() => {
    if (!subcategorias || !filtros.categoria) return [];
    
    const filtradas = subcategorias.filter(sub => sub.categoria_pai === filtros.categoria);
    
    // Remover duplicatas baseado no nome
    const subcategoriasUnicas = filtradas.reduce((acc, sub) => {
      if (!acc.some(item => item.nome === sub.nome)) {
        acc.push(sub);
      }
      return acc;
    }, [] as typeof filtradas);
    
    return subcategoriasUnicas;
  }, [subcategorias, filtros.categoria]);

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

  // Verificar se o usuário está logado
  if (authLoading) {
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

  if (!user) {
    toast({
      title: "Acesso negado",
      description: "Você precisa estar logada para acessar o feed.",
      variant: "destructive",
    });
    navigate('/auth');
    return null;
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-24">
        <Header />
        
        <main className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Header do Feed */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Itens Disponíveis
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {profile?.cidade || 'Todas as localidades'}
                {itens && (
                  <span className="text-sm">
                    • {Array.isArray(itens) ? itens.length : 0} item(ns)
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFiltros(!showFiltros)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 w-4" />
                Filtros
              </Button>
            </div>
          </div>

          {/* Painel de Filtros Expandido */}
          {showFiltros && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <Select
                  value={filtros.categoria}
                  onValueChange={(value) => handleFiltroChange('categoria', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as categorias</SelectItem>
                    {configuracoes.map((cat) => (
                      <SelectItem key={cat.codigo} value={cat.codigo}>
                        {cat.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {filtros.categoria && subcategoriasFiltradas.length > 0 && (
                  <Select
                    value={filtros.subcategoria}
                    onValueChange={(value) => handleFiltroChange('subcategoria', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Subcategoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as subcategorias</SelectItem>
                      {subcategoriasFiltradas.map((sub) => (
                        <SelectItem key={sub.id} value={sub.nome}>
                          {sub.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Select
                  value={filtros.genero}
                  onValueChange={(value) => handleFiltroChange('genero', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os gêneros</SelectItem>
                    <SelectItem value="menino">Menino</SelectItem>
                    <SelectItem value="menina">Menina</SelectItem>
                    <SelectItem value="unissex">Unissex</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filtros.estadoConservacao}
                  onValueChange={(value) => handleFiltroChange('estadoConservacao', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os estados</SelectItem>
                    <SelectItem value="novo">Novo</SelectItem>
                    <SelectItem value="usado_como_novo">Usado como novo</SelectItem>
                    <SelectItem value="usado_bom">Usado - bom estado</SelectItem>
                    <SelectItem value="usado_regular">Usado - estado regular</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={ordenacao}
                  onValueChange={(value: string) => setOrdenacao(value as 'recentes' | 'preco_menor' | 'preco_maior' | 'distancia')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recentes">Mais recentes</SelectItem>
                    <SelectItem value="preco_menor">Menor preço</SelectItem>
                    <SelectItem value="preco_maior">Maior preço</SelectItem>
                    <SelectItem value="distancia">Mais próximos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Slider de preço */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Faixa de Preço: {filtros.precoMin} - {filtros.precoMax} Girinhas
                </label>
                <div className="px-2">
                  <Slider
                    value={[filtros.precoMin, filtros.precoMax]}
                    onValueChange={([min, max]) => {
                      handleFiltroChange('precoMin', min);
                      handleFiltroChange('precoMax', max);
                    }}
                    max={1000}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={limparFiltros} variant="outline" size="sm">
                  Limpar Filtros
                </Button>
                <Button onClick={() => setShowFiltros(false)} size="sm">
                  Aplicar
                </Button>
              </div>
            </div>
          )}

          {/* Grid de Itens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              <ItemCardSkeleton count={8} />
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <div className="text-red-500 mb-4">
                  <p className="text-lg font-semibold">Erro ao carregar itens</p>
                  <p className="text-sm">{error.message}</p>
                </div>
                <Button onClick={() => window.location.reload()}>
                  Tentar novamente
                </Button>
              </div>
            ) : !itens || (Array.isArray(itens) && itens.length === 0) ? (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Nenhum item encontrado
                </h3>
                <p className="text-gray-600 mb-4">
                  Tente ajustar os filtros ou buscar por outros termos.
                </p>
                <Button onClick={limparFiltros} variant="outline">
                  Limpar filtros
                </Button>
              </div>
            ) : (
              Array.isArray(itens) && itens.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))
            )}
          </div>

          {/* Botão Carregar Mais */}
          {hasNextPage && (
            <div className="text-center mt-8">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetching}
                variant="outline"
                size="lg"
              >
                {isFetching ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Carregando...
                  </>
                ) : (
                  'Carregar mais itens'
                )}
              </Button>
            </div>
          )}
        </main>

        {/* Botão Flutuante para Publicar */}
        <Button
          onClick={() => navigate('/publicar')}
          size="lg"
          className="fixed bottom-20 right-4 rounded-full w-14 h-14 shadow-xl bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 z-40"
        >
          <Plus className="w-6 h-6" />
        </Button>

        <QuickNav />
      </div>
    </AuthGuard>
  );
};

export default FeedOptimized;
