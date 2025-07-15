import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import EmptyState from '@/components/loading/EmptyState';
import FriendlyError from '@/components/error/FriendlyError';
import { ItemCard } from '@/components/shared/ItemCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFavoritos } from '@/hooks/useFavoritos';
import { useAuth } from '@/hooks/useAuth';
import { Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ItensFavoritos = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { favoritos, loading } = useFavoritos();
  
  const [itensDetalhados, setItensDetalhados] = useState<any[]>([]);
  const [loadingItens, setLoadingItens] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  // Carregar detalhes dos itens favoritos
  React.useEffect(() => {
    const carregarItensDetalhados = async () => {
      if (!user?.id || favoritos.length === 0) {
        setItensDetalhados([]);
        return;
      }

      try {
        setLoadingItens(true);
        
        const itemIds = favoritos.map(fav => fav.item_id);
        
        const { data, error } = await supabase
          .from('itens_completos')
          .select('*')
          .in('id', itemIds)
          .in('status', ['disponivel', 'reservado']); 
        
        if (error) {
          console.error('Erro ao carregar itens favoritos:', error);
          throw error;
        }

        setItensDetalhados(data || []);
      } catch (err) {
        console.error('Erro ao carregar itens favoritos:', err);
        setError('Não foi possível carregar seus itens favoritos');
      } finally {
        setLoadingItens(false);
      }
    };

    carregarItensDetalhados();
  }, [user?.id, favoritos]);

  // Filtrar itens
  const itensFiltrados = useMemo(() => {
    return itensDetalhados.filter(item => {
      const passaCategoria = filtroCategoria === 'todos' || item.categoria === filtroCategoria;
      const passaStatus = filtroStatus === 'todos' || item.status === filtroStatus;
      return passaCategoria && passaStatus;
    });
  }, [itensDetalhados, filtroCategoria, filtroStatus]);

  // Obter categorias únicas
  const categorias = useMemo(() => {
    const cats = [...new Set(itensDetalhados.map(item => item.categoria))];
    return cats.sort();
  }, [itensDetalhados]);

  // Dados do feed para o ItemCard
  const feedData = useMemo(() => ({
    favoritos: favoritos.map(fav => fav.item_id),
    reservas_usuario: [],
    filas_espera: {}
  }), [favoritos]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-24">
        <Header />
        <FriendlyError 
          type="permission"
          title="Acesso Restrito"
          message="Você precisa estar logado para ver seus favoritos."
          showHomeButton={true}
        />
        <QuickNav />
      </div>
    );
  }

  if (loading || loadingItens) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-24">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <LoadingSpinner text="Carregando seus favoritos..." />
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
            <h1 className="text-2xl font-bold text-gray-900">Meus favoritos</h1>
            <p className="text-gray-600 mt-1">
              {itensFiltrados.length} {itensFiltrados.length === 1 ? 'item' : 'itens'}
            </p>
          </div>
        </div>

        {/* Filtros */}
        {itensDetalhados.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtros:</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as categorias</SelectItem>
                  {categorias.map(categoria => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="disponivel">Disponível</SelectItem>
                  <SelectItem value="reservado">Reservado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(filtroCategoria !== 'todos' || filtroStatus !== 'todos') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFiltroCategoria('todos');
                  setFiltroStatus('todos');
                }}
              >
                Limpar filtros
              </Button>
            )}
          </div>
        )}

        {/* Lista de itens favoritos */}
        {favoritos.length === 0 ? (
          <EmptyState
            type="favoritos"
            title="Nenhum favorito ainda"
            description="Você ainda não marcou nenhum item como favorito. Explore o feed e favorite os itens que mais gostar!"
            actionLabel="Ir para o Feed"
            onAction={() => navigate('/feed')}
          />
        ) : itensFiltrados.length === 0 && itensDetalhados.length > 0 ? (
          <EmptyState
            type="search"
            title="Nenhum item encontrado"
            description="Nenhum item favorito corresponde aos filtros selecionados."
            actionLabel="Limpar filtros"
            onAction={() => {
              setFiltroCategoria('todos');
              setFiltroStatus('todos');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {itensFiltrados.map((item) => (
              <ItemCard
                key={item.id}
                item={{
                  id: item.id,
                  titulo: item.titulo,
                  descricao: item.descricao,
                  valor_girinhas: item.valor_girinhas,
                  categoria: item.categoria,
                  subcategoria: item.subcategoria,
                  estado_conservacao: item.estado_conservacao,
                  status: item.status,
                  fotos: item.fotos,
                  genero: item.genero,
                  tamanho_valor: item.tamanho_valor,
                  tamanho_categoria: item.tamanho_categoria,
                  endereco_bairro: item.vendedor_bairro,
                  endereco_cidade: item.vendedor_cidade,
                  endereco_estado: item.vendedor_estado,
                  aceita_entrega: item.aceita_entrega_domicilio,
                  raio_entrega_km: item.vendedor_raio_entrega,
                  publicado_por: item.publicado_por,
                  created_at: item.created_at,
                  publicado_por_profile: {
                    nome: item.vendedor_nome,
                    avatar_url: item.vendedor_avatar,
                    reputacao: item.vendedor_reputacao,
                    whatsapp: item.vendedor_telefone
                  }
                }}
                feedData={feedData}
                currentUserId={user.id}
                showActions={true}
                showLocation={true}
                showAuthor={true}
                onItemClick={(itemId) => navigate(`/item/${itemId}`)}
              />
            ))}
          </div>
        )}
      </div>

      <QuickNav />
    </div>
  );
};

export default ItensFavoritos;
