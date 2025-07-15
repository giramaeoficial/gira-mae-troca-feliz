// src/pages/MaesSeguidas.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import EmptyState from '@/components/loading/EmptyState';
import FriendlyError from '@/components/error/FriendlyError';
import { useSeguidores } from '@/hooks/useSeguidores';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { 
  MapPin, 
  Package, 
  UserX, 
  Eye, 
  Star, 
  Clock, 
  Heart,
  ArrowLeft,
  RefreshCw,
  Users,
  Calendar,
  Truck,
  User,
  TrendingUp,
  Loader
} from 'lucide-react';

interface MaeSeguida {
  id: string;
  seguidor_id: string;
  seguido_id: string;
  created_at: string;
  profiles: {
    id: string;
    nome: string;
    sobrenome?: string;
    avatar_url?: string;
    bio?: string;
    cidade?: string;
    estado?: string;
    bairro?: string;
    data_nascimento?: string;
    reputacao: number;
    interesses?: string[];
    created_at: string;
    last_seen_at?: string;
    aceita_entrega_domicilio: boolean;
    raio_entrega_km?: number;
    estatisticas: {
      total_itens: number;
      itens_ativos: number;
      itens_disponiveis: number;
      total_seguidores: number;
      total_seguindo: number;
      avaliacoes_recebidas: number;
      media_avaliacao: number;
      ultima_atividade?: string;
      membro_desde: string;
      distancia_km?: number;
    };
    itens_recentes: Array<{
      id: string;
      titulo: string;
      categoria: string;
      valor_girinhas: number;
      fotos: string[];
      status: string;
      created_at: string;
    }>;
    escola_comum: boolean;
    logistica: {
      entrega_disponivel: boolean;
      busca_disponivel: boolean;
    };
  };
}

interface RespostaAPI {
  success: boolean;
  page: number;
  limit: number;
  total_seguindo: number;
  data: MaeSeguida[];
  has_more: boolean;
  total_count: number;
}

