import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { useConfigSistema } from '@/hooks/useConfigSistema';

const TermosUso: React.FC = () => {
  const navigate = useNavigate();
  const { config, taxaTransferencia, taxaTransacao, precoManual, isLoadingConfig } = useConfigSistema();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <SEOHead
        title="Termos de Uso - GiraMãe"
        description="Termos e condições de uso da plataforma GiraMãe. Regras, responsabilidades e informações sobre o uso das Girinhas e sistema de trocas."
        url="https://preview--gira-mae-troca-feliz.lovable.app/termos"
        noindex={true}
      />
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

          <div className="prose prose-gray max-w-none space-y-6">
            
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Aceitação dos Termos</h2>
            <p>
              Ao utilizar a plataforma GiraMãe, você declara que leu, compreendeu e concorda 
              integralmente com estes Termos de Uso e nossa Política de Privacidade. 
              Caso não concorde com qualquer disposição, não utilize nossos serviços.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Sobre o GiraMãe</h2>
            <p>
              O GiraMãe é uma plataforma digital colaborativa que conecta mães para facilitar 
              a troca de roupas, calçados, brinquedos e utensílios infantis por meio de uma 
              moeda virtual interna denominada "Girinha". Somos uma iniciativa sem fins 
              lucrativos focada na economia circular e sustentabilidade.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Cadastro e Elegibilidade</h2>
            <p><strong>3.1 Requisitos para Cadastro:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Ser maior de 18 anos ou ter autorização dos responsáveis legais</li>
              <li>Fornecer informações verdadeiras, precisas e atualizadas</li>
              <li>Possuir número de telefone válido para verificação via WhatsApp</li>
              <li>Aceitar estes Termos de Uso e a Política de Privacidade</li>
            </ul>
            
            <p><strong>3.2 Dados Coletados no Cadastro:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Nome completo</li>
              <li>Número de telefone (verificado via WhatsApp)</li>
              <li>Endereço completo (rua, número, bairro, cidade, estado, CEP)</li>
              <li>Data de nascimento</li>
              <li>Profissão (opcional)</li>
              <li>Instagram (opcional)</li>
              <li>Biografia (opcional)</li>
              <li>Interesses e categorias favoritas</li>
              <li>Informações dos filhos (nome, data de nascimento, escola)</li>
              <li>Localização geográfica (com sua autorização)</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Sistema de Girinhas</h2>
            <p><strong>4.1 Características das Girinhas:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Valor de referência:</strong> 1 Girinha = R$ {precoManual?.toFixed(2) || '1,00'}</li>
              <li><strong>Natureza:</strong> Moeda virtual interna, não conversível em dinheiro real</li>
              <li><strong>Validade:</strong> {config?.validade_girinhas?.meses || 12} ({config?.validade_girinhas?.meses === 1 ? 'um mês' : `${config?.validade_girinhas?.meses || 12} meses`}) a partir da data de aquisição</li>
              <li><strong>Uso exclusivo:</strong> Apenas dentro da plataforma GiraMãe</li>
              <li><strong>Não reembolsável:</strong> Não podem ser convertidas em dinheiro</li>
              <li><strong>Intransferível:</strong> Exceto por meio das funcionalidades da plataforma</li>
            </ul>

            <p><strong>4.2 Formas de Obtenção:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Compra com dinheiro real via Mercado Pago</li>
              <li>Bônus de cadastro e atividades na plataforma</li>
              <li>Recompensas por completar missões</li>
              <li>Bônus diário (conforme configuração)</li>
              <li>Recebimento por vendas de itens</li>
              <li>Transferências de outros usuários</li>
              <li>Sistema de indicações</li>
            </ul>

            <p><strong>4.3 Taxas Aplicáveis:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Taxa de transação:</strong> {taxaTransacao}% sobre o valor de cada item vendido</li>
              <li><strong>Taxa de transferência P2P:</strong> {taxaTransferencia}% sobre transferências entre usuários</li>
              <li><strong>Taxa de extensão de validade:</strong> Conforme configuração da plataforma das Girinhas expirando para estender validade</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Sistema de Reservas e Transações</h2>
            <p><strong>5.1 Processo de Reserva:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Ao reservar um item, o valor (item + taxa) é bloqueado em sua carteira</li>
              <li>A reserva gera um código de confirmação de 6 dígitos</li>
              <li>O vendedor deve confirmar a entrega usando este código</li>
              <li>Após confirmação, as Girinhas são transferidas ao vendedor</li>
            </ul>

            <p><strong>5.2 Cancelamentos:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Reservas podem ser canceladas por ambas as partes</li>
              <li>Cancelamentos devem incluir motivo obrigatório</li>
              <li>Girinhas bloqueadas são reembolsadas integralmente</li>
              <li>Cancelamentos excessivos podem resultar em penalidades</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Verificação e Comunicação via WhatsApp</h2>
            <p>
              O GiraMãe utiliza o WhatsApp para verificação de telefone durante o cadastro. 
              Enviamos um código de verificação de 6 dígitos que deve ser inserido na plataforma 
              para confirmar seu número. Este processo garante a autenticidade dos usuários e 
              a segurança da comunidade.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Uso de Localização</h2>
            <p>
              Com sua autorização expressa, coletamos dados de localização para:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Facilitar encontros entre mães da mesma região</li>
              <li>Mostrar itens próximos à sua localização</li>
              <li>Melhorar a experiência de busca e filtragem</li>
              <li>Calcular distâncias entre usuários</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Regras de Convivência</h2>
            <p><strong>É terminantemente proibido:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Usar linguagem ofensiva, discriminatória ou inadequada</li>
              <li>Publicar itens que não correspondam à descrição ou fotos</li>
              <li>Tentar burlar o sistema de Girinhas</li>
              <li>Compartilhar informações falsas ou enganosas</li>
              <li>Realizar atividades comerciais irregulares</li>
              <li>Assediar, intimidar ou ameaçar outros usuários</li>
              <li>Publicar conteúdo inadequado, violento ou pornográfico</li>
              <li>Usar a plataforma para fins diferentes de seu objetivo</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Sistema de Avaliações</h2>
            <p>
              Após cada transação concluída, compradores e vendedores podem avaliar um ao outro. 
              As avaliações são definitivas e contribuem para a reputação na comunidade. 
              Avaliações maliciosas ou falsas resultarão em penalidades.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Responsabilidades e Limitações</h2>
            <p><strong>10.1 O GiraMãe NÃO se responsabiliza por:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Qualidade, autenticidade, segurança ou estado dos itens transacionados</li>
              <li>Disputas entre usuários relacionadas às transações</li>
              <li>Danos pessoais ou materiais decorrentes do uso da plataforma</li>
              <li>Problemas de entrega ou comunicação entre usuários</li>
              <li>Perda de Girinhas por uso indevido da conta</li>
            </ul>

            <p><strong>10.2 Responsabilidades do Usuário:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Manter a segurança e confidencialidade de sua conta</li>
              <li>Verificar a qualidade dos itens antes de confirmar transações</li>
              <li>Cumprir acordos estabelecidos com outros usuários</li>
              <li>Responder por todas as atividades realizadas em sua conta</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo da plataforma GiraMãe, incluindo mas não limitado a textos, 
              imagens, logotipos, design, código-fonte e funcionalidades, é propriedade 
              exclusiva do GiraMãe ou de seus licenciadores e está protegido pelas leis 
              de propriedade intelectual brasileiras e internacionais.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Suspensão e Encerramento</h2>
            <p>
              Reservamo-nos o direito de suspender ou encerrar contas que violem estes 
              termos, sem aviso prévio. Em caso de encerramento voluntário, Girinhas 
              não utilizadas serão perdidas, não havendo direito a reembolso.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Modificações dos Termos</h2>
            <p>
              Estes termos podem ser alterados a qualquer momento, com notificação 
              prévia de 30 (trinta) dias aos usuários através da plataforma ou email. 
              O uso continuado após as alterações constitui aceitação dos novos termos.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">14. Lei Aplicável e Foro</h2>
            <p>
              Estes Termos são regidos pela legislação brasileira, especialmente pela 
              Lei Geral de Proteção de Dados (LGPD), Marco Civil da Internet e Código 
              de Defesa do Consumidor. O foro da Comarca de Canoas/RS é eleito para 
              dirimir quaisquer controvérsias.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">15. Contato</h2>
            <p>
              Para dúvidas sobre estes termos ou suporte, entre em contato:
              <br />
              <strong>Email:</strong> suporte@giramae.com.br
              <br />
              <strong>Endereço:</strong> Canoas, Rio Grande do Sul, Brasil
            </p>

            <div className="bg-gray-50 p-4 rounded-lg mt-8">
              <p className="text-sm text-gray-600 font-medium">
                <strong>Última atualização:</strong> Janeiro de 2025
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Versão:</strong> 2.0 - Termos atualizados conforme LGPD
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermosUso;