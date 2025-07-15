// src/pages/PerfilPublicoMae.tsx - VERSÃO SIMPLIFICADA E COMPATÍVEL
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  MapPin, 
  Users, 
  Package, 
  Calendar,
  Star,
  ArrowLeft,
  Heart,
  ShoppingCart
} from 'lucide-react';

const PerfilPublicoMae = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [itens, setItens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Função simplificada para carregar dados
  const carregarDados = useCallback(async () => {
    if (!id || !user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Buscar perfil
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

      // ✅ Buscar itens usando a RPC se existir, senão usar query simples
      try {
        // Tentar usar RPC específica
        const { data: itensRPC, error: rpcError } = await supabase
          .rpc('carregar_itens_usuario_especifico', { 
            p_user_id: user.id,
            p_target_user_id: id
          });

        if (!rpcError && itensRPC?.success) {
          setItens(itensRPC.itens || []);
        } else {
          throw new Error('RPC não disponível');
        }
      } catch (rpcError) {
        console.log('RPC não disponível, usando query direta');
        
        // Fallback para query direta
        const { data: itensData, error: itensError } = await supabase
          .from('itens')
          .select(`
            *,
            publicado_por_profile:profiles!publicado_por(nome, avatar_url, reputacao)
          `)
          .eq('publicado_por', id)
          .in('status', ['disponivel', 'reservado'])
          .order('created_at', { ascending: false });

        if (itensError) {
          console.error('Erro ao buscar itens:', itensError);
        } else {
          setItens(itensData || []);
        }
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  }, [id, user?.id]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

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

  const handleToggleFavorito = async (itemId: string) => {
    if (!user) return;
    
    try {
      // Verificar se já é favorito
      const { data: favoritoExistente } = await supabase
        .from('favoritos')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .single();

      if (favoritoExistente) {
        // Remover favorito
        await supabase
          .from('favoritos')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', itemId);
        
        toast({
          title: "Removido dos favoritos 💔",
          description: "Item removido da sua lista de desejos.",
        });
      } else {
        // Adicionar favorito
        await supabase
          .from('favoritos')
          .insert({
            user_id: user.id,
            item_id: itemId
          });
        
        toast({
          title: "Adicionado aos favoritos ❤️",
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
    if (!user) return;
    
    try {
      const item = itens.find(i => i.id === itemId);
      if (!item) return;

      const { data, error } = await supabase
        .rpc('entrar_fila_espera', { 
          p_item_id: itemId, 
          p_usuario_id: user.id,
          p_valor_girinhas: item.valor_girinhas
        });

      if (error) {
        toast({ 
          title: "Erro ao reservar", 
          description: error.message, 
          variant: "destructive" 
        });
        return;
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
      
    } catch (error) {
      console.error('Erro ao reservar item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível reservar o item.",
        variant: "destructive",
      });
    }
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
  const itensDisponiveis = itens.filter(item => item.status === 'disponivel');

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

          {/* Itens da Mãe */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Itens disponíveis ({itensDisponiveis.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {itensDisponiveis.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Nenhum item disponível
                    </h3>
                    <p className="text-gray-600">
                      Este usuário não tem itens disponíveis no momento
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {itensDisponiveis.map((item) => (
                      <Card key={item.id} className="border shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                        <div onClick={() => navigate(`/item/${item.id}`)}>
                          {/* Imagem do item */}
                          <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                            {item.fotos && item.fotos.length > 0 ? (
                              <img 
                                src={item.fotos[0]} 
                                alt={item.titulo}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-12 h-12 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>

                        <CardContent className="p-4">
                          <div className="space-y-2">
                            {/* Título e preço */}
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">
                                {item.titulo}
                              </h3>
                              <span className="text-lg font-bold text-purple-600 ml-2">
                                {item.valor_girinhas}💝
                              </span>
                            </div>

                            {/* Categoria e estado */}
                            <div className="flex gap-2">
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                {item.categoria}
                              </span>
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                {item.estado_conservacao}
                              </span>
                            </div>

                            {/* Ações */}
                            <div className="flex gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleFavorito(item.id);
                                }}
                                className="flex-1"
                              >
                                <Heart className="w-4 h-4 mr-2" />
                                Favoritar
                              </Button>
                              
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReservarItem(item.id);
                                }}
                                className="flex-1 bg-purple-600 hover:bg-purple-700"
                              >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Reservar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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