const MaesSeguidas = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { deixarDeSeguir } = useSeguidores();
  const isMobile = useIsMobile();
  
  const [seguindo, setSeguindo] = React.useState<MaeSeguida[]>([]);
  const [totalSeguindo, setTotalSeguindo] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  
  // ✅ Estados para scroll infinito
  const [page, setPage] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  
  // ✅ Ref para o elemento de scroll infinito
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  // ✅ Hook personalizado para intersection observer (sem dependência externa)
  const useInfiniteScroll = (callback: () => void, deps: any[]) => {
    React.useEffect(() => {
      const element = loadMoreRef.current;
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          const target = entries[0];
          if (target.isIntersecting && hasMore && !loadingMore && !loading) {
            callback();
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(element);

      return () => {
        observer.unobserve(element);
      };
    }, deps);
  };

  // ✅ Função para buscar dados usando a RPC function paginada
  const carregarMaesSeguidas = React.useCallback(async (pageNum: number = 0, reset: boolean = false) => {
    if (!user?.id) return;
    
    try {
      if (pageNum === 0) setError(null);
      if (pageNum > 0) setLoadingMore(true);
      
      const { data, error } = await supabase
        .rpc('carregar_maes_seguidas_paginado', { 
          p_user_id: user.id,
          p_page: pageNum,
          p_limit: 20 
        });

      if (error) throw error;

      const resultado = data as RespostaAPI;
      
      if (resultado.success) {
        if (reset || pageNum === 0) {
          // Reset completo ou primeira página
          setSeguindo(resultado.data || []);
        } else {
          // Adicionar à lista existente
          setSeguindo(prev => [...prev, ...(resultado.data || [])]);
        }
        
        setTotalSeguindo(resultado.total_seguindo || 0);
        setHasMore(resultado.has_more || false);
        setPage(pageNum);
      } else {
        throw new Error(resultado.message || 'Erro ao carregar dados');
      }
    } catch (err) {
      console.error('Erro ao carregar mães seguidas:', err);
      if (pageNum === 0) {
        setError(err instanceof Error ? err.message : 'Não foi possível carregar as mães seguidas');
      }
    } finally {
      if (pageNum > 0) setLoadingMore(false);
    }
  }, [user?.id]);

  // ✅ Carregamento inicial
  React.useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      await carregarMaesSeguidas(0, true);
      setLoading(false);
    };

    carregarDados();
  }, [carregarMaesSeguidas]);

  // ✅ Configurar scroll infinito
  useInfiniteScroll(() => {
    carregarMaesSeguidas(page + 1);
  }, [page, hasMore, loadingMore, loading]);

  const handleUnfollow = async (maeId: string) => {
    try {
      const sucesso = await deixarDeSeguir(maeId);
      if (sucesso) {
        setSeguindo(prev => prev.filter(mae => mae.profiles?.id !== maeId));
        setTotalSeguindo(prev => prev - 1);
      }
    } catch (err) {
      console.error('Erro ao deixar de seguir:', err);
    }
  };

  const handleViewProfile = (maeId: string) => {
    navigate(`/perfil/${maeId}`);
  };

  // ✅ Refresh completo
  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(0);
    setHasMore(true);
    await carregarMaesSeguidas(0, true);
    setRefreshing(false);
  };

  const formatLastActivity = (timestamp: string | null) => {
    if (!timestamp) return 'Nunca vista';
    
    const now = new Date();
    const activity = new Date(timestamp);
    const diffMs = now.getTime() - activity.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Ativa hoje';
    if (diffDays === 1) return 'Ativa ontem';
    if (diffDays < 7) return `Ativa há ${diffDays} dias`;
    if (diffDays < 30) return `Ativa há ${Math.floor(diffDays / 7)} semanas`;
    return `Ativa há ${Math.floor(diffDays / 30)} meses`;
  };

  const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const formatarNomeCompleto = (nome?: string, sobrenome?: string) => {
    if (!nome) return 'Usuário';
    return sobrenome ? `${nome} ${sobrenome}` : nome;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-24">
        <Header />
        <FriendlyError 
          type="permission"
          title="Acesso Restrito"
          message="Você precisa estar logado para ver suas mães seguidas."
          onRetry={() => navigate('/login')}
        />
        <QuickNav />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-24">
        <Header />
        <div className="px-4 pt-4">
          <LoadingSpinner message="Carregando mães seguidas..." />
        </div>
        <QuickNav />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-24">
        <Header />
        <FriendlyError 
          type="network"
          title="Erro ao Carregar"
          message={error}
          onRetry={handleRefresh}
        />
        <QuickNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-24">
      <Header />
      
      {/* Container responsivo */}
      <div className="px-4 md:px-6 lg:px-8 pt-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-purple-600 hover:text-purple-700 p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-purple-600 hover:text-purple-700 p-2"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <div className="text-center mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-purple-800 mb-2">
              Mães Seguidas
            </h1>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline" className="text-purple-700">
                {totalSeguindo} {totalSeguindo === 1 ? 'mãe' : 'mães'}
              </Badge>
              {totalSeguindo > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <Heart className="w-3 h-3 mr-1" />
                  Seguindo
                </Badge>
              )}
              {seguindo.length > 0 && seguindo.length < totalSeguindo && (
                <Badge variant="outline" className="text-xs">
                  Mostrando {seguindo.length} de {totalSeguindo}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {seguindo.length === 0 ? (
          <EmptyState
            icon={<Package className="w-16 h-16 text-purple-400" />}
            title="Nenhuma mãe seguida"
            description="Você ainda não segue nenhuma mãe. Explore perfis e comece a seguir outras mamães!"
            action={
              <Button 
                onClick={() => navigate('/feed')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Explorar Feed
              </Button>
            }
          />
        ) : (
          <>
            {/* Grid responsivo para desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {seguindo.map((item) => {
                const mae = item.profiles;
                if (!mae) return null;

                const stats = mae.estatisticas;
                const nomeCompleto = formatarNomeCompleto(mae.nome, mae.sobrenome);

                return (
                  <Card key={mae.id} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-200 hover:scale-[1.02] overflow-hidden">
                    <CardHeader className="text-center pb-4 relative">
                      {/* Badges de destaque */}
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        {mae.escola_comum && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            🏫 Mesma escola
                          </Badge>
                        )}
                        {mae.logistica.entrega_disponivel && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            <Truck className="w-3 h-3 mr-1" />
                            Entrega
                          </Badge>
                        )}
                        {stats.distancia_km && stats.distancia_km <= 5 && (
                          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                            📍 {stats.distancia_km}km
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-col items-center">
                        <Avatar className="w-20 h-20 mb-4 border-2 border-purple-200">
                          <AvatarImage src={mae.avatar_url || undefined} alt={nomeCompleto} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                            {mae.nome?.split(' ').map(n => n[0]).join('') || 'M'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
                          {nomeCompleto}
                        </h3>
                        
                        {/* Avaliação */}
                        <div className="flex items-center gap-1 mb-4">
                          {[1,2,3,4,5].map((star) => (
                            <Star 
                              key={star} 
                              className={`w-4 h-4 ${
                                star <= Math.floor(stats.media_avaliacao || 0) 
                                  ? 'fill-current text-yellow-500' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-1">
                            ({(stats.media_avaliacao || 0).toFixed(1)})
                          </span>
                          {stats.avaliacoes_recebidas > 0 && (
                            <span className="text-xs text-gray-500">
                              · {stats.avaliacoes_recebidas} avaliações
                            </span>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Bio */}
                      {mae.bio && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2 text-sm">Sobre</h4>
                          <p className="text-gray-600 text-sm line-clamp-2">{mae.bio}</p>
                        </div>
                      )}

                      {/* Informações básicas */}
                      <div className="space-y-2">
                        {/* Localização */}
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-sm">
                            {mae.cidade 
                              ? `${mae.cidade}, ${mae.estado || 'BR'}`
                              : 'Localização não informada'
                            }
                          </span>
                        </div>

                        {/* Idade */}
                        {mae.data_nascimento && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="text-sm">{calcularIdade(mae.data_nascimento)} anos</span>
                          </div>
                        )}

                        {/* Última atividade */}
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm">
                            {formatLastActivity(stats.ultima_atividade)}
                          </span>
                        </div>
                      </div>

                      {/* Estatísticas em grid 2x2 */}
                      <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-600">
                            <Users className="w-4 h-4" />
                            <span className="font-bold">{stats.total_seguidores}</span>
                          </div>
                          <p className="text-xs text-gray-500">Seguidores</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-600">
                            <Package className="w-4 h-4" />
                            <span className="font-bold">{stats.itens_disponiveis}</span>
                          </div>
                          <p className="text-xs text-gray-500">Disponíveis</p>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-600">
                            <TrendingUp className="w-4 h-4" />
                            <span className="font-bold">{stats.total_itens}</span>
                          </div>
                          <p className="text-xs text-gray-500">Total itens</p>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-600">
                            <User className="w-4 h-4" />
                            <span className="font-bold">{stats.total_seguindo}</span>
                          </div>
                          <p className="text-xs text-gray-500">Seguindo</p>
                        </div>
                      </div>

                      {/* Itens recentes preview */}
                      {mae.itens_recentes && mae.itens_recentes.length > 0 && (
                        <div className="pt-4 border-t">
                          <h4 className="font-semibold text-gray-800 mb-2 text-sm">Itens recentes</h4>
                          <div className="flex gap-2 overflow-x-auto">
                            {mae.itens_recentes.slice(0, 3).map((item) => (
                              <div key={item.id} className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                {item.fotos[0] ? (
                                  <img 
                                    src={item.fotos[0]} 
                                    alt={item.titulo}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {mae.itens_recentes.length} {mae.itens_recentes.length === 1 ? 'item' : 'itens'} recentes
                          </p>
                        </div>
                      )}

                      {/* Badges informativos */}
                      <div className="flex flex-wrap gap-2 justify-center pt-2">
                        {mae.reputacao && mae.reputacao > 0 && (
                          <Badge variant="outline" className="text-xs">
                            ⭐ {mae.reputacao} pontos
                          </Badge>
                        )}
                        
                        {mae.interesses && mae.interesses.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            💝 {mae.interesses.length} interesses
                          </Badge>
                        )}

                        {mae.aceita_entrega_domicilio && (
                          <Badge variant="outline" className="text-xs">
                            🚚 Entrega domicílio
                          </Badge>
                        )}
                      </div>

                      {/* Botões de ação */}
                      <div className="flex gap-2 pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewProfile(mae.id)}
                          className="flex-1 text-purple-600 border-purple-600 hover:bg-purple-50 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Perfil
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnfollow(mae.id)}
                          className="flex-1 text-red-600 border-red-600 hover:bg-red-50 transition-colors"
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          Deixar de Seguir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* ✅ Loading indicator para scroll infinito */}
            {hasMore && (
              <div 
                ref={loadMoreRef}
                className="flex justify-center items-center py-8"
              >
                {loadingMore && (
                  <div className="flex items-center gap-2 text-purple-600">
                    <Loader className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Carregando mais mães...</span>
                  </div>
                )}
              </div>
            )}

            {/* ✅ Indicador de fim da lista */}
            {!hasMore && seguindo.length > 0 && (
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-gray-600 text-sm">
                  <Heart className="w-4 h-4" />
                  Você viu todas as {totalSeguindo} mães que segue
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <QuickNav />
    </div>
  );
};

export default MaesSeguidas;
