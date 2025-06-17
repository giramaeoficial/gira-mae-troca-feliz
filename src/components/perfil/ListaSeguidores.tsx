
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Heart } from 'lucide-react';
import { useSeguidores } from '@/hooks/useSeguidores';
import UniversalCard from '@/components/ui/universal-card';

const ListaSeguidores = () => {
  const { buscarSeguindo, buscarSeguidores, buscarEstatisticas, loading } = useSeguidores();
  const [seguindo, setSeguindo] = useState<any[]>([]);
  const [seguidores, setSeguidores] = useState<any[]>([]);
  const [estatisticas, setEstatisticas] = useState({ total_seguindo: 0, total_seguidores: 0 });

  useEffect(() => {
    const carregarDados = async () => {
      const [seguindoData, seguidoresData, stats] = await Promise.all([
        buscarSeguindo(),
        buscarSeguidores(),
        buscarEstatisticas()
      ]);
      
      setSeguindo(seguindoData);
      setSeguidores(seguidoresData);
      setEstatisticas(stats);
    };

    carregarDados();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Users className="h-8 w-8 text-primary animate-pulse mx-auto mb-2" />
          <p className="text-gray-600">Carregando conexões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-4">
        <UniversalCard
          variant="stats"
          data={{
            icon: UserCheck,
            title: "Seguindo",
            value: estatisticas.total_seguindo,
            gradient: "bg-gradient-to-br from-blue-500 to-blue-600"
          }}
        />
        <UniversalCard
          variant="stats"
          data={{
            icon: Heart,
            title: "Seguidoras",
            value: estatisticas.total_seguidores,
            gradient: "bg-gradient-to-br from-pink-500 to-pink-600"
          }}
        />
      </div>

      {/* Lista de Seguindo */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            Seguindo ({seguindo.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {seguindo.length === 0 ? (
            <p className="text-center text-gray-600 py-4">
              Você ainda não está seguindo ninguém
            </p>
          ) : (
            <div className="space-y-3">
              {seguindo.map((item) => (
                <UniversalCard
                  key={item.id}
                  variant="profile"
                  data={{
                    id: item.profiles.id,
                    nome: item.profiles.nome,
                    avatar: item.profiles.avatar_url,
                    localização: item.profiles.bairro && item.profiles.cidade 
                      ? `${item.profiles.bairro}, ${item.profiles.cidade}`
                      : undefined,
                    badge: "Seguindo",
                    badgeVariant: "secondary"
                  }}
                  linkTo={`/perfil/${item.profiles.id}`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Seguidores */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Suas Seguidoras ({seguidores.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {seguidores.length === 0 ? (
            <p className="text-center text-gray-600 py-4">
              Você ainda não tem seguidoras
            </p>
          ) : (
            <div className="space-y-3">
              {seguidores.map((item) => (
                <UniversalCard
                  key={item.id}
                  variant="profile"
                  data={{
                    id: item.profiles.id,
                    nome: item.profiles.nome,
                    avatar: item.profiles.avatar_url,
                    localização: item.profiles.bairro && item.profiles.cidade 
                      ? `${item.profiles.bairro}, ${item.profiles.cidade}`
                      : undefined,
                    badge: "Te segue",
                    badgeVariant: "outline"
                  }}
                  linkTo={`/perfil/${item.profiles.id}`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ListaSeguidores;
