
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFavoritos } from "@/hooks/useFavoritos";
import { useItens } from "@/hooks/useItens";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/shared/Header";
import { Tables } from "@/integrations/supabase/types";

type Item = Tables<'itens'> & {
  profiles?: {
    id: string;
    nome: string | null;
    avatar_url: string | null;
    bairro: string | null;
    cidade: string | null;
    reputacao: number | null;
  } | null;
};

const Favoritos = () => {
  const { favoritos, loading: favoritosLoading, refetch } = useFavoritos();
  const { buscarItemPorId } = useItens();
  const [itens, setItens] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarItensFavoritos = async () => {
      console.log('Carregando itens favoritos. Favoritos:', favoritos);
      
      if (favoritos.length === 0) {
        setItens([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const itensPromises = favoritos.map(fav => {
          console.log('Buscando item:', fav.item_id);
          return buscarItemPorId(fav.item_id);
        });
        
        const itensCarregados = await Promise.all(itensPromises);
        console.log('Itens carregados:', itensCarregados);
        
        const itensValidos = itensCarregados.filter(item => item !== null) as Item[];
        console.log('Itens válidos:', itensValidos);
        
        setItens(itensValidos);
      } catch (error) {
        console.error('Erro ao carregar itens favoritos:', error);
        setItens([]);
      } finally {
        setLoading(false);
      }
    };

    if (!favoritosLoading) {
      carregarItensFavoritos();
    }
  }, [favoritos, favoritosLoading, buscarItemPorId]);

  const formatarPreco = (valor: number) => {
    return `${valor.toFixed(0)} Girinhas`;
  };

  console.log('Estado atual - favoritosLoading:', favoritosLoading, 'loading:', loading, 'favoritos:', favoritos, 'itens:', itens);

  if (favoritosLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-6 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            asChild
            className="shrink-0"
          >
            <Link to="/feed">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-red-500 fill-current" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meus Favoritos</h1>
              <p className="text-gray-600">
                {itens.length} {itens.length === 1 ? 'item favoritado' : 'itens favoritados'}
              </p>
            </div>
          </div>
        </div>

        {itens.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum item favoritado ainda
            </h3>
            <p className="text-gray-600 mb-6">
              Quando você favoritar itens, eles aparecerão aqui
            </p>
            <Button asChild>
              <Link to="/feed">
                Explorar Itens
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itens.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Link to={`/item/${item.id}`}>
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    {item.fotos && item.fotos.length > 0 ? (
                      <img
                        src={item.fotos[0]}
                        alt={item.titulo}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Sem foto
                      </div>
                    )}
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link to={`/item/${item.id}`}>
                    <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors line-clamp-2">
                      {item.titulo}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {item.categoria}
                    </Badge>
                    {item.tamanho && (
                      <Badge variant="outline" className="text-xs">
                        {item.tamanho}
                      </Badge>
                    )}
                    <Badge 
                      variant={item.status === 'disponivel' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {item.status === 'disponivel' ? 'Disponível' : 
                       item.status === 'reservado' ? 'Reservado' : 'Vendido'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">
                      {formatarPreco(item.valor_girinhas)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link to={`/item/${item.id}`}>
                        Ver Detalhes
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favoritos;
