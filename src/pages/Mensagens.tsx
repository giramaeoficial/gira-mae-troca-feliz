
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/shared/Header";
import QuickNav from "@/components/shared/QuickNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, MessageCircle, Plus, Send } from "lucide-react";

const Mensagens = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data para demonstração
  const conversas = [
    {
      id: "1",
      participante: {
        nome: "Maria Silva",
        avatar: null,
      },
      ultimaMensagem: "Oi! Ainda tem aquele vestido disponível?",
      timestamp: "2 min",
      naoLidas: 2,
    },
    {
      id: "2",
      participante: {
        nome: "Ana Santos",
        avatar: null,
      },
      ultimaMensagem: "Obrigada pela troca! Minha filha adorou o brinquedo!",
      timestamp: "1h",
      naoLidas: 0,
    },
    {
      id: "3",
      participante: {
        nome: "Carla Lima",
        avatar: null,
      },
      ultimaMensagem: "Podemos combinar a entrega para amanhã?",
      timestamp: "3h",
      naoLidas: 1,
    },
  ];

  const filteredConversas = conversas.filter(conversa =>
    conversa.participante.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <Button className="flex items-center gap-2">
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
                <Card key={conversa.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conversa.participante.avatar || undefined} />
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
