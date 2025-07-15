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
import { supabase } from '@/integrations/supabase/client'; // ✅ CORREÇÃO: Importar supabase
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
  Calendar
} from 'lucide-react';

const MaesSeguidas = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { buscarSeguindo, deixarDeSeguir } = useSeguidores(); // ✅ Removido buscarEstatisticas
  const isMobile = useIsMobile();
  
  const [seguindo, setSeguindo] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  // ✅ CORREÇÃO: Função para buscar estatísticas completas
  const buscarEstatisticasCompletas = async (maeId: string) => {
    try {
      // Buscar itens ativos
      const { data: itens, error: itensError } = await supabase
        .from('itens')
        .select('*')
        .eq('publicado_por', maeId) // ✅ CORREÇÃO: usar 'publicado_por' em vez de 'autor_id'
        .in('status', ['disponivel', 'reservado']);

      if (itensError) throw itensError;

      // Buscar total de seguidores
      const { data: seguidores, error: seguidoresError } = await supabase
        .from('seguidores')
        .select('id')
        .eq('seguido_id', maeId);

      if (seguidoresError) throw seguidoresError;

      // Buscar informações do perfil
      const { data: perfil, error: perfilError } = await supabase
        .from('profiles')
        .select('reputacao, last_seen_at, created_at')
        .eq('id', maeId)
        .single();

      if (perfilError) throw perfilError;

      return {
        total_itens: itens?.length || 0,
        itens_ativos: itens?.filter(item => item.status === 'disponivel').length || 0,
        total_seguidores: seguidores?.length || 0,
        ultima_atividade: perfil?.last_seen_at,
        media_avaliacao: perfil?.reputacao ? perfil.reputacao / 20 : 0,
        avaliacoes_recebidas: 0, // Implementar se tiver tabela de avaliações
        membro_desde: perfil?.created_at
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        total_itens: 0,
        itens_ativos: 0,
        total_seguidores: 0,
        ultima_atividade: null,
        media_avaliacao: 0,
        avaliacoes_recebidas: 0,
        membro_desde: null
      };
    }
  };

  React.useEffect(() => {
    const carregarSeguindo = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        const dados = await buscarSeguindo();
        
        // ✅ CORREÇÃO: Enriquecer dados com informações REAIS corrigidas
        const dadosEnriquecidos = await Promise.all(
          dados.map(async (item) => {
            const mae = item.profiles;
            if (!mae) return item;
            
            try {
              // ✅ CORREÇÃO: Buscar estatísticas reais usando função corrigida
              const estatisticas = await buscarEstatisticasCompletas(mae.id);

              return {
                ...item,
                profiles: {
                  ...mae,
                  itens_ativos: estatisticas.itens_ativos,
                  estatisticas: estatisticas
                }
              };
            } catch (err) {
              console.log('Erro ao buscar dados para:', mae.id, err);
              return {
                ...item,
                profiles: {
                  ...mae,
                  itens_ativos: 0,
                  estatisticas: {
                    total_itens: 0,
                    itens_ativos: 0,
                    ultima_atividade: mae.last_seen_at,
                    avaliacoes_recebidas: 0,
                    media_avaliacao: mae.reputacao ? mae.reputacao / 20 : 0,
                    total_seguidores: 0,
                    membro_desde: mae.created_at
                  }
                }
              };
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
  }, [user?.id]); // ✅ CORREÇÃO: Removido buscarEstatisticas das dependências

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
      
      // ✅ Reaplicar enriquecimento na atualização
      const dadosEnriquecidos = await Promise.all(
        dados.map(async (item) => {
          const mae = item.profiles;
          if (!mae) return item;
          
          const estatisticas = await buscarEstatisticasCompletas(mae.id);
          
          return {
            ...item,
            profiles: {
              ...mae,
              itens_ativos: estatisticas.itens_ativos,
              estatisticas: estatisticas
            }
          };
        })
      );
      
      setSeguindo(dadosEnriquecidos);
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {seguindo.map((item) => {
              const mae = item.profiles;
              if (!mae) return null;

              const stats = mae.estatisticas || {};

              return (
                <Card key={mae.id} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-200 hover:scale-[1.02]">
                  <CardHeader className="text-center pb-4">
                    <div className="flex flex-col items-center">
                      <Avatar className="w-20 h-20 mb-4 border-2 border-purple-200">
                        <AvatarImage src={mae.avatar_url || undefined} alt={mae.nome || 'Avatar'} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                          {mae.nome?.split(' ').map(n => n[0]).join('') || 'M'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
                        {mae.nome || 'Usuário'}
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

                    {/* Localização */}
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-primary" />
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
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-sm">{calcularIdade(mae.data_nascimento)} anos</span>
                      </div>
                    )}

                    {/* Última atividade */}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        {formatLastActivity(stats.ultima_atividade)}
                      </span>
                    </div>

                    {/* Estatísticas */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-600">
                          <Users className="w-4 h-4" />
                          <span className="font-bold">{stats.total_seguidores || 0}</span>
                        </div>
                        <p className="text-xs text-gray-500">Seguidores</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-600">
                          <Package className="w-4 h-4" />
                          <span className="font-bold">{mae.itens_ativos || 0}</span>
                        </div>
                        <p className="text-xs text-gray-500">Itens ativos</p>
                      </div>
                    </div>

                    {/* Badges informativos */}
                    <div className="flex flex-wrap gap-2 justify-center">
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
        )}
      </div>

      <QuickNav />
    </div>
  );
};

export default MaesSeguidas;
