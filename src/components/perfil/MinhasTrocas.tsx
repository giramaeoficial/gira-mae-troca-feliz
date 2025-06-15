
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, Star, ArrowUpRight, ArrowDownLeft, Calendar, MessageCircle, Trophy } from "lucide-react";
import { useTrocas } from "@/hooks/useTrocas";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const MinhasTrocas = () => {
  const { user } = useAuth();
  const { trocas, loading, getTotalTrocas, getTotalGirinhasRecebidas, getTotalGirinhasGastas, getMediaAvaliacoes } = useTrocas();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Sparkles className="h-8 w-8 text-primary animate-spin" />
        <span className="ml-2 text-gray-600">Carregando trocas...</span>
      </div>
    );
  }

  if (trocas.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhuma troca realizada ainda</h3>
          <p className="text-gray-600 mb-4">
            Suas trocas concluídas aparecerão aqui. Comece explorando os itens disponíveis!
          </p>
        </CardContent>
      </Card>
    );
  }

  const estatisticas = [
    {
      titulo: "Total de Trocas",
      valor: getTotalTrocas(),
      icone: Trophy,
      cor: "text-blue-600"
    },
    {
      titulo: "Girinhas Recebidas", 
      valor: getTotalGirinhasRecebidas(),
      icone: ArrowDownLeft,
      cor: "text-green-600"
    },
    {
      titulo: "Girinhas Gastas",
      valor: getTotalGirinhasGastas(), 
      icone: ArrowUpRight,
      cor: "text-red-600"
    },
    {
      titulo: "Avaliação Média",
      valor: getMediaAvaliacoes().toFixed(1),
      icone: Star,
      cor: "text-yellow-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {estatisticas.map((stat, index) => (
          <Card key={index} className="bg-white/60 backdrop-blur-sm border-0">
            <CardContent className="p-4 text-center">
              <stat.icone className={`w-6 h-6 mx-auto mb-2 ${stat.cor}`} />
              <p className="text-2xl font-bold text-gray-800">{stat.valor}</p>
              <p className="text-xs text-gray-600">{stat.titulo}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lista de Trocas */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Histórico de Trocas ({trocas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trocas.map((troca) => {
              const isVendedor = troca.usuario_item === user?.id;
              const outraPessoa = isVendedor ? troca.profiles_reservador : troca.profiles_vendedor;
              const imagemItem = troca.itens?.fotos?.[0] || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=200";
              
              return (
                <div key={troca.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4 flex-grow">
                    {/* Imagem do Item */}
                    <img 
                      src={imagemItem} 
                      alt={troca.itens?.titulo || "Item"}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    
                    {/* Detalhes da Troca */}
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-800">
                          {troca.itens?.titulo || "Item não encontrado"}
                        </h4>
                        <Badge variant={isVendedor ? "default" : "secondary"}>
                          {isVendedor ? "Vendeu" : "Comprou"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={outraPessoa?.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {outraPessoa?.nome?.split(' ').map(n => n[0]).join('') || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span>{isVendedor ? 'Para' : 'De'} {outraPessoa?.nome || 'Usuário'}</span>
                        <span>•</span>
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(troca.updated_at), "dd 'de' MMM", { locale: ptBR })}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Valor e Avaliação */}
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className={`font-semibold ${isVendedor ? 'text-green-600' : 'text-red-600'}`}>
                        {isVendedor ? '+' : '-'}{troca.valor_girinhas}
                      </span>
                    </div>
                    
                    {/* Mostrar avaliações se houver */}
                    {troca.avaliacoes && troca.avaliacoes.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{troca.avaliacoes[0].rating}/5</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MinhasTrocas;
