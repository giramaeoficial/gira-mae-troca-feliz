// src/pages/MaesSeguidas.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import EmptyState from '@/components/loading/EmptyState';
import FriendlyError from '@/components/error/FriendlyError';
import MaeSeguidaCard from '@/components/shared/MaeSeguidaCard';
import { useSeguidores } from '@/hooks/useSeguidores';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { 
  Package, 
  Heart,
  ArrowLeft,
  RefreshCw,
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

      const resultado = data as unknown as RespostaAPI;
      
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
        throw new Error('Erro ao carregar dados');
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
          <LoadingSpinner />
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
          type="connection"
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
            type="search"
            title="Nenhuma mãe seguida"
            description="Você ainda não segue nenhuma mãe. Explore perfis e comece a seguir outras mamães!"
            actionLabel="Explorar Feed"
            onAction={() => navigate('/feed')}
          />
        ) : (
          <>
            {/* Grid responsivo para desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {seguindo.map((item) => {
                const mae = item.profiles;
                if (!mae) return null;

                return (
                  <MaeSeguidaCard
                    key={mae.id}
                    mae={mae}
                    onUnfollow={handleUnfollow}
                    onViewProfile={handleViewProfile}
                  />
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