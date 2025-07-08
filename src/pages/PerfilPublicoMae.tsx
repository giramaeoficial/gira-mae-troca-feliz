import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';
import { ItemCard } from '@/components/shared/ItemCard';
import BotaoSeguir from '@/components/perfil/BotaoSeguir';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, MapPin, Star, Calendar, Users, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ItemCardSkeleton from '@/components/loading/ItemCardSkeleton';
import EmptyState from '@/components/loading/EmptyState';

type Profile = Tables<'profiles'>;
type Item = Tables<'itens'>;

const PerfilPublicoMae = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [itens, setItens] = useState<Item[]>([]);
  const [estatisticas, setEstatisticas] = useState({ total_seguindo: 0, total_seguidores: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionStates, setActionStates] = useState<Record<string, 'loading' | 'success' | 'error' | 'idle'>>({});

  // ✅ Mock feedData similar ao FeedOptimized
  const feedData = useMemo(() => ({
    favoritos: [],
    reservas_usuario: [],
    filas_espera: {},
    configuracoes: null,
    profile_essencial: null,
    taxaTransacao: 5
  }), []);

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
        
        // ✅ Buscar itens com dados completos (igual ao feed)
        const { data: itensData, error: itensError } = await supabase
          .from('itens')
          .select(`
            *,
            publicado_por_profile:profiles!itens_publicado_por_fkey(
              nome,
              avatar_url,
              reputacao,
              telefone
            )
          `)
          .eq('publicado_por', profileData.id)
          .in('status', ['disponivel', 'reservado'])
          .order('created_at', { ascending: false });

        if (itensError) {
          console.error('Erro ao buscar itens:', itensError);
        } else {
          setItens(itensData || []);
        }
        
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

  // ✅ Funções de ação similares ao FeedOptimized
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
      } else if (result?.tipo === 'fila_espera') {
        toast({ 
          title: "Entrou na fila! 📝", 
          description: `Você está na posição ${result.posicao} da fila.` 
        });
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
              <Button onClick={() => navigate(-1)}>Voltar</Button>
            </CardContent>
          </Card>
        </main>
        <QuickNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Botão Voltar */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ✅ Perfil da Mãe - Mantido igual */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="flex flex-col items-center">
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.nome || 'Avatar'} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                      {profile?.nome?.split(' ').map(n => n[0]).join('') || 'M'}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-2xl text-gray-800 mb-2">
                    {profile?.nome || 'Usuário'}
                  </CardTitle>
                  
                  <div className="flex items-center gap-1 mb-4">
                    {[1,2,3,4,5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-4 h-4 ${
                          star <= Math.floor(profile?.reputacao || 0) 
                            ? 'fill-current text-yellow-500' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">
                      ({(profile?.reputacao || 0).toFixed(1)})
                    </span>
                  </div>

                  {profile && <BotaoSeguir usuarioId={profile.id} className="w-full mb-4" />}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {profile?.bio && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Sobre</h3>
                    <p className="text-gray-600 text-sm">{profile.bio}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm">
                    {profile?.endereco_cidade 
                      ? `${profile.endereco_cidade}, ${profile.endereco_estado}`
                      : 'Localização não informada'
                    }
                  </span>
                </div>

                {profile?.data_nascimento && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-sm">{calcularIdade(profile.data_nascimento)} anos</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="font-bold">{estatisticas.total_seguidores}</span>
                    </div>
                    <p className="text-xs text-gray-500">Seguidores</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-600">
                      <Package className="w-4 h-4" />
                      <span className="font-bold">{itens.length}</span>
                    </div>
                    <p className="text-xs text-gray-500">Itens ativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ✅ Itens da Mãe - USANDO ITEMCARD DO FEED */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Itens disponíveis ({itens.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <ItemCardSkeleton key={i} />
                    ))}
                  </div>
                ) : itens.length === 0 ? (
                  <EmptyState
                    type="search"
                    title="Nenhum item disponível"
                    description="Este usuário não tem itens disponíveis no momento"
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {itens.map((item) => (
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
