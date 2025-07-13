import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
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
import { MapPin, Package, UserX, Eye } from 'lucide-react';

const MaesSeguidas = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { buscarSeguindo, buscarEstatisticas, deixarDeSeguir } = useSeguidores();
  
  const [seguindo, setSeguindo] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const carregarSeguindo = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const dados = await buscarSeguindo();
        setSeguindo(dados);
      } catch (err) {
        console.error('Erro ao carregar mães seguidas:', err);
        setError('Não foi possível carregar as mães seguidas');
      } finally {
        setLoading(false);
      }
    };

    carregarSeguindo();
  }, [user?.id, buscarSeguindo]);

  const handleUnfollow = async (maeId: string) => {
    try {
      await deixarDeSeguir(maeId);
      setSeguindo(prev => prev.filter(mae => mae.id !== maeId));
    } catch (err) {
      console.error('Erro ao deixar de seguir:', err);
    }
  };

  const handleViewProfile = (maeId: string) => {
    navigate(`/perfil/${maeId}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-24">
        <Header />
        <FriendlyError 
          type="permission"
          title="Acesso Restrito"
          message="Você precisa estar logado para ver suas mães seguidas."
          showHomeButton={true}
        />
        <QuickNav />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-24">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <LoadingSpinner text="Carregando mães seguidas..." />
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
          title="Erro de Conexão"
          message={error}
          onRetry={() => window.location.reload()}
        />
        <QuickNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-24">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header da página */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mães que sigo</h1>
            <p className="text-gray-600 mt-1">
              {seguindo.length} {seguindo.length === 1 ? 'mãe' : 'mães'}
            </p>
          </div>
        </div>

        {/* Lista de mães seguidas */}
        {seguindo.length === 0 ? (
          <EmptyState
            type="generic"
            title="Nenhuma mãe seguida"
            description="Você ainda não está seguindo nenhuma mãe. Comece explorando o feed e seguindo mães interessantes!"
            actionLabel="Ir para o Feed"
            onAction={() => navigate('/feed')}
          />
        ) : (
          <div className="grid gap-4">
            {seguindo.map((mae) => (
              <Card key={mae.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={mae.avatar_url} alt={mae.nome} />
                      <AvatarFallback className="text-lg">
                        {mae.nome ? mae.nome.charAt(0).toUpperCase() : 'M'}
                      </AvatarFallback>
                    </Avatar>

                    {/* Informações da mãe */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {mae.nome || 'Nome não informado'}
                      </h3>
                      
                      {(mae.cidade || mae.bairro) && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">
                            {[mae.bairro, mae.cidade].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}

                      {mae.itens_disponiveis !== undefined && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <Package className="w-4 h-4" />
                          <span>
                            {mae.itens_disponiveis} {mae.itens_disponiveis === 1 ? 'item disponível' : 'itens disponíveis'}
                          </span>
                        </div>
                      )}

                      {mae.reputacao && mae.reputacao > 0 && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          ⭐ {mae.reputacao} pontos
                        </Badge>
                      )}
                    </div>

                    {/* Botões de ação */}
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProfile(mae.id)}
                        className="whitespace-nowrap"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver perfil
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnfollow(mae.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 whitespace-nowrap"
                      >
                        <UserX className="w-4 h-4 mr-1" />
                        Deixar de seguir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <QuickNav />
    </div>
  );
};

export default MaesSeguidas;