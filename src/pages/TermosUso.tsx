import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermosUso: React.FC = () => {
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
              📜 Termos de Uso
            </h1>
            <p className="text-gray-600">
              Regras e condições para uso da plataforma
            </p>
          </div>

          <div className="prose prose-gray max-w-none">
            <h2>1. Aceitação dos Termos</h2>
            <p>
              Ao utilizar a plataforma GiraMãe, você concorda com estes termos de uso. 
              Caso não concorde, não utilize nossos serviços.
            </p>

            <h2>2. Descrição do Serviço</h2>
            <p>
              O GiraMãe é uma plataforma digital que conecta mães para facilitar a troca 
              de roupas, brinquedos, calçados e utensílios infantis por meio de uma moeda 
              interna chamada "Girinha".
            </p>

            <h2>3. Cadastro e Responsabilidades</h2>
            <p>
              Para usar a plataforma, você deve:
            </p>
            <ul>
              <li>Fornecer informações verdadeiras e atualizadas</li>
              <li>Manter a segurança de sua conta</li>
              <li>Ser responsável por todas as atividades em sua conta</li>
              <li>Não compartilhar sua conta com terceiros</li>
            </ul>

            <h2>4. Uso das Girinhas</h2>
            <p>
              As Girinhas são uma moeda virtual interna com as seguintes características:
            </p>
            <ul>
              <li>1 Girinha = R$ 1,00 (valor de referência)</li>
              <li>Não podem ser convertidas em dinheiro real</li>
              <li>Possuem prazo de validade de 12 meses</li>
              <li>São utilizadas exclusivamente dentro da plataforma</li>
            </ul>

            <h2>5. Regras de Convivência</h2>
            <p>
              Nossa comunidade se baseia no respeito mútuo. É proibido:
            </p>
            <ul>
              <li>Usar linguagem ofensiva ou discriminatória</li>
              <li>Publicar itens que não correspondam à descrição</li>
              <li>Realizar práticas comerciais irregulares</li>
              <li>Compartilhar informações falsas</li>
            </ul>

            <h2>6. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo da plataforma, incluindo textos, imagens, logotipos e software, 
              é propriedade do GiraMãe e protegido por leis de propriedade intelectual.
            </p>

            <h2>7. Limitação de Responsabilidade</h2>
            <p>
              O GiraMãe não se responsabiliza por:
            </p>
            <ul>
              <li>Qualidade, autenticidade ou estado dos itens trocados</li>
              <li>Disputas entre usuárias</li>
              <li>Danos decorrentes do uso da plataforma</li>
            </ul>

            <h2>8. Modificações dos Termos</h2>
            <p>
              Reservamo-nos o direito de alterar estes termos a qualquer momento, 
              com notificação prévia aos usuários.
            </p>

            <h2>9. Contato</h2>
            <p>
              Para dúvidas sobre estes termos, entre em contato: 
              <br />
              Email: termos@giramae.com.br
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

export default TermosUso;