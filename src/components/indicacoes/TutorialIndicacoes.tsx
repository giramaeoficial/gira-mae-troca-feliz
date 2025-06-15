
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Gift, Users, Share2, Mail } from 'lucide-react';

const TutorialIndicacoes = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          Como funciona?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            🌟 Como funciona o Sistema de Indicações
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Share2 className="h-5 w-5 text-purple-600" />
              1. Compartilhe seu link
            </h3>
            <p className="text-gray-700 mb-3">
              Clique em "Compartilhar Link de Indicação" para gerar seu link único. 
              Envie para suas amigas por WhatsApp, e-mail ou redes sociais.
            </p>
            <Badge className="bg-purple-100 text-purple-700">
              Seu link é único e rastreia suas indicações!
            </Badge>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              2. Sua amiga se cadastra
            </h3>
            <p className="text-gray-700 mb-3">
              Quando ela se cadastrar usando seu link, vocês duas ganham bônus!
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-green-500" />
                <span className="text-sm"><strong>Você ganha:</strong> +5 Girinhas</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-blue-500" />
                <span className="text-sm"><strong>Ela ganha:</strong> Girinhas de boas-vindas</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-sky-50 p-4 rounded-lg border">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Gift className="h-5 w-5 text-blue-600" />
              3. Ganhe mais bônus
            </h3>
            <p className="text-gray-700 mb-3">
              Conforme sua amiga usa a plataforma, você ganha mais Girinhas:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded border">
                <div className="text-lg font-bold text-blue-600">+5 Girinhas</div>
                <div className="text-sm text-gray-600">Quando ela publica o primeiro item</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-lg font-bold text-purple-600">+5 Girinhas</div>
                <div className="text-sm text-gray-600">Quando ela faz a primeira compra</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-lg border">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Mail className="h-5 w-5 text-yellow-600" />
              4. Indicação direta por e-mail
            </h3>
            <p className="text-gray-700 mb-3">
              Se sua amiga já tem conta no GiraMãe, você pode indicá-la diretamente pelo e-mail dela.
            </p>
            <Badge className="bg-yellow-100 text-yellow-700">
              Ideal para quando vocês já são usuárias!
            </Badge>
          </div>

          <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-lg border border-pink-200">
            <h3 className="font-bold text-lg mb-3 text-center">
              💝 Total possível por indicação
            </h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-600 mb-2">+15 Girinhas</div>
              <div className="text-sm text-gray-600">
                5 (cadastro) + 5 (primeiro item) + 5 (primeira compra)
              </div>
            </div>
          </div>

          <div className="text-center pt-4">
            <Button 
              onClick={() => setIsOpen(false)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Entendi! Vamos começar 🚀
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TutorialIndicacoes;
