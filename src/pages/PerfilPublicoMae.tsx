// src/pages/PerfilPublicoMae.tsx - CORREÇÃO DOS ERROS DE RENDERIZAÇÃO
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { analytics } from '@/lib/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';
import ItemCardSkeleton from '@/components/loading/ItemCardSkeleton';
import EmptyState from '@/components/loading/EmptyState';
import { ItemCard } from '@/components/shared/ItemCard';
import MaeSeguidaCard from '@/components/shared/MaeSeguidaCard';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { useTiposTamanho } from '@/hooks/useTamanhosPorCategoria';
import { useToast } from '@/hooks/use-toast';
import { useFeedPerfilEspecifico } from '@/hooks/useFeedPerfilEspecifico';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import InfiniteScrollIndicator from '@/components/loading/InfiniteScrollIndicator';
import { supabase } from '@/integrations/supabase/client';
import { useConfigSistema } from '@/hooks/useConfigSistema';
import { 
  MapPin, 
  Users, 
  Package, 
  Calendar,
  Star,
  ArrowLeft,
  Search,
  Filter
} from 'lucide-react';

const PerfilPublicoMae = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [errorProfile, setErrorProfile] = useState<string | null>(null);

  // ✅ ESTADOS DE FILTROS
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('todas');
  const [subcategoria, setSubcategoria] = useState('todas');
  const [genero, setGenero] = useState('todos');
  const [tamanho, setTamanho] = useState('todos');
  const [precoRange, setPrecoRange] = useState([0, 200]);
  const [mostrarFiltrosAvancados, setMostrarFiltrosAvancados] = useState(false);
  const [mostrarReservados, setMostrarReservados] = useState(true);
  const [actionStates, setActionStates] = useState<Record<string, 'loading' | 'success' | 'error' | 'idle'>>({});

  // ✅ HOOKS
  const { tiposTamanho, isLoading: loadingTamanhos } = useTiposTamanho(categoria === 'todas' ? '' : categoria);
  const debouncedBusca = useDebounce(busca, 500);
  
  const {
    data: paginasFeed,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loadingFeed,
    refetch
  } = useFeedPerfilEspecifico(user?.id || '', {
    busca: debouncedBusca,
    categoria: categoria === 'todas' ? undefined : categoria,
    subcategoria: subcategoria === 'todas' ? undefined : subcategoria,
    genero: genero === 'todos' ? undefined : genero,
    tamanho: tamanho === 'todos' ? undefined : tamanho,
    precoMin: precoRange[0],
    precoMax: precoRange[1],
    mostrarReservados,
    targetUserId: id
  });
  
  // ✅ EXTRAIR DADOS
  const itens = useMemo(() => {
    return paginasFeed?.pages?.flatMap(page => page?.itens || []) || [];
  }, [paginasFeed]);

  const { taxaTransacao } = useConfigSistema();
  
  // ✅ DADOS CONSOLIDADOS
  const feedData = useMemo(() => {
    const primeiraPagina = paginasFeed?.pages?.[0];
    return {
      favoritos: primeiraPagina?.favoritos || [],
      reservas_usuario: primeiraPagina?.reservas_usuario || [],
      filas_espera: primeiraPagina?.filas_espera || {},
      configuracoes: primeiraPagina?.configuracoes,
      profile_essencial: primeiraPagina?.profile_essencial,
      taxaTransacao: taxaTransacao
    };
  }, [paginasFeed, taxaTransacao]);
  
  const categorias = useMemo(() => feedData.configuracoes?.categorias || [], [feedData.configuracoes]);
  const todasSubcategorias = useMemo(() => feedData.configuracoes?.subcategorias || [], [feedData.configuracoes]);
  
  // ✅ CORREÇÃO 1: MEMOIZAR subcategoriasFiltradas com useMemo
  const subcategoriasFiltradas = useMemo(() => {
    if (!Array.isArray(todasSubcategorias) || categoria === 'todas') return [];
    
    const filtradas = todasSubcategorias.filter(sub => sub.categoria_pai === categoria);
    const subcategoriasUnicas = filtradas.reduce((acc, sub) => {
      if (!acc.some(item => item.nome === sub.nome)) {
        acc.push(sub);
      }
      return acc;
    }, [] as typeof filtradas);
    
    return subcategoriasUnicas;
  }, [todasSubcategorias, categoria]);

  // ✅ CORREÇÃO 2: MEMOIZAR tamanhosDisponiveis com useMemo
  const tamanhosDisponiveis = useMemo(() => {
    if (!tiposTamanho || typeof tiposTamanho !== 'object') return [];
    
    const tipos = Object.keys(tiposTamanho);
    const tipoUnico = tipos[0];
    const tamanhos = tipoUnico ? (tiposTamanho[tipoUnico] || []) : [];
    
    const tamanhosUnicos = tamanhos.reduce((acc, tamanho) => {
      if (!acc.some(item => item.valor === tamanho.valor)) {
        acc.push(tamanho);
      }
      return acc;
    }, [] as typeof tamanhos);
    
    return tamanhosUnicos;
  }, [tiposTamanho]);

  // ✅ CORREÇÃO 3: Reset automático de subcategoria e tamanho quando categoria muda
  useEffect(() => {
    setSubcategoria('todas');
    setTamanho('todos');
  }, [categoria]);

  // ✅ FILTRAR ITENS
  const itensFiltrados = useMemo(() => {
    return mostrarReservados 
      ? itens 
      : itens.filter(item => item.status === 'disponivel');
  }, [itens, mostrarReservados]);

  // ✅ SCROLL INFINITO
  const { ref: infiniteRef } = useInfiniteScroll({
    loading: isFetchingNextPage,
    hasNextPage: hasNextPage || false,
    onLoadMore: fetchNextPage,
    disabled: !hasNextPage,
    rootMargin: '100px',
  });

  // ✅ Carregar perfil separadamente
  useEffect(() => {
    const carregarPerfil = async () => {
      if (!id) return;
      
      try {
        setLoadingProfile(true);
        setErrorProfile(null);
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (profileError) {
          console.error('Erro ao buscar perfil:', profileError);
          setErrorProfile('Perfil não encontrado');
          return;
        }

        setProfile(profileData);
        
        // ✅ ANALYTICS: Visualização de perfil
        analytics.social.viewProfile(id);
        
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        setErrorProfile('Erro ao carregar perfil');
      } finally {
        setLoadingProfile(false);
      }
    };

    carregarPerfil();
  }, [id]);

  const handleItemClick = useCallback((itemId: string) => {
    navigate(`/item/${itemId}`);
  }, [navigate]);

  const entrarNaFila = async (itemId: string) => {
    if (!user) return;
    
    setActionStates(prev => ({ ...prev, [itemId]: 'loading' }));
    
    try {
      const { data, error } = await supabase
        .rpc('entrar_fila_espera', { 
          p_item_id: itemId, 
          p_usuario_id: user.id 
        });

      if (error) {
        toast({ 
          title: "Erro ao reservar", 
          description: error.message, 
          variant: "destructive" 
        });
        setActionStates(prev => ({ ...prev, [itemId]: 'error' }));
        return false;
      }

      const result = data as { tipo?: string; posicao?: number } | null;
      
      if (result?.tipo === 'reserva_direta') {
        toast({ 
          title: "Item reservado! 🎉", 
          description: "As Girinhas foram bloqueadas. Use o código de confirmação na entrega." 
        });
      } else if (result?.tipo === 'fila_espera') {
        toast({ 
          title: "Entrou na fila! 📝", 
          description: `Você está na posição ${result.posicao} da fila. As Girinhas NÃO foram bloqueadas ainda.` 
        });
      }
      
      setActionStates(prev => ({ ...prev, [itemId]: 'success' }));
      setTimeout(() => {
        setActionStates(prev => ({ ...prev, [itemId]: 'idle' }));
      }, 2000);
      
      await refetch();
      return true;
    } catch (err) {
      console.error('Erro ao entrar na fila:', err);
      toast({ 
        title: "Erro ao entrar na fila", 
        description: err instanceof Error ? err.message : "Tente novamente.", 
        variant: "destructive" 
      });
      setActionStates(prev => ({ ...prev, [itemId]: 'error' }));
      setTimeout(() => {
        setActionStates(prev => ({ ...prev, [itemId]: 'idle' }));
      }, 2000);
      return false;
    }
  };

  const toggleFavorito = async (itemId: string) => {
    if (!user) return;
    
    const isFavorito = feedData.favoritos.includes(itemId);
    
    try {
      if (isFavorito) {
        const { error } = await supabase
          .from('favoritos')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', itemId);

        if (error) throw error;

        toast({
          title: "Removido dos favoritos",
          description: "Item removido da sua lista de desejos.",
        });
      } else {
        const { error } = await supabase
          .from('favoritos')
          .insert({
            user_id: user.id,
            item_id: itemId
          });

        if (error) throw error;

        toast({
          title: "Adicionado aos favoritos! ❤️",
          description: "Item adicionado à sua lista de desejos.",
        });
      }
      
      await refetch();
    } catch (error) {
      console.error('Erro ao toggle favorito:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os favoritos.",
        variant: "destructive",
      });
    }
  };

  const handleReservarItem = async (itemId: string) => {
    try {
      await entrarNaFila(itemId);
    } catch (error) {
      console.error('Erro ao reservar item:', error);
    }
  };

  const handleEntrarFila = async (itemId: string) => {
    try {
      await entrarNaFila(itemId);
    } catch (error) {
      console.error('Erro ao entrar na fila:', error);
    }
  };

  const handleToggleFavorito = async (itemId: string) => {
    try {
      await toggleFavorito(itemId);
    } catch (error) {
      console.error('Erro ao toggle favorito:', error);
    }
  };

  const handleAplicarFiltros = () => {
    refetch();
  };

  const handleLimparFiltros = () => {
    setBusca('');
    setCategoria('todas');
    setSubcategoria('todas');
    setGenero('todos');
    setTamanho('todos');
    setPrecoRange([0, 200]);
    setMostrarReservados(true);
    setMostrarFiltrosAvancados(false);
    refetch();
  };

  const toggleFiltrosAvancados = () => {
    setMostrarFiltrosAvancados(!mostrarFiltrosAvancados);
  };

  // ✅ CORREÇÃO 4: handleCategoriaChange agora só muda a categoria, os resets são automáticos via useEffect
  const handleCategoriaChange = (novaCategoria: string) => {
    setCategoria(novaCategoria);
  };

  const handleTamanhoChange = (valor: string) => {
    setTamanho(valor);
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando perfil...</p>
          </div>
        </main>
        <QuickNav />
      </div>
    );
  }

  if (errorProfile || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Perfil não encontrado</h2>
              <p className="text-gray-600 mb-6">{errorProfile || 'O perfil que você está procurando não existe.'}</p>
              <Button onClick={() => navigate('/feed')}>
                Voltar ao Feed
              </Button>
            </CardContent>
          </Card>
        </main>
        <QuickNav />
      </div>
    );
  }

  const nomeCompleto = profile.sobrenome ? `${profile.nome} ${profile.sobrenome}` : profile.nome;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-24">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-purple-600 hover:text-purple-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <MaeSeguidaCard
                mae={{
                  id: profile.id,
                  nome: profile.nome || 'Usuário',
                  sobrenome: profile.sobrenome,
                  avatar_url: profile.avatar_url,
                  bio: profile.bio,
                  cidade: profile.cidade,
                  estado: profile.estado,
                  bairro: profile.bairro,
                  data_nascimento: profile.data_nascimento,
                  reputacao: profile.reputacao || 0,
                  interesses: profile.interesses || [],
                  created_at: profile.created_at,
                  last_seen_at: profile.ultima_atividade,
                  aceita_entrega_domicilio: profile.aceita_entrega_domicilio || false,
                  raio_entrega_km: profile.raio_entrega_km,
                  estatisticas: {
                    total_itens: itensFiltrados.length,
                    itens_ativos: itensFiltrados.filter(item => item.status === 'disponivel').length,
                    itens_disponiveis: itensFiltrados.filter(item => item.status === 'disponivel').length,
                    total_seguidores: 0,
                    total_seguindo: 0,
                    avaliacoes_recebidas: 0,
                    media_avaliacao: (profile.reputacao || 0) / 20,
                    ultima_atividade: profile.ultima_atividade,
                    membro_desde: profile.created_at,
                    distancia_km: undefined
                  },
                  itens_recentes: itensFiltrados.slice(0, 4).map(item => ({
                    id: item.id,
                    titulo: item.titulo,
                    categoria: item.categoria,
                    valor_girinhas: item.valor_girinhas,
                    fotos: item.fotos || [],
                    status: item.status,
                    created_at: item.created_at
                  })),
                  escola_comum: false,
                  logistica: {
                    entrega_disponivel: profile.aceita_entrega_domicilio || false,
                    busca_disponivel: true
                  }
                }}
                showViewProfileButton={false}
                showFollowButton={true}
                showUnfollowButton={false}
                onViewProfile={() => {}}
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Busque nos itens deste usuário..."
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

              {mostrarFiltrosAvancados && (
                <div className="space-y-6 border-t pt-4">
                  <div>
                    <h3 className="font-medium mb-3 text-gray-700 uppercase text-sm tracking-wide">OPÇÕES DE VISUALIZAÇÃO</h3>
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Label htmlFor="mostrar-reservados" className="text-sm font-medium">
                          Mostrar itens reservados
                        </Label>
                        <Switch
                          id="mostrar-reservados"
                          checked={mostrarReservados}
                          onCheckedChange={setMostrarReservados}
                        />
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        {itensFiltrados.length} itens
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-3 text-gray-700 uppercase text-sm tracking-wide">CATEGORIA</h3>
                      <Select value={categoria} onValueChange={handleCategoriaChange}>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200 rounded-lg shadow-lg max-h-60 z-50">
                          <SelectItem value="todas">Todas</SelectItem>
                          {categorias.map((cat) => (
                            <SelectItem key={cat.codigo} value={cat.codigo}>
                              <span className="flex items-center gap-2">
                                <span className="text-sm">{cat.icone}</span>
                                {cat.nome}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <h3 className="font-medium mb-3 text-gray-700 uppercase text-sm tracking-wide">SUBCATEGORIA</h3>
                      <Select 
                        value={subcategoria} 
                        onValueChange={setSubcategoria}
                        disabled={categoria === 'todas'}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200 rounded-lg shadow-lg max-h-60 z-50">
                          <SelectItem value="todas">Todas</SelectItem>
                          {subcategoriasFiltradas.length === 0 ? (
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

                  <div>
                    <h3 className="font-medium mb-3 text-gray-700 uppercase text-sm tracking-wide">
                      PREÇO: {precoRange[0]} - {precoRange[1]} G
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

            {loadingFeed && itensFiltrados.length === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <ItemCardSkeleton key={i} />
                ))}
              </div>
            )}

            {!loadingFeed && itensFiltrados.length === 0 && (
              <EmptyState
                type="search"
                title="Nenhum item encontrado"
                description={
                  !mostrarReservados 
                    ? "Tente incluir itens reservados ou ajustar os filtros"
                    : "Este usuário não tem itens que correspondam aos filtros aplicados"
                }
                actionLabel="Limpar filtros"
                onAction={handleLimparFiltros}
              />
            )}

            {itensFiltrados.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {itensFiltrados.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      feedData={feedData}
                      currentUserId={user?.id || ''}
                      taxaTransacao={feedData.taxaTransacao}
                      onItemClick={handleItemClick}
                      showActions={true}
                      onToggleFavorito={() => handleToggleFavorito(item.id)}
                      onReservar={() => handleReservarItem(item.id)}
                      onEntrarFila={() => handleEntrarFila(item.id)}
                      actionState={actionStates[item.id]}
                    />
                  ))}
                </div>

                {hasNextPage && (
                  <div ref={infiniteRef}>
                    <InfiniteScrollIndicator 
                      isFetchingNextPage={isFetchingNextPage}
                      hasNextPage={hasNextPage || false}
                      itemsCount={itensFiltrados.length}
                      isInitialLoading={loadingFeed}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      
      <QuickNav />
    </div>
  );
};

export default PerfilPublicoMae;
