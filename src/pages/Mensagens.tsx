import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/shared/Header";
import QuickNav from "@/components/shared/QuickNav";
import MentionInput from "@/components/mensagens/MentionInput";
import MessageText from "@/components/mensagens/MessageText";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, MessageCircle, Plus, ArrowLeft, Package, Sparkles, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useChat } from "@/hooks/useChat";
import { useUserSearch } from "@/hooks/useUserSearch";
import { useConversas } from "@/hooks/useConversas";
import { getImageUrl } from "@/utils/supabaseStorage";

const Mensagens = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedReservaId, setSelectedReservaId] = useState<string | null>(null);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [showNovaConversa, setShowNovaConversa] = useState(false);
  const [searchUsername, setSearchUsername] = useState("");

  const { users: searchResults, searchUsers } = useUserSearch();
  const { conversas, loading: conversasLoading } = useConversas();

  // Buscar usuários quando o termo de busca muda
  useEffect(() => {
    if (searchUsername.length >= 2) {
      searchUsers(searchUsername);
    }
  }, [searchUsername, searchUsers]);

  // Hook do chat - ativo quando há um usuário selecionado
  const { 
    mensagens, 
    loading: chatLoading, 
    enviandoMensagem, 
    enviarMensagem 
  } = useChat(selectedReservaId || undefined, selectedUser || undefined);

  const filteredConversas = conversas.filter(conversa =>
    conversa.participante.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversa.participante.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conversa.item?.titulo && conversa.item.titulo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEnviarMensagem = async () => {
    if (!novaMensagem.trim()) return;
    
    const sucesso = await enviarMensagem(novaMensagem);
    if (sucesso) {
      setNovaMensagem("");
    }
  };

  const handleIniciarConversa = (userId: string) => {
    setSelectedUser(userId);
    setSelectedReservaId(null);
    setShowNovaConversa(false);
    setSearchUsername("");
  };

  const handleAbrirConversa = (conversa: any) => {
    setSelectedUser(conversa.participante.id);
    setSelectedReservaId(conversa.reserva_id);
  };

  const handleFecharConversa = () => {
    setSelectedUser(null);
    setSelectedReservaId(null);
  };

  const formatarTempo = (dataString: string) => {
    const data = new Date(dataString);
    const agora = new Date();
    const diffMs = agora.getTime() - data.getTime();
    const diffMinutos = Math.floor(diffMs / (1000 * 60));
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutos < 1) return 'agora';
    if (diffMinutos < 60) return `${diffMinutos}min`;
    if (diffHoras < 24) return `${diffHoras}h`;
    if (diffDias < 7) return `${diffDias}d`;
    return data.toLocaleDateString();
  };

  // Vista de conversa individual
  if (selectedUser) {
    const participante = searchResults.find(u => u.id === selectedUser) || 
      conversas.find(c => c.participante.id === selectedUser)?.participante;

    const conversaAtual = conversas.find(c => 
      c.participante.id === selectedUser && 
      (!selectedReservaId || c.reserva_id === selectedReservaId)
    );

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header activePage="mensagens" />
        
        {/* Header da conversa */}
        <div className="bg-card border-b border-border px-4 py-3">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleFecharConversa}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <Avatar className="h-10 w-10">
                <AvatarImage src={participante?.avatar_url || undefined} />
                <AvatarFallback>
                  {participante?.nome?.charAt(0) || participante?.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-sm truncate">{participante?.nome}</h2>
                <p className="text-xs text-muted-foreground">@{participante?.username}</p>
              </div>
            </div>

            {/* Mostrar item se conversa for de reserva */}
            {conversaAtual?.item && (
              <div className="flex items-center gap-2 mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Package className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {conversaAtual.item.fotos?.[0] && (
                    <img 
                      src={getImageUrl('itens', conversaAtual.item.fotos[0], 'thumbnail')}
                      alt={conversaAtual.item.titulo}
                      className="w-8 h-8 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-blue-900 truncate">
                      {conversaAtual.item.titulo}
                    </p>
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                      <span className="text-xs text-blue-700">
                        {conversaAtual.item.valor_girinhas} Girinhas
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 container mx-auto max-w-4xl p-4 space-y-3 overflow-y-auto">
          {chatLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground text-sm">Carregando mensagens...</div>
            </div>
          ) : mensagens.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Nenhuma mensagem ainda</p>
              <p className="text-xs text-muted-foreground mt-1">Comece a conversa!</p>
            </div>
          ) : (
            mensagens.map((mensagem) => (
              <div
                key={mensagem.id}
                className={`flex ${mensagem.remetente_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] lg:max-w-md px-3 py-2 rounded-lg ${
                    mensagem.remetente_id === user?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted border border-border'
                  }`}
                >
                  <MessageText 
                    className={`text-sm ${mensagem.remetente_id === user?.id ? 'text-primary-foreground' : 'text-foreground'}`}
                  >
                    {mensagem.conteudo}
                  </MessageText>
                  <p className={`text-xs mt-1 ${
                    mensagem.remetente_id === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {new Date(mensagem.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input de nova mensagem */}
        <div className="bg-card border-t border-border p-4 pb-24 md:pb-4">
          <div className="container mx-auto max-w-4xl">
            <MentionInput
              value={novaMensagem}
              onChange={setNovaMensagem}
              onSubmit={handleEnviarMensagem}
              placeholder="Digite sua mensagem..."
              disabled={enviandoMensagem}
            />
          </div>
        </div>

        <QuickNav />
      </div>
    );
  }

  // Vista principal das mensagens
  return (
    <div className="min-h-screen bg-background">
      <Header activePage="mensagens" />
      
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Mensagens</h1>
            <p className="text-muted-foreground">
              Converse diretamente com outras mães da comunidade
            </p>
          </div>

          {/* Barra de busca e botão nova conversa */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              className="flex items-center gap-2 px-3 md:px-4"
              onClick={() => setShowNovaConversa(true)}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nova</span>
            </Button>
          </div>

          {/* Lista de conversas */}
          <div className="space-y-3">
            {conversasLoading ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-muted-foreground">Carregando conversas...</div>
                </CardContent>
              </Card>
            ) : filteredConversas.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {searchTerm ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda"}
                  </h3>
                  <p className="text-muted-foreground text-center max-w-md text-sm">
                    {searchTerm 
                      ? "Tente buscar por outro nome ou item"
                      : "Comece uma conversa com outras mães da comunidade para trocar itens e experiências!"
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredConversas.map((conversa) => (
                <Card 
                  key={conversa.id} 
                  className="cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
                  onClick={() => handleAbrirConversa(conversa)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage src={conversa.participante.avatar_url || undefined} />
                        <AvatarFallback>
                          {conversa.participante.nome.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-foreground truncate text-sm">
                            {conversa.participante.nome}
                          </h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-muted-foreground">
                              {conversa.ultimaMensagem ? formatarTempo(conversa.ultimaMensagem.created_at) : formatarTempo(conversa.created_at)}
                            </span>
                            {conversa.naoLidas > 0 && (
                              <Badge variant="default" className="h-5 min-w-5 px-1.5 flex items-center justify-center text-xs">
                                {conversa.naoLidas > 99 ? '99+' : conversa.naoLidas}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Tipo de conversa */}
                        {conversa.item ? (
                          <div className="flex items-center gap-2 mb-1">
                            <Package className="h-3 w-3 text-blue-600 flex-shrink-0" />
                            <span className="text-xs text-blue-600 font-medium truncate">
                              {conversa.item.titulo}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Sparkles className="w-3 h-3 text-yellow-500" />
                              <span className="text-xs text-muted-foreground">
                                {conversa.item.valor_girinhas}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 mb-1">
                            <MessageCircle className="h-3 w-3 text-purple-600 flex-shrink-0" />
                            <span className="text-xs text-purple-600 font-medium">
                              Conversa livre
                            </span>
                          </div>
                        )}
                        
                        <p className="text-sm text-muted-foreground truncate">
                          {conversa.ultimaMensagem ? conversa.ultimaMensagem.conteudo : 'Conversa iniciada'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Modal para nova conversa */}
          {showNovaConversa && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Nova Conversa</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowNovaConversa(false)}
                      className="p-1 h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    Procure por uma mãe da comunidade para conversar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Digite o nome da mãe..."
                      value={searchUsername}
                      onChange={(e) => setSearchUsername(e.target.value)}
                      className="pl-10"
                    />
                    {searchUsername.length > 2 && (
                      <div className="absolute top-full left-0 right-0 bg-card border border-border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto z-50">
                        {searchResults.length > 0 ? (
                          searchResults.map((user) => (
                            <button
                              key={user.id}
                              className="w-full text-left p-3 hover:bg-muted/50 flex items-center gap-3 transition-colors"
                              onClick={() => handleIniciarConversa(user.id)}
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar_url || undefined} />
                                <AvatarFallback className="text-xs">
                                  {user.nome?.charAt(0) || user.username?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-sm truncate">{user.nome}</p>
                                <p className="text-xs text-muted-foreground">@{user.username}</p>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="text-muted-foreground p-3 text-sm text-center">
                            Nenhum resultado encontrado
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Card informativo */}
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-900 text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Mensagens Liberadas
              </CardTitle>
              <CardDescription className="text-blue-700 text-sm">
                No GiraMãe, você pode conversar livremente com qualquer mãe da comunidade, 
                mesmo sem ter uma troca ativa. Conecte-se, tire dúvidas e construa relacionamentos!
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      <QuickNav />
    </div>
  );
};

export default Mensagens;
