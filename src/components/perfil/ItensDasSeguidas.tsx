
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, Star } from 'lucide-react';
import { useSeguidores } from '@/hooks/useSeguidores';
import { Link } from 'react-router-dom';

const ItensDasSeguidas = () => {
  const { buscarItensDasMinhasSeguidas, loading } = useSeguidores();
  const [itens, setItens] = useState<any[]>([]);

  useEffect(() => {
    const carregarItens = async () => {
      const data = await buscarItensDasMinhasSeguidas();
      setItens(data);
    };

    carregarItens();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Sparkles className="h-8 w-8 text-primary animate-spin" />
        <span className="ml-2 text-gray-600">Carregando itens das suas seguidas...</span>
      </div>
    );
  }

  if (itens.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhum item das suas seguidas</h3>
          <p className="text-gray-600 mb-4">
            Siga outras mães para ver os itens que elas estão publicando!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          Itens das Suas Seguidas ({itens.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {itens.map((item) => (
            <Card key={item.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
              <div className="relative">
                {item.fotos && item.fotos.length > 0 ? (
                  <img src={item.fotos[0]} alt={item.titulo} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Sem foto</span>
                  </div>
                )}
                <Badge className="absolute top-2 right-2 bg-pink-500 text-white">
                  <Heart className="w-3 h-3 mr-1" />
                  Seguida
                </Badge>
              </div>
              <CardContent className="p-4">
                {/* Informações da mãe que publicou */}
                <div className="flex items-center gap-2 mb-3">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={item.profiles?.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {item.profiles?.nome?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Link 
                    to={`/perfil/${encodeURIComponent(item.profiles?.nome || '')}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {item.profiles?.nome}
                  </Link>
                  {item.profiles?.reputacao && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-500">{(item.profiles.reputacao/20).toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-gray-800 mb-1">{item.titulo}</h3>
                {item.tamanho && (
                  <p className="text-sm text-gray-600 mb-2">Tamanho: {item.tamanho}</p>
                )}
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{item.descricao}</p>
                
                <div className="flex justify-between items-center">
                  <p className="font-bold text-primary flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    {item.valor_girinhas}
                  </p>
                  <Button asChild size="sm">
                    <Link to={`/item/${item.id}`}>
                      Ver Item
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ItensDasSeguidas;
