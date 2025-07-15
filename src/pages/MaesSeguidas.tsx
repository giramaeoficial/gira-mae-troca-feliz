// src/pages/MaesSeguidas.tsx
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
  const { buscarSeguindo, deixarDeSeguir } = useSeguidores();
  
  const [seguindo, setSeguindo] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // ✅ CORREÇÃO: Removido buscarSeguindo das dependências
  React.useEffect(() => {
    const carregarSeguindo = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
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
  }, [user?.id]); // ✅ APENAS user?.id nas dependências

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

  const handleRefresh = () => {
    // Função para recarregar manualmente se necessário
    setLoading(true);
    setError(null);
    
    const recarregar = async () => {
      try {
        const dados = await buscarSeguindo();
        setSeguindo(dados);
      } catch (err) {
        console.error('Erro ao recarregar:', err);
        setError('Não foi possível recarregar as mães seguidas');
      } finally {
        setLoading(false);
      }
    };
    
    recarregar();
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
        <div className="container mx-auto px-4 pt-4">
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
      
      <div className="container mx-auto px-4 pt-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-purple-600 hover:text-purple-700"
            >
              ← Voltar
            </Button>
            <h1 className="text-2xl font-bold text-purple-800">
              Mães Seguidas
            </h1>
          </div>
          
          <Badge variant="outline" className="text-purple-700">
            {seguindo.length} {seguindo.length === 1 ? 'mãe' : 'mães'}
          </Badge>
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
          <div className="grid gap-4">
            {seguindo.map((item) => {
              const mae = item.profiles; // Perfil da mãe seguida
              if (!mae) return null;

              return (
                <Card key={mae.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage 
                            src={mae.avatar_url || ''} 
                            alt={mae.nome || 'Mãe'}
                          />
                          <AvatarFallback className="bg-purple-100 text-purple-600">
                            {mae.nome?.charAt(0).toUpperCase() || 'M'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-gray-900 truncate">
                            {mae.nome || 'Nome não informado'}
                          </h3>
                          
                          {mae.cidade && (
                            <div className="flex items-center gap-1 text-gray-600 mt-1">
                              <MapPin className="w-4 h-4" />
                              <span className="text-sm">{mae.cidade}</span>
                            </div>
                          )}
                          
                          {mae.bio && (
                            <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                              {mae.bio}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewProfile(mae.id)}
                          className="text-purple-600 border-purple-600 hover:bg-purple-50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver Perfil
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnfollow(mae.id)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <UserX className="w-4 h-4 mr-1" />
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
