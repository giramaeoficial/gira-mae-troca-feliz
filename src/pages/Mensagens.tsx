
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Search, MessageCircle, Clock, Star, Plus } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useConversas } from '@/hooks/useConversas';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/shared/Header';
import ChatModal from '@/components/chat/ChatModal';
import MessageText from '@/components/mensagens/MessageText';
import MentionInput from '@/components/mensagens/MentionInput';
import { toast } from "sonner";

const Mensagens = () => {
  const { conversaId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);

  const {
    conversas,
    conversaAtiva,
    criarConversa,
    marcarComoLida,
    isLoading: loadingConversas,
    setConversaAtiva
  } = useConversas();

  const {
    mensagens,
    enviarMensagem,
    isLoading: loadingMensagens,
    marcarMensagensComoLidas
  } = useChat(conversaId);

  useEffect(() => {
    if (mensagens && mensagens.length > 0) {
      scrollToBottom();
      if (conversaId) {
        marcarMensagensComoLidas(conversaId);
      }
    }
  }, [mensagens, conversaId, marcarMensagensComoLidas]);

  useEffect(() => {
    if (conversaId && conversas.length > 0) {
      const conversa = conversas.find(c => c.id === conversaId);
      if (conversa) {
        setConversaAtiva(conversa);
        marcarComoLida(conversa.id);
      }
    }
  }, [conversaId, conversas, marcarComoLida, setConversaAtiva]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleNovaMensagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNovaMensagem(e.target.value);
  };

  const handleEnviarMensagem = async () => {
    if (novaMensagem.trim() !== '' && conversaId) {
      await enviarMensagem(novaMensagem);
      setNovaMensagem('');
      scrollToBottom();
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleEnviarMensagem();
    }
  };

  const formatarData = (data: string) => {
    const dataObj = new Date(data);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);

    if (dataObj.toDateString() === hoje.toDateString()) {
      return format(dataObj, "'hoje às' HH:mm", { locale: ptBR });
    } else if (dataObj.toDateString() === ontem.toDateString()) {
      return format(dataObj, "'ontem às' HH:mm", { locale: ptBR });
    } else {
      return formatDistanceToNow(dataObj, { addSuffix: true, locale: ptBR });
    }
  };

  const filtrarConversas = (termo: string) => {
    setSearchTerm(termo);
  };

  const conversasFiltradas = conversas?.filter(conversa => {
    if (!searchTerm) return true;
    return conversa.participante.nome.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const renderMobile = () => {
    if (conversaId) {
      return (
        <div className="flex flex-col h-screen bg-background">
          <Header />
          
          <div className="flex items-center bg-secondary px-4 py-2 border-b">
            <Button variant="ghost" size="icon" onClick={() => navigate('/mensagens')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage src={conversaAtiva?.participante?.avatar_url || ""} />
                <AvatarFallback>{conversaAtiva?.participante?.nome?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{conversaAtiva?.participante?.nome}</div>
                <div className="text-xs text-muted-foreground">Online</div>
              </div>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-4">
            {mensagens?.map(msg => (
              <div key={msg.id} className={`mb-2 flex flex-col ${msg.remetente_id === user?.id ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-lg px-3 py-2 text-sm ${msg.remetente_id === user?.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>
                  <MessageText>{msg.conteudo}</MessageText>
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {formatarData(msg.created_at)}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="bg-secondary border-t p-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={novaMensagem}
                onChange={handleNovaMensagemChange}
                onKeyDown={handleKeyPress}
              />
              <Button onClick={handleEnviarMensagem}>
                <Send className="h-4 w-4 mr-2" />
                Enviar
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-screen bg-background">
        <Header />
        
        <div className="p-4">
          <Input
            type="search"
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => filtrarConversas(e.target.value)}
          />
        </div>

        <div className="flex-grow overflow-y-auto">
          {conversasFiltradas?.map(conversa => (
            <Card
              key={conversa.id}
              className="mb-2 border-none shadow-sm hover:bg-accent transition-colors"
              onClick={() => navigate(`/mensagens/${conversa.id}`)}
            >
              <CardContent className="flex items-center space-x-4 p-3">
                <Avatar>
                  <AvatarImage src={conversa.participante?.avatar_url || ""} />
                  <AvatarFallback>{conversa.participante?.nome?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{conversa.participante?.nome}</div>
                  <div className="text-sm text-muted-foreground">
                    {conversa.ultimaMensagem?.conteudo}
                  </div>
                </div>
                {conversa.naoLidas > 0 && (
                  <Badge variant="secondary" className="ml-auto">Nova</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderDesktop = () => (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      
      <div className="flex h-full">
        {/* Lista de Conversas (Esquerda) */}
        <div className="w-1/3 border-r bg-secondary">
          <div className="p-4">
            <Input
              type="search"
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => filtrarConversas(e.target.value)}
            />
          </div>

          <div className="overflow-y-auto">
            {conversasFiltradas?.map(conversa => (
              <Card
                key={conversa.id}
                className={`mb-2 border-none shadow-sm hover:bg-accent transition-colors ${conversa.id === conversaId ? 'bg-accent' : ''}`}
                onClick={() => navigate(`/mensagens/${conversa.id}`)}
              >
                <CardContent className="flex items-center space-x-4 p-3">
                  <Avatar>
                    <AvatarImage src={conversa.participante?.avatar_url || ""} />
                    <AvatarFallback>{conversa.participante?.nome?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{conversa.participante?.nome}</div>
                    <div className="text-sm text-muted-foreground">
                      {conversa.ultimaMensagem?.conteudo}
                    </div>
                  </div>
                  {conversa.naoLidas > 0 && (
                    <Badge variant="secondary" className="ml-auto">Nova</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Área de Mensagens (Direita) */}
        {conversaId ? (
          <div className="w-2/3 flex flex-col h-full">
            <div className="flex items-center bg-secondary px-4 py-2 border-b">
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src={conversaAtiva?.participante?.avatar_url || ""} />
                  <AvatarFallback>{conversaAtiva?.participante?.nome?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{conversaAtiva?.participante?.nome}</div>
                  <div className="text-xs text-muted-foreground">Online</div>
                </div>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto p-4">
              {mensagens?.map(msg => (
                <div key={msg.id} className={`mb-2 flex flex-col ${msg.remetente_id === user?.id ? 'items-end' : 'items-start'}`}>
                  <div className={`rounded-lg px-3 py-2 text-sm ${msg.remetente_id === user?.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>
                    <MessageText>{msg.conteudo}</MessageText>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {formatarData(msg.created_at)}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-secondary border-t p-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={novaMensagem}
                  onChange={handleNovaMensagemChange}
                  onKeyDown={handleKeyPress}
                />
                <Button onClick={handleEnviarMensagem}>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-2/3 flex items-center justify-center h-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center space-y-4">
                <MessageCircle className="h-10 w-10 text-muted-foreground" />
                <p className="text-lg font-semibold">Selecione uma conversa para visualizar</p>
                <Button onClick={() => setShowChatModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Conversa
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <ChatModal isOpen={showChatModal} onClose={() => setShowChatModal(false)} />
      <div className="md:hidden">
        {renderMobile()}
      </div>
      <div className="hidden md:block">
        {renderDesktop()}
      </div>
    </>
  );
};

export default Mensagens;
