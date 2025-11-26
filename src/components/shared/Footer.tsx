import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <img
                src="/giramae_logo.png"
                alt="Logo GiraMãe"
                className="h-12 w-auto mr-4"
              />
              {/* <span className="text-2xl font-bold">GiraMãe</span> */}
            </div>
            <p className="text-gray-400 mb-4">
              Trocas sustentáveis de roupas infantis entre mães.
              Economia circular, sustentabilidade e comunidade em um só lugar.
            </p>
            <div className="text-gray-400 space-y-1">
              <p>atendimento@giramae.com.br</p>
              <p>Canoas, RS</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Links Rápidos</h3>
            <div className="space-y-2 text-gray-400">
              <p><Link to="/sobre" className="hover:text-white transition-colors">Sobre Nós</Link></p>
              <p><Link to="/como-funciona" className="hover:text-white transition-colors">Como Funciona</Link></p>
              <p><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></p>
              <p><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Suporte</h3>
            <div className="space-y-2 text-gray-400">
              <p><Link to="/contato" className="hover:text-white transition-colors">Contato</Link></p>
              <p><a href="mailto:atendimento@giramae.com.br" className="hover:text-white transition-colors">Suporte Técnico</a></p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <div className="flex items-center justify-center mb-4">
            <img src="/giramae_logo.png" alt="" className="w-auto h-12" />
            
          </div>
          <p className="mb-4">© 2025 GiraMãe. Feito com <Heart className="inline h-4 w-4 text-pink-500" /> por e para mães.</p>
          <div className="flex flex-wrap justify-center gap-6 mt-4 text-sm">
            <Link to="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
            <Link to="/privacidade" className="hover:text-white transition-colors">Política de Privacidade</Link>
            <span className="text-gray-500 cursor-not-allowed">Cookies (em breve)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
