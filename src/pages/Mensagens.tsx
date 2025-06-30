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
import MessageText from '@/components/mensagens/MessageText';
import MentionInput from '@/components/mensagens/MentionInput';
import { toast } from "sonner";
import QuickNav from '@/components/shared/QuickNav';

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
        <div className="flex flex-col h-screen bg-pink-50 pb-16"> {/* pb-16 para espaço do QuickNav */}
          <Header />
          
          <div className="flex items-center bg-white px-4 py-3 border-b shadow-sm">
            <Button variant="ghost" size="icon" onClick={() => navigate('/mensagens')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-3 ml-2">
              <Avatar>
                <AvatarImage src={conversaAtiva?.participante?.avatar_url || ""} />
                <AvatarFallback>{conversaAtiva?.participante?.nome?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-gray-900">{conversaAtiva?.participante?.nome}</div>
                <div className="text-xs text-gray-500">Online</div>
              </div>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-3">
            {mensagens?.map(msg => (
              <div key={msg.id} className={`flex ${msg.remetente_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${msg.remetente_id === user?.id ? 'order-1' : 'order-2'}`}>
                  <div className={`rounded-2xl px-4 py-2 text-sm ${
                    msg.remetente_id === user?.id 
                      ? 'bg-primary text-white' 
                      : 'bg-white border shadow-sm text-gray-900'
                  }`}>
                    <MessageText>{msg.conteudo}</MessageText>
                  </div>
                  <span className={`text-xs text-gray-400 mt-1 block ${
                    msg.remetente_id === user?.id ? 'text-right' : 'text-left'
                  }`}>
                    {formatarData(msg.created_at)}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="bg-white border-t p-4 shadow-lg">
            <div className="flex space-x-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={novaMensagem}
                onChange={handleNovaMensagemChange}
                onKeyDown={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleEnviarMensagem} size="sm" className="px-4">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-screen bg-pink-50 pb-16"> {/* pb-16 para espaço do QuickNav */}
        <Header />
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mensagens</h1>
              <p className="text-gray-600">Suas conversas</p>
            </div>
            <Button onClick={() => setShowChatModal(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nova
            </Button>
          </div>
          
          <Input
            type="search"
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => filtrarConversas(e.target.value)}
            className="mb-4"
          />
        </div>

        <div className="flex-grow overflow-y-auto px-4 space-y-2">
          {conversasFiltradas?.map(conversa => (
            <Card
              key={conversa.id}
              className="hover:shadow-md transition-shadow cursor-pointer bg-white"
              onClick={() => navigate(`/mensagens/${conversa.id}`)}
            >
              <CardContent className="flex items-center space-x-4 p-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={conversa.participante?.avatar_url || ""} />
                  <AvatarFallback>{conversa.participante?.nome?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-900 truncate">{conversa.participante?.nome}</div>
                    {conversa.naoLidas > 0 && (
                      <Badge variant="secondary" className="bg-primary text-white ml-2">Nova</Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 truncate">
                    {conversa.ultimaMensagem?.conteudo || 'Nenhuma mensagem ainda'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderDesktop = () => (
    <div className="flex flex-col h-screen bg-pink-50"> {/* Sem padding bottom no desktop */}
      <Header />
      
      <div className="flex h-full">
        {/* Lista de Conversas (Esquerda) */}
        <div className="w-1/3 bg-white border-r border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mensagens</h2>
            <Input
              type="search"
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => filtrarConversas(e.target.value)}
            />
          </div>

          <div className="overflow-y-auto h-full">
            {conversasFiltradas?.map(conversa => (
              <div
                key={conversa.id}
                className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                  conversa.id === conversaId ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                }`}
                onClick={() => navigate(`/mensagens/${conversa.id}`)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={conversa.participante?.avatar_url || ""} />
                    <AvatarFallback>{conversa.participante?.nome?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-gray-900 truncate">{conversa.participante?.nome}</div>
                      {conversa.naoLidas > 0 && (
                        <Badge variant="secondary" className="bg-primary text-white text-xs">
                          {conversa.naoLidas}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {conversa.ultimaMensagem?.conteudo || 'Nenhuma mensagem ainda'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Área de Mensagens (Direita) */}
        {conversaId ? (
          <div className="w-2/3 flex flex-col h-full bg-white">
            <div className="flex items-center px-6 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={conversaAtiva?.participante?.avatar_url || ""} />
                  <AvatarFallback>{conversaAtiva?.participante?.nome?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-gray-900">{conversaAtiva?.participante?.nome}</div>
                  <div className="text-xs text-gray-500">Online</div>
                </div>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto p-6 bg-pink-50 space-y-4">
              {mensagens?.map(msg => (
                <div key={msg.id} className={`flex ${msg.remetente_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${msg.remetente_id === user?.id ? 'order-1' : 'order-2'}`}>
                    <div className={`rounded-2xl px-4 py-3 text-sm ${
                      msg.remetente_id === user?.id 
                        ? 'bg-primary text-white' 
                        : 'bg-white border shadow-sm text-gray-900'
                    }`}>
                      <MessageText>{msg.conteudo}</MessageText>
                    </div>
                    <span className={`text-xs text-gray-400 mt-1 block ${
                      msg.remetente_id === user?.id ? 'text-right' : 'text-left'
                    }`}>
                      {formatarData(msg.created_at)}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex space-x-3">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={novaMensagem}
                  onChange={handleNovaMensagemChange}
                  onKeyDown={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={handleEnviarMensagem} size="sm" className="px-6">
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-2/3 flex items-center justify-center h-full bg-white">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-900 mb-2">Selecione uma conversa</p>
              <p className="text-gray-600">Escolha uma conversa para começar a conversar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="md:hidden">
        {renderMobile()}
      </div>
      <div className="hidden md:block">
        {renderDesktop()}
      </div>
      <QuickNav />
    </>
  );
};

export default Mensagens;
