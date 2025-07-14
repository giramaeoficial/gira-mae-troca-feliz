import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const PoliticaPrivacidade: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 lg:p-8">
          <div className="text-center mb-8">
            <div className="text-3xl font-bold text-primary mb-2">
              GiraMãe
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              🔒 Política de Privacidade
            </h1>
            <p className="text-gray-600">
              Como protegemos e utilizamos suas informações
            </p>
          </div>

          <div className="prose prose-gray max-w-none">
            <h2>1. Coleta de Informações</h2>
            <p>
              Coletamos informações pessoais quando você se cadastra na plataforma GiraMãe, 
              incluindo nome, e-mail, telefone, endereço e informações sobre seus filhos.
            </p>

            <h2>2. Uso das Informações</h2>
            <p>
              Utilizamos suas informações para:
            </p>
            <ul>
              <li>Facilitar trocas entre mães da comunidade</li>
              <li>Verificar sua localização para conectar com mães próximas</li>
              <li>Enviar notificações sobre atividades relevantes</li>
              <li>Melhorar nossos serviços</li>
            </ul>

            <h2>3. Compartilhamento de Informações</h2>
            <p>
              Não vendemos ou alugamos suas informações pessoais. Compartilhamos apenas 
              informações necessárias para facilitar as trocas na comunidade.
            </p>

            <h2>4. Segurança</h2>
            <p>
              Implementamos medidas de segurança técnicas e organizacionais para proteger 
              suas informações contra acesso não autorizado, alteração ou destruição.
            </p>

            <h2>5. Seus Direitos</h2>
            <p>
              Você tem o direito de acessar, corrigir ou excluir suas informações pessoais 
              a qualquer momento. Entre em contato conosco para exercer esses direitos.
            </p>

            <h2>6. Contato</h2>
            <p>
              Para dúvidas sobre esta política, entre em contato: 
              <br />
              Email: privacidade@giramae.com.br
            </p>

            <p className="text-sm text-gray-500 mt-8">
              Última atualização: Janeiro de 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliticaPrivacidade;