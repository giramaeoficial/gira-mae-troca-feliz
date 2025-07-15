// src/pages/PerfilPublicoMae.tsx - USANDO ITEMCARD IDÊNTICO AO FEED
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';
import { ItemCard } from '@/components/shared/ItemCard';
import ItemCardSkeleton from '@/components/loading/ItemCardSkeleton';
import EmptyState from '@/components/loading/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  MapPin, 
  Users, 
  Package, 
  Calendar,
  Star,
  ArrowLeft
} from 'lucide-react';

const PerfilPublicoMae = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [itensData, setItensData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingItens, setLoadingItens] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionStates, setActionStates] = useState<Record<string, 'loading' | 'success' | 'error' | 'idle'>>({});

  // ✅ Função para carregar perfil
  const carregarPerfil = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        setError('Perfil não encontrado');
        return;
      }

      setProfile(profileData);
      
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      setError('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ✅ Função para carregar itens usando RPC específica
  const carregarItens = useCallback(async () => {
    if (!id || !user?.id) return;
    
    try {
      setLoadingItens(true);
      
      console.log('🔄 Carregando itens do usuário:', id);
      
      const { data, error } = await supabase
        .rpc('carregar_itens_usuario_especifico', { 
          p_user_id: user.id,
          p_target_user_id: id
        });

      if (error) {
        console.error('❌ Erro ao buscar itens:', error);
        throw error;
      }

      console.log('✅ Resposta da RPC:', data);

      if (data?.success) {
        setItensData(data);
        console.log(`✅ ${data.itens?.length || 0} itens carregados`);
      } else {
        console.error('❌ RPC retornou erro:', data?.message);
        throw new Error(data?.message || 'Erro na RPC');
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar itens:', error);
      toast({
        title: "Erro ao carregar itens",
        description: "Não foi possível carregar os itens do usuário.",
        variant: "destructive",
      });
    } finally {
      setLoadingItens(false);
    }
  }, [id, user?.id, toast]);

  // ✅ Carregar dados na inicialização
  useEffect(() => {
    carregarPerfil();
  }, [carregarPerfil]);

  useEffect(() => {
    carregarItens();
  }, [carregarItens]);

  // ✅ Dados para o ItemCard EXATAMENTE IGUAL AO FEED
  const feedData = useMemo(() => {
    if (!itensData) return { 
      favoritos: [], 
      reservas_usuario: [], 
      filas_espera: {},
      configuracoes: null,
      profile_essencial: null,
      taxaTransacao: 5 
    };
    
    return {
      favoritos: itensData.favoritos || [],
      reservas_usuario: itensData.reservas_usuario || [],
      filas_espera: itensData.filas_espera || {},
      configuracoes: null, // Não precisamos para perfil específico
      profile_essencial: null, // Não precisamos para perfil específico
      taxaTransacao: 5
    };
  }, [itensData]);

  // ✅ Lista de itens formatados para ItemCard
  const itens = useMemo(() => {
    if (!itensData?.itens) return [];
    
    return itensData.itens.map((item: any) => ({
      ...item,
      mesma_escola: item.escola_comum || false
    }));
  }, [itensData]);

  const itensDisponiveis = itens.filter(item => item.status === 'disponivel');

  const handleItemClick = useCallback((itemId: string) => {
    navigate(`/item/${itemId}`);
  }, [navigate]);

  // ✅ FUNÇÃO entrarNaFila IDÊNTICA AO FEED
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
          description: "As Girinhas foram bloqueadas. Use o código de confirmação na entrega." 
        });
      } else if (result?.tipo === 'fila_espera') {
        toast({ 
          title: "Entrou na fila! 📝", 
          description: `Você está na posição ${result.posicao} da fila. As Girinhas NÃO foram bloqueadas ainda.` 
        });
      }
      
      setActionStates(prev => ({ ...prev, [itemId]: 'success' }));
      setTimeout(() => {
        setActionStates(prev => ({ ...prev, [itemId]: 'idle' }));
      }, 2000);
      
      // ✅ Recarregar dados após ação
      await carregarItens();
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

  // ✅ FUNÇÃO toggleFavorito IDÊNTICA AO FEED
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
      
      // ✅ Recarregar dados após ação
      await carregarItens();
    } catch (error) {
      console.error('Erro ao toggle favorito:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os favoritos.",
        variant: "destructive",
      });
    }
  };

  // ✅ Handlers IDÊNTICOS AO FEED
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

  if (loading) {
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
              <Button onClick={() => navigate('/feed')}>
                Voltar ao Feed
              </Button>
            </CardContent>
          </Card>
        </main>
        <QuickNav />
      </div>
    );
  }

  const nomeCompleto = profile.sobrenome ? `${profile.nome} ${profile.sobrenome}` : profile.nome;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-24">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Botão Voltar */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-purple-600 hover:text-purple-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Perfil da Mãe */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white shadow-lg">
                  <AvatarImage src={profile.avatar_url || undefined} alt={nomeCompleto} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-2xl font-bold">
                    {profile.nome?.split(' ').map((n: string) => n[0]).join('') || 'M'}
                  </AvatarFallback>
                </Avatar>
                
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {nomeCompleto}
                </h1>
                
                {/* Avaliação */}
                <div className="flex items-center justify-center gap-1 mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-4 h-4 ${
                        star <= Math.floor((profile.reputacao || 0) / 20) 
                          ? 'fill-current text-yellow-500' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    ({((profile.reputacao || 0) / 20).toFixed(1)})
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Bio */}
                {profile.bio && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Sobre</h3>
                    <p className="text-gray-600 text-sm">{profile.bio}</p>
                  </div>
                )}

                {/* Localização */}
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm">
                    {profile.cidade && profile.estado 
                      ? `${profile.cidade}, ${profile.estado}`
                      : 'Localização não informada'
                    }
                  </span>
                </div>

                {/* Idade */}
                {profile?.data_nascimento && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-sm">{calcularIdade(profile.data_nascimento)} anos</span>
                  </div>
                )}

                {/* Estatísticas */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="font-bold">0</span>
                    </div>
                    <p className="text-xs text-gray-500">Seguidores</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-600">
                      <Package className="w-4 h-4" />
                      <span className="font-bold">{itensDisponiveis.length}</span>
                    </div>
                    <p className="text-xs text-gray-500">Itens ativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Itens da Mãe - USANDO ITEMCARD IDÊNTICO AO FEED */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Itens disponíveis ({itensDisponiveis.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingItens ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <ItemCardSkeleton key={i} />
                    ))}
                  </div>
                ) : itensDisponiveis.length === 0 ? (
                  <EmptyState
                    type="search"
                    title="Nenhum item disponível"
                    description="Este usuário não tem itens disponíveis no momento"
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {itensDisponiveis.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        feedData={feedData}
                        currentUserId={user?.id || ''}
                        taxaTransacao={feedData.taxaTransacao}
                        onItemClick={handleItemClick}
                        showActions={true}
                        showLocation={true}
                        showAuthor={false}
                        onToggleFavorito={() => handleToggleFavorito(item.id)}
                        onReservar={() => handleReservarItem(item.id)}
                        onEntrarFila={() => handleEntrarFila(item.id)}
                        actionState={actionStates[item.id]}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <QuickNav />
    </div>
  );
};

export default PerfilPublicoMae;
