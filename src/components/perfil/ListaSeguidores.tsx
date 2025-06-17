import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, Heart } from 'lucide-react';
import { useSeguidores } from '@/hooks/useSeguidores';
import { Link } from 'react-router-dom';

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
        <Card className="bg-white/60 backdrop-blur-sm border-0">
          <CardContent className="p-4 text-center">
            <UserCheck className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-gray-800">{estatisticas.total_seguindo}</p>
            <p className="text-xs text-gray-600">Seguindo</p>
          </CardContent>
        </Card>
        <Card className="bg-white/60 backdrop-blur-sm border-0">
          <CardContent className="p-4 text-center">
            <Heart className="w-6 h-6 mx-auto mb-2 text-pink-600" />
            <p className="text-2xl font-bold text-gray-800">{estatisticas.total_seguidores}</p>
            <p className="text-xs text-gray-600">Seguidoras</p>
          </CardContent>
        </Card>
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
                <Link 
                  key={item.id} 
                  to={`/perfil/${item.profiles.id}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={item.profiles.avatar_url} />
                    <AvatarFallback>
                      {item.profiles.nome?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <h4 className="font-medium text-gray-800">{item.profiles.nome}</h4>
                    <p className="text-sm text-gray-600">
                      {item.profiles.bairro && item.profiles.cidade && 
                        `${item.profiles.bairro}, ${item.profiles.cidade}`
                      }
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Seguindo
                  </Badge>
                </Link>
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
                <Link 
                  key={item.id} 
                  to={`/perfil/${item.profiles.id}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={item.profiles.avatar_url} />
                    <AvatarFallback>
                      {item.profiles.nome?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <h4 className="font-medium text-gray-800">{item.profiles.nome}</h4>
                    <p className="text-sm text-gray-600">
                      {item.profiles.bairro && item.profiles.cidade && 
                        `${item.profiles.bairro}, ${item.profiles.cidade}`
                      }
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Te segue
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ListaSeguidores;
