
import { useState } from "react";
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
import { Search, MessageCircle, Plus, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useChat } from "@/hooks/useChat";
import { useUserSearch } from "@/hooks/useUserSearch";

const Mensagens = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [showNovaConversa, setShowNovaConversa] = useState(false);
  const [searchUsername, setSearchUsername] = useState("");

  const { users: searchResults } = useUserSearch(searchUsername);

  // Hook do chat - só ativo quando há um usuário selecionado
  const { 
    mensagens, 
    loading: chatLoading, 
    enviandoMensagem, 
    enviarMensagem 
  } = useChat(undefined, selectedUser || undefined);

  // Mock data para demonstração da lista de conversas
  const conversas = [
    {
      id: "1",
      participante: {
        id: "user1",
        nome: "Maria Silva",
        username: "maria_silva",
        avatar_url: null,
      },
      ultimaMensagem: "Oi! Ainda tem aquele vestido disponível?",
      timestamp: "2 min",
      naoLidas: 2,
    },
    {
      id: "2", 
      participante: {
        id: "user2",
        nome: "Ana Santos",
        username: "ana_santos",
        avatar_url: null,
      },
      ultimaMensagem: "Obrigada pela troca! Minha filha adorou o brinquedo!",
      timestamp: "1h",
      naoLidas: 0,
    }
  ];

  const filteredConversas = conversas.filter(conversa =>
    conversa.participante.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversa.participante.username.toLowerCase().includes(searchTerm.toLowerCase())
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
    setShowNovaConversa(false);
    setSearchUsername("");
  };

  // Vista de conversa individual
  if (selectedUser) {
    const participante = searchResults.find(u => u.id === selectedUser) || 
      conversas.find(c => c.participante.id === selectedUser)?.participante;

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header activePage="mensagens" />
        
        {/* Header da conversa */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedUser(null)}
                className="md:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <Avatar className="h-10 w-10">
                <AvatarImage src={participante?.avatar_url || undefined} />
                <AvatarFallback>
                  {participante?.nome?.charAt(0) || participante?.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h2 className="font-medium">{participante?.nome}</h2>
                <p className="text-sm text-gray-500">@{participante?.username}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 container mx-auto max-w-4xl p-4 space-y-4 overflow-y-auto">
          {chatLoading ? (
            <div className="flex justify-center">
              <div className="text-gray-500">Carregando mensagens...</div>
            </div>
          ) : (
            mensagens.map((mensagem) => (
              <div
                key={mensagem.id}
                className={`flex ${mensagem.remetente_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    mensagem.remetente_id === user?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <MessageText 
                    className={`text-sm ${mensagem.remetente_id === user?.id ? 'text-primary-foreground' : ''}`}
                  >
                    {mensagem.conteudo}
                  </MessageText>
                  <p className={`text-xs mt-1 ${
                    mensagem.remetente_id === user?.id ? 'text-primary-foreground/70' : 'text-gray-500'
                  }`}>
                    {new Date(mensagem.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input de nova mensagem com suporte a menções */}
        <div className="bg-white border-t border-gray-200 p-4 pb-24 md:pb-4">
          <div className="container mx-auto max-w-4xl">
            <MentionInput
              value={novaMensagem}
              onChange={setNovaMensagem}
              onSubmit={handleEnviarMensagem}
              placeholder="Digite sua mensagem... Use @ para mencionar alguém"
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
    <div className="min-h-screen bg-gray-50">
      <Header activePage="mensagens" />
      
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Mensagens</h1>
            <p className="text-gray-600">
              Converse diretamente com outras mães da comunidade
            </p>
          </div>

          {/* Barra de busca e botão nova conversa */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              className="flex items-center gap-2"
              onClick={() => setShowNovaConversa(true)}
            >
              <Plus className="h-4 w-4" />
              Nova Conversa
            </Button>
          </div>

          {/* Lista de conversas */}
          <div className="space-y-3">
            {filteredConversas.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageCircle className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda"}
                  </h3>
                  <p className="text-gray-500 text-center max-w-md">
                    {searchTerm 
                      ? "Tente buscar por outro nome"
                      : "Comece uma conversa com outras mães da comunidade para trocar itens e experiências!"
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredConversas.map((conversa) => (
                <Card 
                  key={conversa.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedUser(conversa.participante.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conversa.participante.avatar_url || undefined} />
                        <AvatarFallback>
                          {conversa.participante.nome.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {conversa.participante.nome}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {conversa.timestamp}
                            </span>
                            {conversa.naoLidas > 0 && (
                              <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                                {conversa.naoLidas}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {conversa.ultimaMensagem}
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
                <CardHeader>
                  <CardTitle>Nova Conversa</CardTitle>
                  <CardDescription>
                    Procure por uma mãe da comunidade para conversar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Digite o nome da mãe..."
                      value={searchUsername}
                      onChange={(e) => setSearchUsername(e.target.value)}
                      className="pl-10"
                    />
                    {searchUsername.length > 2 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-md mt-1 max-h-48 overflow-y-auto z-50">
                        {searchResults.length > 0 ? (
                          searchResults.map((user) => (
                            <button
                              key={user.id}
                              className="w-full text-left p-2 hover:bg-gray-100 flex items-center gap-2"
                              onClick={() => handleIniciarConversa(user.id)}
                            >
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={user.avatar_url || undefined} />
                                <AvatarFallback>{user.nome?.charAt(0) || user.username?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span>{user.nome} (@{user.username})</span>
                            </button>
                          ))
                        ) : (
                          <div className="text-gray-500 p-2">Nenhum resultado encontrado.</div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowNovaConversa(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Informação sobre mensagens livres */}
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 text-lg">
                💬 Mensagens Liberadas
              </CardTitle>
              <CardDescription className="text-blue-700">
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
