
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Sparkles } from 'lucide-react';
import { useSeguidores } from '@/hooks/useSeguidores';
import UniversalCard from '@/components/ui/universal-card';

const ItensDasSeguidas = () => {
  const { buscarItensDasMinhasSeguidas, loading } = useSeguidores();
  const [itens, setItens] = useState<any[]>([]);

  useEffect(() => {
    const carregarItens = async () => {
      const data = await buscarItensDasMinhasSeguidas();
      console.log('Itens das seguidas carregados:', data);
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
            <UniversalCard
              key={item.id}
              variant="item"
              data={{
                id: item.id,
                titulo: item.titulo,
                categoria: item.categoria,
                tamanho: item.tamanho,
                valorGirinhas: item.valor_girinhas,
                estadoConservacao: item.estado_conservacao,
                fotos: item.fotos,
                status: item.status,
                autorNome: item.profiles?.nome,
                autorId: item.profiles?.id,
                autorAvatar: item.profiles?.avatar_url,
                autorReputacao: item.profiles?.reputacao,
                descricao: item.descricao
              }}
              linkTo={`/item/${item.id}`}
              showAuthor={true}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ItensDasSeguidas;
