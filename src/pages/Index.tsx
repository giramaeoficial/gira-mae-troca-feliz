import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Heart,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  Users, // Used for community icon
  Handshake, // Used for a soft "solution" icon
  Shield, // Used for security
  Lightbulb // Used for mission/purpose
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/shared/Header";
import QuickNav from "@/components/shared/QuickNav";
import { useAuth } from "@/hooks/useAuth";
import { useConfigSistema } from "@/hooks/useConfigSistema";
import { useMissoes } from "@/hooks/useMissoes";

const LandingPageOptimized = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const { user } = useAuth();
  const { taxaTransacao } = useConfigSistema();
  const { missoes } = useMissoes();

  // Calcular valores dinâmicos das missões
  // A missão de pacto de entrada é usada para o bônus inicial
  const missaoPactoEntrada = missoes?.find(m => m.tipo_missao === 'basic' && m.categoria === 'pacto_entrada');
  const recompensaPacto = missaoPactoEntrada?.recompensa_girinhas || 100;
  const itensNecessarios = missaoPactoEntrada?.condicoes?.quantidade || 2;

  // Dados para a seção de problemas (simplificado e com tom de conversa)
  const painPointsConversational = [
    "Comprar roupa nova toda hora e ver seu filho usar 3 vezes?",
    "Tentar vender no brechó e receber uma mixaria?",
    "Postar em grupo de WhatsApp e ninguém responder?",
    "Guardar 'para o próximo filho' e nunca mais usar?"
  ];

  // Dados para a seção de diferenciais (ajustado para o novo tom)
  const differentials = [
    {
      title: "Comunidade real",
      description: "Não somos uma empresa querendo lucrar em cima de você. Somos mães que criaram uma solução para todas nós.",
      icon: <Users className="w-6 h-6 text-primary" />
    },
    {
      title: "Transparência clara",
      description: `Cobramos apenas ${taxaTransacao}% para manter tudo funcionando. Sem pegadinhas, sem letras miúdas.`,
      icon: <CheckCircle className="w-6 h-6 text-primary" />
    },
    {
      title: "Segurança garantida",
      description: "Só liberamos contato após confirmar a troca. Avaliações entre mães para manter a qualidade. Suas peças sempre protegidas.",
      icon: <Shield className="w-6 h-6 text-primary" />
    }
  ];

  // Dados para a seção de benefícios reais
  const realBenefits = [
    {
      title: "Economia real",
      description: "Peças infantis usadas valem muito mais aqui do que em brechós."
    },
    {
      title: "Mais praticidade",
      description: "Postagens rápidas e trocas simples, sem complicação."
    },
    {
      title: "Conexões locais",
      description: "Trocas fáceis com mães próximas a você."
    }
  ];

  const faqs = [
    {
      q: "Quais as garantias da plataforma?",
      a: "Somos transparentes: CNPJ, endereço, tudo certinho. E as roupas sempre são suas, não nossas. Nosso sistema de avaliações garante a qualidade das trocas."
    },
    {
      q: `Por que cobram ${taxaTransacao}%?`,
      a: "Para pagar servidor, manutenção, melhorias... É o mínimo para manter tudo funcionando bem para todas nós."
    },
    {
      q: "Posso confiar nas outras mães?",
      a: "Criamos um sistema de avaliações justamente para isso. Quem não cumpre o combinado perde a reputação e sai naturalmente."
    },
    {
      q: "Como funciona o sistema de reservas e bloqueio de Girinhas?",
      a: "Quando você reserva um item disponível, suas Girinhas são bloqueadas automaticamente, garantindo a transação. Se o item já está reservado, você entra na fila de espera SEM bloquear Girinhas. Quando chegar sua vez, você é notificada e pode escolher se quer prosseguir."
    },
    {
      q: "O que é a fila de espera e como funciona?",
      a: "Se um item que você quer já foi reservado, você pode entrar na fila de espera gratuitamente. Suas Girinhas não são bloqueadas. Se a pessoa da frente desistir ou não confirmar a entrega, você sobe na fila. Quando chegar sua vez, você decide se quer reservar."
    },
    {
      q: "Como funciona o contato entre comprador e vendedor?",
      a: "Os WhatsApps de ambas as partes são liberados APENAS após a confirmação da reserva (quando as Girinhas são bloqueadas). Este é o único meio de contato disponível na plataforma, garantindo privacidade e evitando spam. Use este contato para combinar local e horário de entrega."
    },
    {
      q: "Para que serve a tela 'Minhas Reservas'?",
      a: "Na tela 'Minhas Reservas' você vê todos os itens que reservou, sua posição nas filas de espera, histórico de transações e pode acompanhar o status de cada negociação. É seu painel de controle completo."
    },
    {
      q: "Como funciona o bônus diário?",
      a: "Entre na plataforma todos os dias e ganhe Girinhas de bônus! É nossa forma de recompensar mães ativas na comunidade. Quanto mais você participa, mais você ganha."
    },
    {
      q: "Posso transferir Girinhas para outras mães?",
      a: "Sim! O sistema P2P permite transferir Girinhas para qualquer mãe da plataforma. Há uma pequena taxa para manter o sistema funcionando, mas é muito menor que bancos tradicionais."
    },
    {
      q: "Como funciona o programa de indicações?",
      a: "Convide suas amigas através do seu link único. Quando elas se tornarem ativas na plataforma (completando a primeira missão), você ganha Girinhas de bônus! É um ganha-ganha: elas começam com créditos, você ganha por ajudar a comunidade crescer."
    },
    {
      q: "Para que serve cadastrar os dados do meu filho e escola?",
      a: "Ao cadastrar idade, tamanhos e escola do seu filho, o sistema destaca automaticamente no feed os itens que servem para ele. Além disso, priorizamos entregas entre mães da mesma escola, facilitando a logística e criando conexões locais."
    },
    {
      q: "As peças têm garantia de qualidade?",
      a: "Nosso sistema de reputação é rigoroso. Cada usuária tem uma avaliação visível baseada em trocas anteriores. Fotos devem ser reais e detalhadas. Se alguém enviar peças em mau estado, a reputação cai e os anúncios são removidos. A própria comunidade se autorregula para manter a qualidade alta."
    },
    {
      q: "E se eu não gostar da peça que recebi?",
      a: "Temos uma política de satisfação garantida. Se a peça não estiver conforme descrito, você pode devolver em até 7 dias e suas Girinhas são restituídas integralmente. Caso a usuária que forneceu a peça não colaborar, a plataforma garante a devolução e restituição."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
      <Header />

      <main className="flex-grow pb-32 md:pb-8">
        {/* SEÇÃO 1 - CONEXÃO EMOCIONAL (Hero) */}
        <section className="py-12 md:py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="h-12 md:h-16 w-12 md:w-16 text-primary mr-4" />
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                GiraMãe
              </h1>
            </div>

            <h2 className="text-xl md:text-3xl font-bold text-gray-800 mb-4">
              Onde mães cuidam de mães
            </h2>

            <p className="text-lg md:text-2xl text-gray-700 mb-6 leading-relaxed max-w-3xl mx-auto italic">
              "Sabe aquele sentimento de ver o armário cheio de roupinhas que não servem mais? A gente entende. Por isso criamos um cantinho onde mães se ajudam de verdade."
            </p>

            <p className="text-base md:text-xl text-gray-700 mb-8 leading-relaxed max-w-3xl mx-auto">
              Aqui você troca aquelas peças paradas por outras que seu pequeno precisa agora. Entre amigas, com carinho e segurança. Sem pressa, sem pressão.
            </p>

            <p className="text-sm md:text-base text-gray-500 mb-8 max-w-3xl mx-auto">
              A ideia nasceu aqui em Canoas, RS, e hoje conecta mães por todo o Brasil.
            </p>

            <div className="flex justify-center">
              <Button size="lg" asChild className="w-full sm:w-auto bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white px-8 py-4 text-lg rounded-full transition-all duration-300">
                <Link to="/auth">
                  Conheça a comunidade
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* SEÇÃO 2 - PROBLEMA COMPARTILHADO */}
        <section className="py-12 md:py-20 px-4 bg-white/50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-8">
              Você provavelmente já passou por isso
            </h2>

            <div className="space-y-6 mb-10">
              {painPointsConversational.map((point, index) => (
                <p key={index} className="text-lg md:text-xl text-gray-700 leading-relaxed">
                  <span className="font-semibold text-primary/80 mr-2">•</span> {point}
                </p>
              ))}
            </div>

            <p className="text-xl md:text-2xl font-semibold text-gray-800 italic">
              Por isso decidimos criar algo diferente
            </p>
          </div>
        </section>

        {/* SEÇÃO 3 - NOSSA SOLUÇÃO COM CARINHO */}
        <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-pink-50 to-purple-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-8">
              Um jeito simples de trocar roupas infantis
            </h2>

            <div className="bg-white rounded-lg p-6 md:p-8 shadow-lg max-w-3xl mx-auto">
              <Handshake className="h-12 w-12 text-primary mx-auto mb-4" />
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-4">
                No GiraMãe, as roupinhas mantêm seu valor através das <strong>Girinhas</strong>.
              </p>
              <p className="text-base md:text-lg font-semibold text-gray-600 italic">
                "As Girinhas são créditos internos que facilitam trocas justas dentro da comunidade."
              </p>
            </div>
          </div>
        </section>

        {/* SEÇÃO 4 - COMO FUNCIONA (Simplificado) */}
        <section id="como-funciona" className="py-12 md:py-20 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 text-center mb-12">
              Como funciona
            </h2>

            <div className="space-y-10">
              {/* Passo 1 */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-2xl flex-shrink-0">
                  01
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                    Cadastre seus primeiros itens
                  </h3>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Poste {itensNecessarios} pecinhas que não usa mais e ganhe {recompensaPacto} Girinhas para iniciar suas trocas.
                  </p>
                </div>
              </div>

              {/* Passo 2 */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-2xl flex-shrink-0">
                  02
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                    Escolha o que precisa
                  </h3>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Escolha o que seu filho precisa usando suas Girinhas. Nosso sistema destaca itens do tamanho certo para o seu pequeno.
                  </p>
                </div>
              </div>

              {/* Passo 3 */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-2xl flex-shrink-0">
                  03
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                    Combine e receba
                  </h3>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Combine a entrega direto com a outra mamãe, do jeitinho que preferir. Apenas após a reserva, os contatos são liberados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO MISSÃO - NOSSO PROPÓSITO */}
        <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-pink-50 to-purple-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-8">
              <Lightbulb className="inline w-10 h-10 text-primary mr-3" />
              Nosso propósito
            </h2>

            <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
              Criamos um espaço onde roupas infantis mantêm seu valor real, simplificando a rotina das mães.
            </p>

            <div className="bg-white rounded-lg p-6 md:p-8 shadow-lg max-w-3xl mx-auto mb-8">
              <h3 className="text-xl md:text-2xl font-bold text-primary mb-4">
                Nossa missão é simples e poderosa:
              </h3>
              <p className="text-lg md:text-xl text-gray-800 italic">
                "Transformar a forma como mães lidam com roupas infantis, criando uma rede de apoio mútuo onde cada peça mantém seu valor real e cada mãe encontra suporte na sua jornada."
              </p>
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
              O que isso significa na prática:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Valorizar seu esforço</h4>
                  <p className="text-gray-700 text-sm">Aquela roupa que você escolheu com carinho não vira lixo nem mixaria - continua circulando e ajudando outras famílias.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Fortalecer conexões</h4>
                  <p className="text-gray-700 text-sm">Mães apoiando mães, criando laços reais na comunidade, não apenas transações.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Simplificar sua vida</h4>
                  <p className="text-gray-700 text-sm">Menos tempo procurando, negociando, desperdiçando. Mais tempo para o que realmente importa.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Cuidar do futuro</h4>
                  <p className="text-gray-700 text-sm">Cada troca é um passo para um mundo mais sustentável para nossos filhos.</p>
                </div>
              </div>
            </div>

            <p className="text-lg md:text-xl font-semibold text-gray-800 leading-relaxed">
              Simplificamos a maternidade, valorizando cada peça de roupa e cada mãe.
            </p>
            <p className="text-lg md:text-xl font-bold text-primary mt-4">
              "Porque no final do dia, somos mães cuidando de mães. E é nisso que acreditamos."
            </p>
          </div>
        </section>

        {/* SEÇÃO 5 - DIFERENCIAIS COM TOQUE HUMANO */}
        <section className="py-12 md:py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 text-center mb-12">
              O que nos torna diferentes
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {differentials.map((item, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center p-4">
                  <CardHeader className="flex flex-col items-center pb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      {item.icon}
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 text-base">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* SEÇÃO 6 - BENEFÍCIOS REAIS */}
        <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-pink-50 to-purple-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 text-center mb-12">
              Benefícios práticos
            </h2>

            <div className="space-y-8">
              {realBenefits.map((benefit, index) => (
                <Card key={index} className="border-0 shadow-lg p-6">
                  <CardContent className="p-0">
                    <h3 className="text-xl md:text-2xl font-bold text-primary mb-3">{benefit.title}</h3>
                    <p className="text-lg text-gray-700 leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Lista de Missões e Premiações */}
        {missoes && missoes.length > 0 && (
          <section className="py-12 md:py-20 px-4 bg-white">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-8">
                Missões que premiam você
              </h2>
              <p className="text-lg md:text-xl text-gray-700 mb-10">
                Realize missões simples e ganhe créditos para trocas.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {missoes.map((missao) => (
                  <Card key={missao.id} className="border-primary/20 bg-primary/5 text-left p-4">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold text-gray-900">{missao.titulo}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-sm mb-2">{missao.descricao}</p>
                      <Badge className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        Recompensa: {missao.recompensa_girinhas} Girinhas
                      </Badge>
                      <p className="text-gray-600 text-xs mt-2">
                        Condição: {missao.condicoes.quantidade} {missao.condicoes.tipo.replace(/_/g, ' ')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SEÇÃO 7 - SEGURANÇA E CONFIANÇA */}
        <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-pink-50 to-purple-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-8">
              <Shield className="inline w-10 h-10 text-primary mr-3" />
              Segurança acima de tudo
            </h2>

            <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8 italic">
              "Criamos tudo pensando na sua segurança:"
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Contato liberado só após reserva</h3>
                  <p className="text-gray-700 text-sm">Seu contato é privado até a troca ser confirmada.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Avaliações claras e honestas</h3>
                  <p className="text-gray-700 text-sm">Construa sua reputação e confie nas outras mães.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Garantia de devolução em 7 dias</h3>
                  <p className="text-gray-700 text-sm">Sua satisfação é importante para nós.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Dados pessoais protegidos</h3>
                  <p className="text-gray-700 text-sm">Privacidade e segurança em primeiro lugar.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
              <p className="text-lg md:text-xl text-gray-700 italic">
                "Girinhas são créditos internos não conversíveis em dinheiro. Simples, justo e funcional."
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-12 md:py-20 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-6">
              Dúvidas frequentes
            </h2>
            <p className="text-lg text-gray-600 text-center mb-12">
              Esclarecemos tudo para você ficar 100% confiante antes de começar
            </p>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="border border-gray-200 bg-white">
                  <CardHeader
                    className="cursor-pointer hover:bg-gray-50 transition-colors p-4"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base md:text-lg text-gray-900 text-left pr-4">{faq.q}</CardTitle>
                      <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${openFaq === index ? 'rotate-180' : ''}`} />
                    </div>
                  </CardHeader>
                  {openFaq === index && (
                    <CardContent className="pt-0 p-4">
                      <p className="text-gray-600 text-sm md:text-base">{faq.a}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-lg text-gray-600 mb-6">Nossa equipe está pronta para ajudar você a começar sua jornada no GiraMãe</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white px-6 py-3 rounded-full">
                  Falar com a equipe
                </Button>
                <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white px-6 py-3 rounded-full">
                  Ver tutorial
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 8 - CONVITE FINAL */}
        <section className="py-12 md:py-20 px-4 bg-gradient-to-r from-primary to-pink-500 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-5xl font-bold mb-6">
              Faça parte da comunidade
            </h2>

            <p className="text-lg md:text-xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
              Cadastre seus primeiros itens sem compromisso.
            </p>

            <p className="text-lg md:text-xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed italic">
              "Afinal, criar nossos filhos já é desafio suficiente. Que tal facilitar pelo menos a parte das roupinhas?"
            </p>

            <Button size="lg" variant="secondary" asChild className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg rounded-full transition-all duration-300">
              <Link to="/auth">
                Começar agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <QuickNav />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <Sparkles className="h-8 w-8 text-primary mr-2" />
                <span className="text-2xl font-bold">GiraMãe</span>
              </div>
              <p className="text-gray-400 mb-4">
                Trocas sustentáveis de roupas infantis entre mães.
                Economia circular, sustentabilidade e comunidade em um só lugar.
              </p>
              <div className="text-gray-400 space-y-1">
                <p>contato@giramae.com.br</p>
                <p>(11) 99999-9999</p>
                <p>São Paulo, SP</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Links Rápidos</h3>
              <div className="space-y-2 text-gray-400">
                <p><a href="#como-funciona" className="hover:text-white transition-colors">Como Funciona</a></p>
                <p><a href="#" className="hover:text-white transition-colors">Depoimentos</a></p>
                <p><a href="#faq" className="hover:text-white transition-colors">FAQ</a></p>
                <p><a href="#" className="hover:text-white transition-colors">Blog</a></p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <div className="space-y-2 text-gray-400">
                <p><a href="#contato" className="hover:text-white transition-colors">Contato</a></p>
                <p><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></p>
                <p><a href="#" className="hover:text-white transition-colors">Status da Plataforma</a></p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-primary mr-2" />
              <span className="text-xl font-bold text-primary">GiraMãe</span>
            </div>
            <p className="mb-4">© 2024 GiraMãe. Feito com <Heart className="inline h-4 w-4 text-primary" /> por e para mães.</p>
            <div className="flex flex-wrap justify-center gap-6 mt-4 text-sm">
              <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-white transition-colors">Política de Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageOptimized;
