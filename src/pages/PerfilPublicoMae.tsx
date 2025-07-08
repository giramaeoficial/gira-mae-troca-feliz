// src/pages/PerfilPublicoMae.tsx - CORRIGIDO

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFeedInfinito } from '@/hooks/useFeedInfinito'; // ✅ ADICIONAR
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Calendar, Users, Heart, Star } from 'lucide-react';
import Header from '@/components/layout/Header';
import QuickNav from '@/components/navigation/QuickNav';
import ItemCard from '@/components/shared/ItemCard';

interface Profile {
  id: string;
  nome: string;
  avatar_url?: string;
  cidade?: string;
  estado?: string;
  bairro?: string;
  data_nascimento?: string;
  bio?: string;
  reputacao?: number;
  created_at: string;
}

interface Estatisticas {
  total_seguindo: number;
  total_seguidores: number;
}

const PerfilPublicoMae: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estatisticas, setEstatisticas] = useState<Estatisticas>({ total_seguindo: 0, total_seguidores: 0 });
  const [actionStates, setActionStates] = useState<Record<string, 'loading' | 'success' | 'error' | 'idle'>>({});

  // ✅ USAR DADOS REAIS DO FEED (em vez de mock)
  const filtrosPerfilItens = useMemo(() => ({
    busca: '',
    cidade: '',
    categoria: 'todas',
    subcategoria: 'todas',
    genero: 'todos',
    tamanho: 'todos',
    precoMin: 0,
    precoMax: 200,
    mostrarReservados: true,
    modalidadeLogistica: 'todas'
  }), []);

  const {
    data: paginasFeed,
    isLoading: loadingItens,
    refetch: refetchItens
  } = useFeedInfinito(user?.id || '', filtrosPerfilItens);

  // ✅ EXTRAIR DADOS CONSOLIDADOS (igual ao FeedOptimized)
  const feedData = useMemo(() => {
    const primeiraPagina = paginasFeed?.pages?.[0];
    return {
      favoritos: primeiraPagina?.favoritos || [],
      reservas_usuario: primeiraPagina?.reservas_usuario || [],
      filas_espera: primeiraPagina?.filas_espera || {},
      configuracoes: primeiraPagina?.configuracoes,
      profile_essencial: primeiraPagina?.profile_essencial,
      taxaTransacao: 5
    };
  }, [paginasFeed]);

  // ✅ FILTRAR ITENS DO PERFIL ESPECÍFICO
  const itensDoProfile = useMemo(() => {
    if (!paginasFeed?.pages || !id) return [];
    
    const todosItens = paginasFeed.pages.flatMap(page => page?.itens || []);
    return todosItens.filter(item => item.publicado_por === id);
  }, [paginasFeed, id]);

  useEffect(() => {
    const carregarDados = async () => {
      if (!id) {
        setError('ID do perfil não informado');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('Buscando perfil por ID:', id);
        
        // Buscar perfil por ID
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (profileError) {
          console.error('Erro ao buscar perfil:', profileError);
          setError('Perfil não encontrado');
          setLoading(false);
          return;
        }

        console.log('Perfil encontrado:', profileData);
        setProfile(profileData);
        
        // Buscar estatísticas de seguidores (simulado por enquanto)
        setEstatisticas({ total_seguindo: 0, total_seguidores: 0 });
        
      } catch (error) {
        console.error('Erro ao carregar dados do perfil:', error);
        setError('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [id]);

  // ✅ Funções de ação usando os dados consolidados
  const handleItemClick = useCallback((itemId: string) => {
    navigate(`/item/${itemId}`);
  }, [navigate]);

  const entrarNaFila = async (itemId: string) => {
    if (!user) return;
    
    setActionStates(prev => ({ ...prev, [itemId]: 'loading' }));
    
    try {
      const { data, error } = await supabase
        .rpc('entrar_fila_espera', { 
          p_item_id: itemId, 
          p_usuario_id: user.id 
        });

      if (error) {
        toast({ 
          title: "Erro ao reservar", 
          description: error.message, 
          variant: "destructive" 
        });
        setActionStates(prev => ({ ...prev, [itemId]: 'error' }));
        return false;
      }

      const result = data as { tipo?: string; posicao?: number } | null;
      
      if (result?.tipo === 'reserva_direta') {
        toast({ 
          title: "Item reservado! 🎉", 
          description: "As Girinhas foram bloqueadas." 
        });
        await refetchItens(); // ✅ Atualizar dados
      } else if (result?.tipo === 'fila_espera') {
        toast({ 
          title: "Entrou na fila! 📝", 
          description: `Você está na posição ${result.posicao} da fila.` 
        });
        await refetchItens(); // ✅ Atualizar dados
      }
      
      setActionStates(prev => ({ ...prev, [itemId]: 'success' }));
      setTimeout(() => {
        setActionStates(prev => ({ ...prev, [itemId]: 'idle' }));
      }, 2000);
      
      return true;
    } catch (err) {
      console.error('Erro ao entrar na fila:', err);
      toast({ 
        title: "Erro ao entrar na fila", 
        description: err instanceof Error ? err.message : "Tente novamente.", 
        variant: "destructive" 
      });
      setActionStates(prev => ({ ...prev, [itemId]: 'error' }));
      setTimeout(() => {
        setActionStates(prev => ({ ...prev, [itemId]: 'idle' }));
      }, 2000);
      return false;
    }
  };

  const toggleFavorito = async (itemId: string) => {
    if (!user) return;
    
    const isFavorito = feedData.favoritos.includes(itemId);
    
    try {
      if (isFavorito) {
        const { error } = await supabase
          .from('favoritos')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', itemId);

        if (error) throw error;

        toast({
          title: "Removido dos favoritos",
          description: "Item removido da sua lista de desejos.",
        });
      } else {
        const { error } = await supabase
          .from('favoritos')
          .insert({
            user_id: user.id,
            item_id: itemId
          });

        if (error) throw error;

        toast({
          title: "Adicionado aos favoritos! ❤️",
          description: "Item adicionado à sua lista de desejos.",
        });
      }
      
      await refetchItens(); // ✅ Atualizar dados
      
    } catch (error) {
      console.error('Erro ao toggle favorito:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os favoritos.",
        variant: "destructive",
      });
    }
  };

  const handleReservarItem = async (itemId: string) => {
    try {
      await entrarNaFila(itemId);
    } catch (error) {
      console.error('Erro ao reservar item:', error);
    }
  };

  const handleEntrarFila = async (itemId: string) => {
    try {
      await entrarNaFila(itemId);
    } catch (error) {
      console.error('Erro ao entrar na fila:', error);
    }
  };

  const handleToggleFavorito = async (itemId: string) => {
    try {
      await toggleFavorito(itemId);
    } catch (error) {
      console.error('Erro ao toggle favorito:', error);
    }
  };

  const calcularIdade = (dataNascimento: string | null) => {
    if (!dataNascimento) return null;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  if (loading || loadingItens) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando perfil...</p>
          </div>
        </main>
        <QuickNav />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Perfil não encontrado</h2>
              <p className="text-gray-600 mb-6">{error || 'O perfil que você está procurando não existe.'}</p>
              <Button onClick={() => navigate('/feed')} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Feed
              </Button>
            </CardContent>
          </Card>
        </main>
        <QuickNav />
      </div>
    );
  }

  const idade = calcularIdade(profile.data_nascimento);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
      <Header />
      
      <main className="flex-grow px-4 py-6 max-w-4xl mx-auto w-full">
        {/* Header do Perfil */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Perfil</h1>
        </div>

        {/* Card do Perfil */}
        <Card className="mb-6">
          <CardContent className="p-6">
            {/* Avatar e Info Principal */}
            <div className="flex items-start gap-4 mb-4">
              <div className="relative">
                <img
                  src={profile.avatar_url || '/default-avatar.png'}
                  alt={profile.nome}
                  className="w-20 h-20 rounded-full object-cover"
                />
              </div>
              
              <div className="flex-grow">
                <h2 className="text-xl font-bold mb-1">{profile.nome}</h2>
                
                {/* Localização */}
                {(profile.cidade || profile.bairro) && (
                  <div className="flex items-center gap-1 text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">
                      {[profile.bairro, profile.cidade, profile.estado].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}

                {/* Idade */}
                {idade && (
                  <div className="flex items-center gap-1 text-gray-600 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{idade} anos</span>
                  </div>
                )}

                {/* Reputação */}
                <div className="flex items-center gap-1 text-gray-600">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">{profile.reputacao || 0} pontos</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-gray-700 mb-4">{profile.bio}</p>
            )}

            {/* Estatísticas */}
            <div className="flex items-center gap-6 pt-4 border-t">
              <div className="text-center">
                <div className="font-bold text-lg">{itensDoProfile.length}</div>
                <div className="text-sm text-gray-600">Itens</div>
              </div>
              
              <div className="text-center">
                <div className="font-bold text-lg">{estatisticas.total_seguidores}</div>
                <div className="text-sm text-gray-600">Seguidores</div>
              </div>
              
              <div className="text-center">
                <div className="font-bold text-lg">{estatisticas.total_seguindo}</div>
                <div className="text-sm text-gray-600">Seguindo</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Itens do Usuário */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">
            Itens publicados ({itensDoProfile.length})
          </h3>

          {itensDoProfile.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {itensDoProfile.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  feedData={feedData} // ✅ AGORA COM DADOS REAIS
                  currentUserId={user?.id || ''}
                  taxaTransacao={feedData.taxaTransacao}
                  onToggleFavorito={() => handleToggleFavorito(item.id)}
                  onEntrarFila={() => handleEntrarFila(item.id)}
                  onReservar={() => handleReservarItem(item.id)}
                  onItemClick={handleItemClick}
                  actionState={actionStates[item.id]}
                  showActions={item.publicado_por !== user?.id} // Não mostrar ações em seus próprios itens
                  showLocation={true}
                  showAuthor={false} // Não mostrar autor pois é o perfil dele
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-500 mb-2">
                  <Users className="w-12 h-12 mx-auto mb-4" />
                </div>
                <h4 className="text-lg font-medium mb-2">Nenhum item publicado</h4>
                <p className="text-gray-600">
                  {profile.nome} ainda não publicou nenhum item.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <QuickNav />
    </div>
  );
};

export default PerfilPublicoMae;
