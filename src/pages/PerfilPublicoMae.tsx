// src/pages/PerfilPublicoMae.tsx - CORRIGIDO
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';
import BotaoSeguir from '@/components/perfil/BotaoSeguir';
import ItemCard from '@/components/items/ItemCard';
import ItemCardSkeleton from '@/components/items/ItemCardSkeleton';
import EmptyState from '@/components/loading/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  MapPin, 
  Users, 
  Package, 
  Calendar,
  Star,
  ArrowLeft
} from 'lucide-react';

interface ProfileData {
  id: string;
  nome: string;
  sobrenome?: string;
  avatar_url?: string;
  bio?: string;
  cidade?: string;
  estado?: string;
  bairro?: string;
  data_nascimento?: string;
  reputacao?: number;
  created_at: string;
}

interface ItemData {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  subcategoria?: string;
  genero?: string;
  tamanho_categoria?: string;
  tamanho_valor?: string;
  estado_conservacao: string;
  valor_girinhas: number;
  fotos: string[];
  status: string;
  publicado_por: string;
  created_at: string;
  updated_at: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_estado?: string;
  aceita_entrega?: boolean;
  raio_entrega_km?: number;
  logistica?: {
    entrega_disponivel: boolean;
    busca_disponivel: boolean;
    distancia_km?: number;
  };
  publicado_por_profile?: {
    nome: string;
    avatar_url?: string;
    reputacao: number;
    whatsapp?: string;
  };
  escola_comum?: boolean;
  is_favorito?: boolean;
  fila_info?: {
    total_fila: number;
    posicao_usuario: number;
  };
}

interface RespostaItensAPI {
  success: boolean;
  target_user_id: string;
  total_itens: number;
  itens: ItemData[];
  favoritos: string[];
  reservas_usuario: Array<{
    item_id: string;
    status: string;
    id: string;
    usuario_reservou: string;
  }>;
  filas_espera: Record<string, {
    total_fila: number;
    posicao_usuario: number;
    usuario_id: string;
  }>;
}

const PerfilPublicoMae = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [itensData, setItensData] = useState<RespostaItensAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingItens, setLoadingItens] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionStates, setActionStates] = useState<Record<string, string>>({});
  const [estatisticas, setEstatisticas] = useState({ total_seguindo: 0, total_seguidores: 0 });

  // ✅ Carregar dados do perfil
  useEffect(() => {
    const carregarPerfil = async () => {
      if (!id) {
        setError('ID do perfil não informado');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('Buscando perfil por ID:', id);
        
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

        console.log('Perfil encontrado:', profileData);
        setProfile(profileData);
        
      } catch (error) {
        console.error('Erro ao carregar dados do perfil:', error);
        setError('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };

    carregarPerfil();
  }, [id]);

  // ✅ Carregar itens usando a RPC específica
  useEffect(() => {
    const carregarItens = async () => {
      if (!id || !user?.id) return;
      
      try {
        setLoadingItens(true);
        
        console.log('Buscando itens do usuário:', id);
        
        const { data, error } = await supabase
          .rpc('carregar_itens_usuario_especifico', { 
            p_user_id: user.id,
            p_target_user_id: id
          });

        if (error) {
          console.error('Erro ao buscar itens:', error);
          return;
        }

        const resultado = data as RespostaItensAPI;
        
        if (resultado.success) {
          setItensData(resultado);
          console.log('Itens carregados:', resultado.itens.length);
        } else {
          console.error('Erro na resposta da API:', resultado);
        }
        
      } catch (error) {
        console.error('Erro ao carregar itens:', error);
      } finally {
        setLoadingItens(false);
      }
    };

    carregarItens();
  }, [id, user?.id]);

  // ✅ Dados para o ItemCard
  const feedData = useMemo(() => {
    if (!itensData) return { favoritos: [], reservas_usuario: [], filas_espera: {}, taxaTransacao: 5 };
    
    return {
      favoritos: itensData.favoritos || [],
      reservas_usuario: itensData.reservas_usuario || [],
      filas_espera: itensData.filas_espera || {},
      taxaTransacao: 5
    };
  }, [itensData]);

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
          title: "Entrou na fila! ⏳", 
          description: `Você está na posição ${result.posicao} da fila.`
        });
      }

      setActionStates(prev => ({ ...prev, [itemId]: 'success' }));
      
      // Recarregar itens para atualizar dados
      const { data: novosItens } = await supabase
        .rpc('carregar_itens_usuario_especifico', { 
          p_user_id: user.id,
          p_target_user_id: id!
        });
      
      if (novosItens?.success) {
        setItensData(novosItens);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao entrar na fila:', error);
      setActionStates(prev => ({ ...prev, [itemId]: 'error' }));
      return false;
    }
  };

  const toggleFavorito = async (itemId: string) => {
    if (!user) return;
    
    try {
      const isFavorito = itensData?.favoritos.includes(itemId);
      
      if (isFavorito) {
        const { error } = await supabase
          .from('favoritos')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', itemId);

        if (error) throw error;
        
        toast({
          title: "Removido dos favoritos 💔",
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
          title: "Adicionado aos favoritos ❤️",
          description: "Item adicionado à sua lista de desejos.",
        });
      }
      
      // Recarregar dados
      const { data: novosItens } = await supabase
        .rpc('carregar_itens_usuario_especifico', { 
          p_user_id: user.id,
          p_target_user_id: id!
        });
      
      if (novosItens?.success) {
        setItensData(novosItens);
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
  const itensDisponiveis = itensData?.itens.filter(item => item.status === 'disponivel') || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-24">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* ✅ Botão Voltar */}
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
          {/* ✅ Perfil da Mãe */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white shadow-lg">
                  <AvatarImage src={profile.avatar_url || undefined} alt={nomeCompleto} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-2xl font-bold">
                    {profile.nome?.split(' ').map(n => n[0]).join('') || 'M'}
                  </AvatarFallback>
                </Avatar>
                
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {nomeCompleto}
                </h1>
                
                {/* ✅ Avaliação */}
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

                {/* ✅ Botão Seguir */}
                {user?.id !== id && (
                  <BotaoSeguir usuarioId={id!} className="w-full mb-4" />
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* ✅ Bio */}
                {profile.bio && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Sobre</h3>
                    <p className="text-gray-600 text-sm">{profile.bio}</p>
                  </div>
                )}

                {/* ✅ Localização */}
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm">
                    {profile.cidade && profile.estado 
                      ? `${profile.cidade}, ${profile.estado}`
                      : 'Localização não informada'
                    }
                  </span>
                </div>

                {/* ✅ Idade */}
                {profile?.data_nascimento && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-sm">{calcularIdade(profile.data_nascimento)} anos</span>
                  </div>
                )}

                {/* ✅ Estatísticas */}
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
                      <span className="font-bold">{itensDisponiveis.length}</span>
                    </div>
                    <p className="text-xs text-gray-500">Itens ativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ✅ Itens da Mãe */}
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
                ) : !itensData || itensDisponiveis.length === 0 ? (
                  <EmptyState
                    icon={<Package className="w-16 h-16 text-purple-400" />}
                    title="Nenhum item disponível"
                    description="Este usuário não tem itens disponíveis no momento"
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {itensDisponiveis.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={{
                          ...item,
                          publicado_por_profile: item.publicado_por_profile,
                          mesma_escola: item.escola_comum || false
                        }}
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
