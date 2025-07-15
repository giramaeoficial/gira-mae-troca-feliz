import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Package, 
  UserX, 
  Eye, 
  Star, 
  Clock, 
  Users,
  Calendar,
  Truck,
  User,
  TrendingUp
} from 'lucide-react';

interface MaeSeguidaProfile {
  id: string;
  nome: string;
  sobrenome?: string;
  avatar_url?: string;
  bio?: string;
  cidade?: string;
  estado?: string;
  bairro?: string;
  data_nascimento?: string;
  reputacao: number;
  interesses?: string[];
  created_at: string;
  last_seen_at?: string;
  aceita_entrega_domicilio: boolean;
  raio_entrega_km?: number;
  estatisticas: {
    total_itens: number;
    itens_ativos: number;
    itens_disponiveis: number;
    total_seguidores: number;
    total_seguindo: number;
    avaliacoes_recebidas: number;
    media_avaliacao: number;
    ultima_atividade?: string;
    membro_desde: string;
    distancia_km?: number;
  };
  itens_recentes: Array<{
    id: string;
    titulo: string;
    categoria: string;
    valor_girinhas: number;
    fotos: string[];
    status: string;
    created_at: string;
  }>;
  escola_comum: boolean;
  logistica: {
    entrega_disponivel: boolean;
    busca_disponivel: boolean;
  };
}

interface MaeSeguidaCardProps {
  mae: MaeSeguidaProfile;
  onUnfollow?: (maeId: string) => void;
  onViewProfile?: (maeId: string) => void;
  showUnfollowButton?: boolean;
}

const MaeSeguidaCard: React.FC<MaeSeguidaCardProps> = ({ 
  mae, 
  onUnfollow, 
  onViewProfile,
  showUnfollowButton = true 
}) => {
  const navigate = useNavigate();

  const formatLastActivity = (timestamp: string | null) => {
    if (!timestamp) return 'Nunca vista';
    
    const now = new Date();
    const activity = new Date(timestamp);
    const diffMs = now.getTime() - activity.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Ativa hoje';
    if (diffDays === 1) return 'Ativa ontem';
    if (diffDays < 7) return `Ativa há ${diffDays} dias`;
    if (diffDays < 30) return `Ativa há ${Math.floor(diffDays / 7)} semanas`;
    return `Ativa há ${Math.floor(diffDays / 30)} meses`;
  };

  const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const formatarNomeCompleto = (nome?: string, sobrenome?: string) => {
    if (!nome) return 'Usuário';
    return sobrenome ? `${nome} ${sobrenome}` : nome;
  };

  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(mae.id);
    } else {
      navigate(`/perfil/${mae.id}`);
    }
  };

  const handleUnfollow = () => {
    if (onUnfollow) {
      onUnfollow(mae.id);
    }
  };

  const stats = mae.estatisticas;
  const nomeCompleto = formatarNomeCompleto(mae.nome, mae.sobrenome);

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-200 hover:scale-[1.02] overflow-hidden">
      <CardHeader className="text-center pb-4 relative">
        {/* Badges de destaque */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {mae.escola_comum && (
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              🏫 Mesma escola
            </Badge>
          )}
          {mae.logistica.entrega_disponivel && (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              <Truck className="w-3 h-3 mr-1" />
              Entrega
            </Badge>
          )}
          {stats.distancia_km && stats.distancia_km <= 5 && (
            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
              📍 {stats.distancia_km}km
            </Badge>
          )}
        </div>

        <div className="flex flex-col items-center">
          <Avatar className="w-20 h-20 mb-4 border-2 border-purple-200">
            <AvatarImage src={mae.avatar_url || undefined} alt={nomeCompleto} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
              {mae.nome?.split(' ').map(n => n[0]).join('') || 'M'}
            </AvatarFallback>
          </Avatar>
          
          <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
            {nomeCompleto}
          </h3>
          
          {/* Avaliação */}
          <div className="flex items-center gap-1 mb-4">
            {[1,2,3,4,5].map((star) => (
              <Star 
                key={star} 
                className={`w-4 h-4 ${
                  star <= Math.floor(stats.media_avaliacao || 0) 
                    ? 'fill-current text-yellow-500' 
                    : 'text-gray-300'
                }`} 
              />
            ))}
            <span className="text-sm text-gray-600 ml-1">
              ({(stats.media_avaliacao || 0).toFixed(1)})
            </span>
            {stats.avaliacoes_recebidas > 0 && (
              <span className="text-xs text-gray-500">
                · {stats.avaliacoes_recebidas} avaliações
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Bio */}
        {mae.bio && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-2 text-sm">Sobre</h4>
            <p className="text-gray-600 text-sm line-clamp-2">{mae.bio}</p>
          </div>
        )}

        {/* Informações básicas */}
        <div className="space-y-2">
          {/* Localização */}
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm">
              {mae.cidade 
                ? `${mae.cidade}, ${mae.estado || 'BR'}`
                : 'Localização não informada'
              }
            </span>
          </div>

          {/* Idade */}
          {mae.data_nascimento && (
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm">{calcularIdade(mae.data_nascimento)} anos</span>
            </div>
          )}

          {/* Última atividade */}
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm">
              {formatLastActivity(stats.ultima_atividade)}
            </span>
          </div>
        </div>

        {/* Estatísticas em grid 2x2 */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600">
              <Users className="w-4 h-4" />
              <span className="font-bold">{stats.total_seguidores}</span>
            </div>
            <p className="text-xs text-gray-500">Seguidores</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600">
              <Package className="w-4 h-4" />
              <span className="font-bold">{stats.itens_disponiveis}</span>
            </div>
            <p className="text-xs text-gray-500">Disponíveis</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600">
              <TrendingUp className="w-4 h-4" />
              <span className="font-bold">{stats.total_itens}</span>
            </div>
            <p className="text-xs text-gray-500">Total itens</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600">
              <Star className="w-4 h-4" />
              <span className="font-bold">{(stats.media_avaliacao || 0).toFixed(1)}</span>
            </div>
            <p className="text-xs text-gray-500">Avaliação</p>
          </div>
        </div>

        {/* Itens recentes - apenas fotos pequenas */}
        {mae.itens_recentes && mae.itens_recentes.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-2 text-sm">Itens Recentes</h4>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {mae.itens_recentes.slice(0, 4).map((item) => (
                <div key={item.id} className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={item.fotos[0] || '/placeholder-item.jpg'}
                      alt={item.titulo}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ))}
              {mae.itens_recentes.length > 4 && (
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <span className="text-xs text-gray-500">+{mae.itens_recentes.length - 4}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewProfile}
            className="flex-1 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Ver Perfil
          </Button>
          
          {showUnfollowButton && onUnfollow && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleUnfollow}
              className="flex items-center gap-2"
            >
              <UserX className="w-4 h-4" />
              Deixar de Seguir
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MaeSeguidaCard;