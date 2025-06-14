
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  outraMae: {
    nome: string;
    avatar: string;
  };
  item: {
    titulo: string;
    imagem: string;
  };
}

interface Mensagem {
  id: number;
  texto: string;
  autor: 'eu' | 'outra';
  timestamp: Date;
  tipo?: 'sugestao' | 'normal';
}

const ChatModal = ({ isOpen, onClose, outraMae, item }: ChatModalProps) => {
  const [mensagem, setMensagem] = useState("");
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: 1,
      texto: `Olá! Eu reservei o item "${item.titulo}". Quando e onde posso buscar?`,
      autor: 'eu',
      timestamp: new Date(),
      tipo: 'normal'
    }
  ]);

  const sugestoesMensagens = [
    "Olá! Eu reservei o item, quando e onde posso buscar?",
    "Pode deixar na escola do(a) meu filho(a)?",
    "Posso buscar hoje à tarde?",
    "Tem algum ponto de encontro que funciona para você?"
  ];

  const pontosRetirada = [
    "Shopping Vila Madalena",
    "Praça Benedito Calixto",
    "Escola Pinheiros",
    "Portaria do prédio"
  ];

  const enviarMensagem = () => {
    if (!mensagem.trim()) return;

    const novaMensagem: Mensagem = {
      id: Date.now(),
      texto: mensagem,
      autor: 'eu',
      timestamp: new Date(),
      tipo: 'normal'
    };

    setMensagens(prev => [...prev, novaMensagem]);
    setMensagem("");

    // Simular resposta automática
    setTimeout(() => {
      const respostaAutomatica: Mensagem = {
        id: Date.now() + 1,
        texto: "Oi! Que bom que você reservou. Podemos combinar para hoje à tarde na praça perto da escola. Te mando a localização exata em alguns minutos!",
        autor: 'outra',
        timestamp: new Date(),
        tipo: 'normal'
      };
      setMensagens(prev => [...prev, respostaAutomatica]);
    }, 2000);
  };

  const usarSugestao = (sugestao: string) => {
    setMensagem(sugestao);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto h-[80vh] flex flex-col">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={outraMae.avatar} alt={outraMae.nome} />
              <AvatarFallback>
                {outraMae.nome.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <DialogTitle className="text-lg">{outraMae.nome}</DialogTitle>
              <p className="text-sm text-gray-600">sobre: {item.titulo}</p>
            </div>
            <Badge className="bg-green-500 text-white">Online</Badge>
          </div>
        </DialogHeader>

        {/* Área de mensagens */}
        <div className="flex-grow overflow-y-auto space-y-3 py-4">
          {mensagens.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.autor === 'eu' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs rounded-lg p-3 ${
                  msg.autor === 'eu'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm">{msg.texto}</p>
                <p className={`text-xs mt-1 ${
                  msg.autor === 'eu' ? 'text-primary-foreground/70' : 'text-gray-500'
                }`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Sugestões rápidas */}
        <div className="border-t pt-3 space-y-2">
          <p className="text-xs text-gray-600 font-medium">Sugestões rápidas:</p>
          <div className="grid grid-cols-1 gap-1">
            {sugestoesMensagens.slice(0, 2).map((sugestao, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-auto py-1 px-2 justify-start"
                onClick={() => usarSugestao(sugestao)}
              >
                {sugestao}
              </Button>
            ))}
          </div>
          
          <p className="text-xs text-gray-600 font-medium mt-3">Pontos de retirada sugeridos:</p>
          <div className="grid grid-cols-1 gap-1">
            {pontosRetirada.slice(0, 2).map((ponto, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-auto py-1 px-2 justify-start"
                onClick={() => usarSugestao(`Podemos nos encontrar no ${ponto}?`)}
              >
                <MapPin className="w-3 h-3 mr-1" />
                {ponto}
              </Button>
            ))}
          </div>
        </div>

        {/* Input de mensagem */}
        <div className="flex gap-2 border-t pt-3">
          <Input
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Digite sua mensagem..."
            onKeyPress={(e) => e.key === 'Enter' && enviarMensagem()}
            className="flex-grow"
          />
          <Button onClick={enviarMensagem} size="sm">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatModal;
