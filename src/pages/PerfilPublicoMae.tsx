import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/shared/Header";
import QuickNav from "@/components/shared/QuickNav";
import BotaoSeguir from "@/components/perfil/BotaoSeguir";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MapPin, Star, Calendar, Users, Package, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import LazyImage from "@/components/ui/lazy-image";

type Profile = Tables<'profiles'>;
type Item = Tables<'itens'>;

const PerfilPublicoMae = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [itens, setItens] = useState<Item[]>([]);
  const [estatisticas, setEstatisticas] = useState({ total_seguindo: 0, total_seguidores: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        
        // Buscar itens do usuário
        const { data: itensData, error: itensError } = await supabase
          .from('itens')
          .select('*')
          .eq('publicado_por', profileData.id)
          .eq('status', 'disponivel')
          .order('created_at', { ascending: false });

        if (itensError) {
          console.error('Erro ao buscar itens:', itensError);
        } else {
          setItens(itensData || []);
        }
        
        // Buscar estatísticas de seguidores
        const { data: statsData, error: statsError } = await supabase
          .rpc('obter_estatisticas_seguidor', { p_usuario_id: profileData.id });

        if (statsError) {
          console.error('Erro ao buscar estatísticas:', statsError);
        } else {
          setEstatisticas(statsData?.[0] || { total_seguindo: 0, total_seguidores: 0 });
        }
        
      } catch (error) {
        console.error('Erro ao carregar dados do perfil:', error);
        setError('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [id]);

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

  const formatarCategoria = (categoria: string) => {
    const categorias = {
      'roupa': 'Roupas',
      'brinquedo': 'Brinquedos',
      'calcado': 'Calçados',
      'acessorio': 'Acessórios',
      'kit': 'Kits',
      'outro': 'Outros'
    };
    return categorias[categoria as keyof typeof categorias] || categoria;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Perfil da Mãe */}
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
                    {profile?.bairro && profile?.cidade 
                      ? `${profile.bairro}, ${profile.cidade}`
                      : profile?.cidade || 'Localização não informada'
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

                {profile?.interesses && profile.interesses.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Interesses</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interesses.map((interesse, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {interesse}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Itens da Mãe */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Itens disponíveis ({itens.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {itens.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum item disponível no momento</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {itens.map((item) => (
                      <Card key={item.id} className="border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
                        <Link to={`/item/${item.id}`}>
                          <div className="aspect-square relative overflow-hidden rounded-t-lg">
                            <LazyImage
                              src={item.fotos?.[0] || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400"}
                              alt={item.titulo}
                              bucket="itens"
                              size="medium"
                              className="w-full h-full object-cover"
                              placeholder="📷"
                              onError={() => console.error('Erro ao carregar imagem do item:', item.id)}
                            />
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-green-500 text-white text-xs">
                                Disponível
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">
                              {item.titulo}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {item.descricao}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {formatarCategoria(item.categoria)}
                              </Badge>
                              <div className="flex items-center gap-1 text-primary font-bold">
                                <Heart className="w-3 h-3" />
                                {item.valor_girinhas}
                              </div>
                            </div>
                          </CardContent>
                        </Link>
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
