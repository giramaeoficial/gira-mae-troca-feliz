// src/pages/MaesSeguidas.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import EmptyState from '@/components/loading/EmptyState';
import FriendlyError from '@/components/error/FriendlyError';
import { useSeguidores } from '@/hooks/useSeguidores';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  MapPin, 
  Package, 
  UserX, 
  Eye, 
  Star, 
  Clock, 
  Heart,
  MessageCircle,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';

const MaesSeguidas = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { buscarSeguindo, deixarDeSeguir, buscarEstatisticas } = useSeguidores();
  const isMobile = useIsMobile();
  
  const [seguindo, setSeguindo] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  // ✅ CORREÇÃO: Removido buscarSeguindo das dependências
  React.useEffect(() => {
    const carregarSeguindo = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        const dados = await buscarSeguindo();
        
        // Enriquecer dados com informações adicionais
        const dadosEnriquecidos = await Promise.all(
          dados.map(async (item) => {
            const mae = item.profiles;
            if (!mae) return item;
            
            try {
              // Buscar estatísticas adicionais se disponível
              const stats = await buscarEstatisticas?.(mae.id);
              return {
                ...item,
                profiles: {
                  ...mae,
                  estatisticas: stats || {
                    total_itens: 0,
                    itens_ativos: 0,
                    ultima_atividade: null,
                    avaliacoes_recebidas: 0,
                    media_avaliacao: 0
                  }
                }
              };
            } catch (err) {
              console.log('Erro ao buscar estatísticas para:', mae.id);
              return item;
            }
          })
        );
        
        setSeguindo(dadosEnriquecidos);
      } catch (err) {
        console.error('Erro ao carregar mães seguidas:', err);
        setError('Não foi possível carregar as mães seguidas');
      } finally {
        setLoading(false);
      }
    };

    carregarSeguindo();
  }, [user?.id, buscarEstatisticas]); // ✅ APENAS user?.id nas dependências

  const handleUnfollow = async (maeId: string) => {
    try {
      const sucesso = await deixarDeSeguir(maeId);
      if (sucesso) {
        setSeguindo(prev => prev.filter(mae => mae.profiles?.id !== maeId));
      }
    } catch (err) {
      console.error('Erro ao deixar de seguir:', err);
    }
  };

  const handleViewProfile = (maeId: string) => {
    navigate(`/perfil/${maeId}`);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      const dados = await buscarSeguindo();
      setSeguindo(dados);
    } catch (err) {
      console.error('Erro ao recarregar:', err);
      setError('Não foi possível recarregar as mães seguidas');
    } finally {
      setRefreshing(false);
    }
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
      
      <div className="px-4 pt-4">
        {/* Header Mobile First */}
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
            <h1 className="text-2xl font-bold text-purple-800 mb-2">
              Mães Seguidas
            </h1>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline" className="text-purple-700">
                {seguindo.length} {seguindo.length === 1 ? 'mãe' : 'mães'}
              </Badge>
              {seguindo.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <Heart className="w-3 h-3 mr-1" />
                  Seguindo
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
          <div className="space-y-4">
            {seguindo.map((item) => {
              const mae = item.profiles;
              if (!mae) return null;

              const stats = mae.estatisticas || {};

              return (
                <Card key={mae.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    {/* Layout Mobile: Vertical Stack */}
                    <div className="space-y-4">
                      {/* Header com Avatar e Nome */}
                      <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
                          <AvatarImage 
                            src={mae.avatar_url || ''} 
                            alt={mae.nome || 'Mãe'}
                          />
                          <AvatarFallback className="bg-purple-100 text-purple-600 text-xl">
                            {mae.nome?.charAt(0).toUpperCase() || 'M'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-gray-900 truncate">
                            {mae.nome || 'Nome não informado'}
                          </h3>
                          
                          {/* Avaliação */}
                          {stats.media_avaliacao > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-gray-600">
                                {stats.media_avaliacao.toFixed(1)}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({stats.avaliacoes_recebidas} avaliações)
                              </span>
                            </div>
                          )}
                          
                          {/* Última atividade */}
                          {stats.ultima_atividade && (
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {formatLastActivity(stats.ultima_atividade)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Informações adicionais */}
                      <div className="space-y-2">
                        {/* Localização */}
                        {(mae.cidade || mae.bairro) && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-purple-500" />
                            <span className="truncate">
                              {[mae.bairro, mae.cidade].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                        
                        {/* Itens disponíveis */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Package className="w-4 h-4 text-green-500" />
                          <span>
                            {stats.itens_ativos || 0} itens disponíveis
                          </span>
                          <span className="text-xs text-gray-400">
                            ({stats.total_itens || 0} total)
                          </span>
                        </div>
                        
                        {/* Bio */}
                        {mae.bio && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {mae.bio}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Badges de informações */}
                      <div className="flex flex-wrap gap-2">
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
                      </div>

                      <Separator />

                      {/* Botões de ação - Mobile First */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewProfile(mae.id)}
                          className="flex-1 text-purple-600 border-purple-600 hover:bg-purple-50"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Perfil
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnfollow(mae.id)}
                          className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          Deixar de Seguir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <QuickNav />
    </div>
  );
};

export default MaesSeguidas;
