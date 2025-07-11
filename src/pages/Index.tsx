import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Heart, 
  Users, 
  Recycle, 
  Shield, 
  ArrowRight, 
  CheckCircle,
  Star,
  Zap,
  DollarSign,
  ChevronDown,
  Gift,
  User,
  Settings,
  Plus,
  Check,
  Home
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
  const totalGirinhasMissoes = missoes?.reduce((total, missao) => total + missao.recompensa_girinhas, 0) || 0;
  const missaoPactoEntrada = missoes?.find(m => m.tipo_missao === 'basic' && m.categoria === 'pacto_entrada');
  const recompensaPacto = missaoPactoEntrada?.recompensa_girinhas || 100;
  const itensNecessarios = missaoPactoEntrada?.condicoes?.quantidade || 2;

  const problemsData = [
    { platform: "Brechó físico", promise: "Compro tudo já!", reality: "Paga apenas uma fração do valor, escolhe só o que interessa", loss: "Perda massiva", time: "1 ida + 1 volta" },
    { platform: "Brechó online", promise: "Fotos bonitas", reality: "Comissão alta + frete; peças ficam meses no estoque", loss: "Perda significativa", time: "Semanas/meses" },
    { platform: "Marketplaces", promise: "Alcance nacional", reality: "Taxas altas + anúncios; negociação infinita", loss: "Perda moderada", time: "Semanas" },
    { platform: "Grupos WhatsApp", promise: "É rapidinho", reality: "Lote obrigatório, fotos ruins, pessoa some", loss: "Perda variável", time: "Horas em chat" }
  ];

  const painPoints = [
    "Desvalorização brutal – intermediários ficam com grande parte do seu dinheiro",
    "Filas e logística chata – ir ao correio, marcar retirada, pagar embalagem",
    "Negociação exaustiva – faz por menos?, guarda pra mim?, troca?",
    "Peças encalhadas – meses até vender (afinal, é dinheiro vivo)",
    "Qualidade incerta – fotos escuras, descrições vagas, defeitos omitidos",
    "Taxas e comissões escondidas – está barato? Olhe as letras miúdas",
    "Falta de proteção – calote, não entrega, peça manchada e… acabou",
    "Sustentabilidade zero – fast-fashion e brechó empurram volume, não reutilização",
    "Oferta desbalanceada – muita body RN, zero casaco quando você precisa",
    "Comunidade? Nenhuma – é cada um por si"
  ];

  const benefits = [
    { 
      title: "Girinha = crédito quase 1:1", 
      desc: `Taxa justa de apenas ${taxaTransacao}%: você mantém a maior parte do valor em Girinhas, muito melhor que outros intermediários.`,
      exclusive: true
    },
    { 
      title: "Missões inteligentes", 
      desc: "Alguma faixa/tipo esgotado? A plataforma lança missão-relâmpago que paga Girinhas bônus para quem publicar exatamente isso."
    },
    { 
      title: "Reputação visível", 
      desc: "Fotos reais, peça lavada e sem bolinha. Feedback ruim? Seu anúncio some. A comunidade se autorregula."
    },
    { 
      title: "Logística hiperlocal", 
      desc: "Busca e entrega na vizinhança; sem correio, sem atrasos."
    },
    { 
      title: "Zero desperdício de tempo", 
      desc: "Posta em 2 min, Girinhas caem assim que a outra mãe confirma reserva. Usa os créditos na hora.",
      exclusive: true
    },
    { 
      title: "100% comunitário", 
      desc: "Não existe loja tirando margem. Toda Girinha fica girando entre as mães – todo mundo ganha."
    },
    {
      title: "Sistema de reservas inteligente",
      desc: "Reservou? Suas Girinhas ficam bloqueadas até a entrega. Não conseguiu reservar? Entre na fila de espera sem bloquear nada.",
      exclusive: true
    },
    {
      title: "Bônus diário garantido",
      desc: "Acesse a plataforma diariamente e ganhe Girinhas de bônus. Constância é recompensada!",
      exclusive: true
    },
    {
      title: "Transferências entre mães",
      desc: "Precisa enviar Girinhas para outra mãe? Sistema P2P com taxa mínima para manter a economia girando."
    },
    {
      title: "Programa de indicações",
      desc: "Traga suas amigas e ganhe recompensas! Cada nova mãe ativa na comunidade gera bônus para você."
    }
  ];

  const steps = [
    { 
      number: "01", 
      title: "Cumpra a missão de entrada", 
      desc: `Publique ${itensNecessarios} itens (roupas, calçados, brinquedos ou outros) e ganhe ${recompensaPacto} Girinhas!`,
      features: ["Foto com boa iluminação", "Estado da peça (novo, seminovo, etc.)", "Tamanho e marca", `${recompensaPacto} Girinhas liberadas instantaneamente`]
    },
    { 
      number: "02", 
      title: "Receba Girinhas ou entre na fila", 
      desc: "Item disponível? Suas Girinhas são bloqueadas e a reserva é imediata. Item ocupado? Entre na fila de espera sem custo!",
      features: ["Bloqueio automático para reservas", "Fila de espera sem taxa", "Acompanhe sua posição", "WhatsApp liberado após reserva"]
    },
    { 
      number: "03", 
      title: "Troque por outras peças", 
      desc: "Use suas Girinhas para pegar qualquer peça disponível na plataforma. Sistema inteligente destaca itens do tamanho do seu filho.",
      features: ["Catálogo sempre atualizado", "Busca por tamanho, tipo, marca", "Destaque para tamanhos do seu filho", "Preferência para mesma escola"]
    },
    { 
      number: "04", 
      title: "Receba em casa com segurança", 
      desc: "Após a reserva, WhatsApps são liberados para coordenar entrega. Apenas neste momento há contato direto entre as partes.",
      features: ["Contato liberado apenas pós-reserva", "Entrega por mães próximas", "Prioridade para mesma escola", "Avalie a experiência"]
    }
  ];

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Sistema de Reservas Seguro",
      desc: "Girinhas bloqueadas na reserva garantem segurança. Fila de espera sem custo para itens ocupados."
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Minhas Reservas",
      desc: "Acompanhe todas suas reservas ativas, posição na fila e histórico completo em uma tela dedicada."
    },
    {
      icon: <Gift className="w-8 h-8" />,
      title: "Bônus Diário",
      desc: "Entre todo dia e ganhe Girinhas extras! Recompensamos a participação ativa na comunidade."
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Transferências P2P",
      desc: "Envie Girinhas para outras mães com taxa mínima. Perfeito para presentes ou ajuda mútua."
    },
    {
      icon: <Plus className="w-8 h-8" />,
      title: "Programa de Indicações",
      desc: "Convide amigas e ganhe recompensas quando elas se tornarem ativas na plataforma."
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Contato Seguro",
      desc: "WhatsApp liberado apenas após reserva confirmada. Zero spam, máxima segurança."
    },
    {
      icon: <User className="w-8 h-8" />,
      title: "Perfil dos Filhos",
      desc: "Cadastre idade e tamanhos dos seus filhos para receber destaques personalizados no feed."
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "Conexão Escolar",
      desc: "Informe a escola do seu filho para priorizar entregas entre mães da mesma instituição."
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Feed Inteligente",
      desc: "ItemCard com todas as informações importantes e destaque automático para peças do tamanho do seu filho."
    }
  ];

  const faqs = [
    {
      q: `Por que vocês cobram ${taxaTransacao}% em Girinhas?`,
      a: `A taxa de ${taxaTransacao}% em Girinhas nos permite manter a plataforma funcionando, desenvolver novos recursos e garantir a qualidade do serviço. Comparado a outros intermediários que ficam com grandes porcentagens do valor, nossa taxa é muito mais justa e transparente.`
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
      q: "Como sei que vou receber uma peça de qualidade?",
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
        {/* Hero Section */}
        <section className="py-12 md:py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
              🎉 100% gratuito!
            </Badge>
            
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="h-12 md:h-16 w-12 md:w-16 text-primary mr-4" />
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                GiraMãe
              </h1>
            </div>
            
            <h2 className="text-xl md:text-3xl font-bold text-gray-800 mb-4">
              Revolução na troca de roupas infantis
            </h2>
            
            <h3 className="text-lg md:text-2xl font-semibold text-gray-700 mb-6">
              Juntas, construímos uma <span className="text-primary">comunidade mais forte!</span>
            </h3>
            
            <p className="text-base md:text-xl text-gray-700 mb-8 leading-relaxed max-w-3xl mx-auto">
              No GiraMãe, cada peça infantil vira <strong>crédito integral</strong> para trocar por outras. 
              Missões especiais recompensam sua participação, criando uma <em>rede de apoio entre mães</em> 
              que compartilham os mesmos desafios da maternidade.
            </p>
            
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-8 max-w-3xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                <Gift className="h-8 w-8 text-green-600 mr-3" />
                <h3 className="text-xl font-bold text-green-700">Comece com {recompensaPacto} Girinhas!</h3>
              </div>
              <p className="text-green-700 text-lg">
                Você já inicia podendo obter suas primeiras peças de roupas <strong>sem desembolsar 1 centavo!</strong> 
                Apenas cumpra nossa única missão obrigatória: publique {itensNecessarios} itens (roupas, calçados, brinquedos ou outros) 
                e ganhe {recompensaPacto} Girinhas instantaneamente.
              </p>
              
              {totalGirinhasMissoes > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-700 font-semibold">
                    🎯 Total disponível em missões: <span className="text-2xl">{totalGirinhasMissoes} Girinhas</span>
                  </p>
                  <p className="text-blue-600 text-sm mt-2">
                    Complete todas as missões e tenha {totalGirinhasMissoes} Girinhas para trocar por itens na plataforma!
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button size="lg" asChild className="w-full sm:w-auto bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white px-8 py-4 text-lg rounded-full transform hover:scale-105 transition-all duration-300">
                <Link to="/auth">
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="w-full sm:w-auto px-8 py-4 text-lg rounded-full border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300">
                <Link to="/feed">
                  Ver Itens Disponíveis
                </Link>
              </Button>
            </div>
            
            <p className="text-center text-gray-600 text-sm mt-4 italic">
              Mães trocando roupas infantis de forma sustentável
            </p>
          </div>
        </section>

        {/* Problems Section */}
        <section className="py-12 md:py-20 px-4 bg-white/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6">
                Por que as alternativas atuais para trocas infantis <span className="text-amber-600">não funcionam</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-600">
                Entenda os <strong>desafios comuns</strong> que toda mãe enfrenta:
              </p>
            </div>
            
            {/* Mobile Cards */}
            <div className="md:hidden space-y-4 mb-8">
              {problemsData.map((row, index) => (
                <Card key={index} className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2">{row.platform}</h3>
                    <p className="text-green-600 text-sm mb-2">Promessa: {row.promise}</p>
                    <p className="text-gray-600 text-sm mb-3">Realidade: {row.reality}</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-600 font-bold">💸 {row.loss}</span>
                      <span className="text-red-600">⏱️ {row.time}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto mb-8">
              <table className="w-full bg-white rounded-lg shadow-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Onde você tenta</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">O que prometem</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">O que acontece de fato</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-red-600">💸 Resultado</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-red-600">⏱️ Tempo perdido</th>
                  </tr>
                </thead>
                <tbody>
                  {problemsData.map((row, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="px-6 py-4 font-medium text-gray-900">{row.platform}</td>
                      <td className="px-6 py-4 text-green-600">{row.promise}</td>
                      <td className="px-6 py-4 text-gray-600">{row.reality}</td>
                      <td className="px-6 py-4 text-red-600 font-bold">{row.loss}</td>
                      <td className="px-6 py-4 text-red-600">{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pain Points */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-xl md:text-2xl font-bold text-center text-amber-600 mb-6">
                <span className="text-amber-500">10 desafios</span> que toda mãe enfrenta
              </h3>
              <p className="text-center text-gray-600 mb-8">(e como o GiraMãe resolve cada um)</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {painPoints.map((point, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 text-sm">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-pink-50 to-purple-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-6 bg-blue-100 text-blue-800 text-lg font-medium px-4 py-2 rounded-full">
                SOMOS NOVOS e queremos MUDAR o jogo
              </Badge>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6">
                O que <span className="text-primary">só o GiraMãe</span> faz
              </h2>
              <div className="bg-white rounded-lg p-6 md:p-8 shadow-lg max-w-4xl mx-auto">
                <blockquote className="text-lg md:text-xl text-gray-700 italic mb-4">
                  "Juntas somos mais fortes. No GiraMãe, cada troca fortalece toda a comunidade."
                </blockquote>
                <p className="text-lg md:text-xl font-semibold text-primary">
                  Taxa justa de {taxaTransacao}%, missões que recompensam e uma rede de apoio entre mães.
                </p>
              </div>
            </div>
            
            <h3 className="text-xl md:text-2xl font-bold text-center text-gray-900 mb-8">
              Recursos que só existem aqui
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className={`border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 ${benefit.exclusive ? 'border-2 border-green-400' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-primary" />
                      </div>
                      {benefit.exclusive && (
                        <Badge className="bg-green-100 text-green-800 text-xs">Exclusivo</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">{benefit.desc}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6">
                Funcionalidades <span className="text-primary">inteligentes</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-600">
                Tecnologia que facilita sua vida e potencializa sua experiência na comunidade
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="como-funciona" className="py-12 md:py-20 px-4 bg-gradient-to-br from-pink-50 to-purple-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6">
                Como funciona o <span className="text-primary">GiraMãe</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-600">
                Simples, rápido e sem complicação. Veja como transformar suas peças em créditos:
              </p>
            </div>
            
            <div className="space-y-8 md:space-y-12">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0 mx-auto md:mx-0">
                    {step.number}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 mb-4 text-lg">{step.desc}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {step.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600 justify-center md:justify-start">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Example */}
            <div className="mt-16 bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-lg max-w-4xl mx-auto">
              <h3 className="text-xl md:text-2xl font-bold text-center text-gray-900 mb-8">
                Exemplo prático: como Ana trocou um macacão por um casaco
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-4">1</div>
                  <h4 className="font-bold text-gray-900 mb-2">Postou macacão</h4>
                  <p className="text-sm text-gray-600 mb-1">Tamanho 2 anos, seminovo</p>
                  <p className="text-sm font-semibold text-teal-600">Ganhou Girinhas</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-200 text-green-800 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-4">2</div>
                  <h4 className="font-bold text-gray-900 mb-2">Carla reservou</h4>
                  <p className="text-sm text-gray-600 mb-1">Em 3 horas a peça foi reservada</p>
                  <p className="text-sm font-semibold text-green-600">WhatsApps liberados!</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-200 text-purple-800 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-4">3</div>
                  <h4 className="font-bold text-gray-900 mb-2">Ana escolheu casaco</h4>
                  <p className="text-sm text-gray-600 mb-1">Tam 3 anos, perfeito estado</p>
                  <p className="text-sm font-semibold text-purple-600">Gastou Girinhas</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-200 text-orange-800 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-4">4</div>
                  <h4 className="font-bold text-gray-900 mb-2">Recebeu em casa</h4>
                  <p className="text-sm text-gray-600 mb-1">Marina entregou no dia seguinte</p>
                  <p className="text-sm font-semibold text-orange-600">Zero frete!</p>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-lg font-bold text-green-700">
                  Resultado: Ana trocou uma peça que não serve mais por outra que precisa, mantendo o valor integral!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Privacy Section */}
        <section className="py-12 md:py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6">
                <Shield className="inline w-10 h-10 text-primary mr-3" />
                Segurança e <span className="text-primary">Privacidade</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-600">
                Sua segurança e privacidade são nossa prioridade absoluta
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Settings className="w-8 h-8 text-primary" />
                    <CardTitle className="text-xl">Contato Protegido</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    <strong>WhatsApp é liberado APENAS após reserva confirmada</strong> com Girinhas bloqueadas. 
                    Este é o único meio de contato entre comprador e vendedor na plataforma.
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Zero spam ou contatos indesejados
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Apenas negócios sérios e confirmados
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Proteção total da sua privacidade
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-8 h-8 text-primary" />
                    <CardTitle className="text-xl">Sistema Antifraude</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    Girinhas bloqueadas garantem compromisso real. Reputação visível e avaliações 
                    criam um ambiente de confiança mútua.
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Bloqueio automático de Girinhas
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Sistema de reputação transparente
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Política de devolução garantida
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-amber-800 mb-2">Condição Importante</h3>
                  <p className="text-amber-700">
                    <strong>O WhatsApp é o ÚNICO meio de contato disponível entre as partes.</strong> 
                    Não há chat interno, comentários públicos ou outras formas de comunicação. 
                    Esta é uma condição fundamental para usar nossa comunidade, garantindo organização e segurança para todos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-12 md:py-20 px-4 bg-gradient-to-br from-pink-50 to-purple-50">
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
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base md:text-lg text-gray-900 text-left pr-4">{faq.q}</CardTitle>
                      <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${openFaq === index ? 'rotate-180' : ''}`} />
                    </div>
                  </CardHeader>
                  {openFaq === index && (
                    <CardContent className="pt-0">
                      <p className="text-gray-600">{faq.a}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <p className="text-lg text-gray-600 mb-6">Ainda tem dúvidas?</p>
              <p className="text-gray-600 mb-6">Nossa equipe está pronta para ajudar você a começar sua jornada no GiraMãe</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white">
                  Falar com nossa equipe
                </Button>
                <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white">
                  Ver tutorial completo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 md:py-20 px-4 bg-gradient-to-r from-primary to-pink-500 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white text-lg font-medium px-4 py-2 rounded-full">
              Plataforma 100% gratuita
            </Badge>
            
            <h2 className="text-2xl md:text-5xl font-bold mb-6">
              Pronta para a <span className="text-yellow-300">revolução?</span>
            </h2>
            
            <p className="text-lg md:text-xl mb-8 opacity-90 max-w-3xl mx-auto">
              Junte-se às mães inteligentes que já descobriram como preservar o valor das roupas infantis, 
              economizar tempo e ainda ajudar outras famílias.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="flex flex-col md:flex-row items-center justify-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0" />
                <span className="font-semibold text-center md:text-left">⚖️ Troca justa<br />Valor preservado</span>
              </div>
              <div className="flex flex-col md:flex-row items-center justify-center gap-3">
                <Zap className="w-6 h-6 text-yellow-300 flex-shrink-0" />
                <span className="font-semibold text-center md:text-left">⚡ Super rápido<br />Trocas em 24h</span>
              </div>
              <div className="flex flex-col md:flex-row items-center justify-center gap-3">
                <Recycle className="w-6 h-6 text-green-300 flex-shrink-0" />
                <span className="font-semibold text-center md:text-left">🌱 Sustentável<br />Economia circular</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" variant="secondary" asChild className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg rounded-full font-semibold">
                <Link to="/auth">
                  Começar agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg rounded-full">
                <Link to="/feed">
                  Explorar comunidade
                </Link>
              </Button>
            </div>
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
                A plataforma que revoluciona a troca de roupas infantis. 
                Economia circular, sustentabilidade e comunidade em um só lugar.
              </p>
              <div className="text-gray-400 space-y-1">
                <p>📧 contato@giramae.com.br</p>
                <p>📱 (11) 99999-9999</p>
                <p>📍 São Paulo, SP</p>
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
