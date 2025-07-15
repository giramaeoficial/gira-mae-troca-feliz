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
  RefreshCw,
  Baby,
  Calendar,
  TrendingUp,
  Users
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
                    ultimo_item_postado: null,
                    avaliacoes_recebidas: 0,
                    media_avaliacao: 0,
                    total_trocas: 0,
                    membro_desde: mae.created_at
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
  }, [user?.id, buscarEstatisticas]);

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

  const formatDatePosted = (timestamp: string | null) => {
    if (!timestamp) return 'Nenhum item postado';
    
    const now = new Date();
    const posted = new Date(timestamp);
    const diffMs = now.getTime() - posted.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Postou hoje';
    if (diffDays === 1) return 'Postou ontem';
    if (diffDays < 7) return `Postou há ${diffDays} dias`;
    if (diffDays < 30) return `Postou há ${Math.floor(diffDays / 7)} semanas`;
    return `Postou há ${Math.floor(diffDays / 30)} meses`;
  };

  const formatMemberSince = (timestamp: string | null) => {
    if (!timestamp) return '';
    
    const memberDate = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - memberDate.getTime();
    const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
    
    if (diffMonths < 1) return 'Nova no app';
    if (diffMonths < 12) return `${diffMonths} meses no app`;
    const years = Math.floor(diffMonths / 12);
    return `${years} ${years === 1 ? 'ano' : 'anos'} no app`;
  };

  const getChildrenAgesText = (filhos: any[]) => {
    if (!filhos || filhos.length === 0) return 'Sem filhos cadastrados';
    
    const ages = filhos.map(filho => {
      if (!filho.data_nascimento) return null;
      const birth = new Date(filho.data_nascimento);
      const now = new Date();
      const ageMonths = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30));
      
      if (ageMonths < 12) return `${ageMonths}m`;
      const years = Math.floor(ageMonths / 12);
      return `${years}a`;
    }).filter(Boolean);
    
    return ages.length > 0 ? ages.join(', ') : 'Idades não informadas';
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
          /* Grid responsivo para desktop */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {seguindo.map((item) => {
              const mae = item.profiles;
              if (!mae) return null;

              const stats = mae.estatisticas || {};
              const childrenCount = mae.filhos?.length || 0;

              return (
                <Card key={mae.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                  <CardContent className="p-4 md:p-6">
                    {/* Layout Mobile First com melhorias para Desktop */}
                    <div className="space-y-4">
                      {/* Header com Avatar e Nome */}
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <Avatar className="w-16 h-16 md:w-20 md:h-20 border-2 border-purple-200">
                            <AvatarImage 
                              src={mae.avatar_url || ''} 
                              alt={mae.nome || 'Mãe'}
                            />
                            <AvatarFallback className="bg-purple-100 text-purple-600 text-xl font-bold">
                              {mae.nome?.charAt(0).toUpperCase() || 'M'}
                            </AvatarFallback>
                          </Avatar>
                          
                          {/* Indicador de atividade */}
                          {stats.ultima_atividade && (
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                              new Date().getTime() - new Date(stats.ultima_atividade).getTime() < 24 * 60 * 60 * 1000 
                                ? 'bg-green-500' 
                                : new Date().getTime() - new Date(stats.ultima_atividade).getTime() < 7 * 24 * 60 * 60 * 1000
                                ? 'bg-yellow-500'
                                : 'bg-gray-400'
                            }`} />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg md:text-xl text-gray-900 truncate">
                            {mae.nome || 'Nome não informado'}
                          </h3>
                          
                          {/* Membro desde */}
                          {mae.created_at && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                              <Users className="w-3 h-3" />
                              {formatMemberSince(mae.created_at)}
                            </div>
                          )}
                          
                          {/* Avaliação */}
                          {stats.media_avaliacao > 0 && (
                            <div className="flex items-center gap-1 mb-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium text-gray-700">
                                {stats.media_avaliacao.toFixed(1)}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({stats.avaliacoes_recebidas})
                              </span>
                            </div>
                          )}
                          
                          {/* Última atividade */}
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {formatLastActivity(stats.ultima_atividade)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Informações dos filhos */}
                      {childrenCount > 0 && (
                        <div className="bg-pink-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Baby className="w-4 h-4 text-pink-600" />
                            <span className="text-sm font-medium text-pink-800">
                              {childrenCount} {childrenCount === 1 ? 'filho' : 'filhos'}
                            </span>
                          </div>
                          <div className="text-xs text-pink-600">
                            Idades: {getChildrenAgesText(mae.filhos)}
                          </div>
                        </div>
                      )}

                      {/* Localização e estatísticas */}
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
                        
                        {/* Grid de estatísticas */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {/* Itens ativos */}
                          <div className="flex items-center gap-2 text-gray-600">
                            <Package className="w-4 h-4 text-green-500" />
                            <div>
                              <div className="font-medium">{stats.itens_ativos || 0}</div>
                              <div className="text-xs text-gray-500">itens ativos</div>
                            </div>
                          </div>

                          {/* Total de trocas */}
                          <div className="flex items-center gap-2 text-gray-600">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            <div>
                              <div className="font-medium">{stats.total_trocas || 0}</div>
                              <div className="text-xs text-gray-500">trocas</div>
                            </div>
                          </div>
                        </div>

                        {/* Último item postado */}
                        {stats.ultimo_item_postado && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {formatDatePosted(stats.ultimo_item_postado)}
                          </div>
                        )}
                        
                        {/* Bio (apenas primeiras linhas) */}
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
                        
                        {stats.total_itens > 0 && (
                          <Badge variant="outline" className="text-xs">
                            📦 {stats.total_itens} itens total
                          </Badge>
                        )}
                                              
                        {mae.interesses && mae.interesses.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            💝 {mae.interesses.length} interesses
                          </Badge>
                        )}
                      </div>

                      <Separator />

                      {/* Botões de ação - Responsivos */}
                      <div className="flex gap-2">
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
