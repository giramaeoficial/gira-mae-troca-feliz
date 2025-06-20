
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MessageCircle, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservaId?: string;
  outraMae?: {
    nome: string;
    avatar: string;
  };
  item?: {
    titulo: string;
    imagem: string;
  };
}

const ChatModal = ({ isOpen, onClose, reservaId, outraMae, item }: ChatModalProps) => {
  const { user } = useAuth();
  const { mensagens, loading, enviandoMensagem, enviarMensagem } = useChat(reservaId);
  const [novaMensagem, setNovaMensagem] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  const handleEnviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaMensagem.trim() || enviandoMensagem) return;

    const sucesso = await enviarMensagem(novaMensagem);
    if (sucesso) {
      setNovaMensagem("");
    }
  };

  const formatarHora = (dateString: string) => {
    return format(new Date(dateString), "HH:mm", { locale: ptBR });
  };

  const formatarData = (dateString: string) => {
    const hoje = new Date();
    const dataMensagem = new Date(dateString);
    
    if (dataMensagem.toDateString() === hoje.toDateString()) {
      return "Hoje";
    }
    
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);
    if (dataMensagem.toDateString() === ontem.toDateString()) {
      return "Ontem";
    }
    
    return format(dataMensagem, "dd/MM", { locale: ptBR });
  };

  // Agrupar mensagens por data
  const mensagensAgrupadas = mensagens.reduce((grupos: any[], mensagem) => {
    const data = formatarData(mensagem.created_at);
    const ultimoGrupo = grupos[grupos.length - 1];
    
    if (ultimoGrupo && ultimoGrupo.data === data) {
      ultimoGrupo.mensagens.push(mensagem);
    } else {
      grupos.push({
        data,
        mensagens: [mensagem]
      });
    }
    
    return grupos;
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[600px] flex flex-col p-0">
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-primary" />
            <div className="flex-grow">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={outraMae?.avatar} />
                  <AvatarFallback className="text-xs">
                    {outraMae?.nome?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-800">{outraMae?.nome || 'Nova Conversa'}</p>
                  {item && <p className="text-xs text-gray-500">sobre: {item.titulo}</p>}
                </div>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-grow flex flex-col overflow-hidden">
          {/* Área de mensagens */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Carregando conversa...</p>
              </div>
            ) : mensagensAgrupadas.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">Nenhuma mensagem ainda</p>
                <p className="text-sm text-gray-500">
                  Envie a primeira mensagem para iniciar a conversa!
                </p>
              </div>
            ) : (
              mensagensAgrupadas.map((grupo, grupoIndex) => (
                <div key={grupoIndex}>
                  {/* Separador de data */}
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                      {grupo.data}
                    </div>
                  </div>
                  
                  {/* Mensagens do dia */}
                  <div className="space-y-3">
                    {grupo.mensagens.map((mensagem: any) => {
                      const isMinhas = mensagem.remetente_id === user?.id;
                      return (
                        <div
                          key={mensagem.id}
                          className={`flex ${isMinhas ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[75%] ${isMinhas ? 'order-1' : 'order-2'}`}>
                            <div
                              className={`rounded-2xl px-3 py-2 ${
                                isMinhas
                                  ? 'bg-primary text-white'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <p className="text-sm">{mensagem.conteudo}</p>
                            </div>
                            <div className={`flex items-center gap-1 mt-1 ${isMinhas ? 'justify-end' : 'justify-start'}`}>
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-400">
                                {formatarHora(mensagem.created_at)}
                              </span>
                            </div>
                          </div>
                          
                          {!isMinhas && (
                            <Avatar className="w-6 h-6 order-1 mr-2 mt-1">
                              <AvatarImage src={mensagem.remetente?.avatar_url || outraMae?.avatar} />
                              <AvatarFallback className="text-xs">
                                {mensagem.remetente?.nome?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Área de envio */}
          <div className="border-t p-4">
            <form onSubmit={handleEnviarMensagem} className="flex gap-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
                disabled={enviandoMensagem}
                className="flex-grow"
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={!novaMensagem.trim() || enviandoMensagem}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              💡 Combine local e horário para a troca do item
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatModal;
