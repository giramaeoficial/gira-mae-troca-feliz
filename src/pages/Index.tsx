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
  ChevronDown
} from "lucide-react";

const LandingPageOptimized = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const stats = [
    { value: "10K+", label: "Mães conectadas" },
    { value: "50K+", label: "Peças trocadas" },
    { value: "R$ 2M+", label: "Valor preservado" }
  ];

  const problemsData = [
    { platform: "Brechó físico", promise: "Compro tudo já!", reality: "Paga 20% do valor, escolhe só o que interessa", loss: "-80%", time: "1 ida + 1 volta" },
    { platform: "Brechó online", promise: "Fotos bonitas", reality: "40% comissão + frete; peças ficam meses no estoque", loss: "-50%", time: "Semanas/meses" },
    { platform: "Marketplaces", promise: "Alcance nacional", reality: "12%-18% taxa + anúncios; negociação infinita", loss: "-30%", time: "Semanas" },
    { platform: "Grupos WhatsApp", promise: "É rapidinho", reality: "Lote obrigatório, fotos ruins, pessoa some", loss: "-25%", time: "Horas em chat" }
  ];

  const painPoints = [
    "Desvalorização brutal – intermediários ficam com 40-80% do seu dinheiro",
    "Filas e logística chata – ir ao correio, marcar retirada, pagar embalagem",
    "Negociação exaustiva – faz por menos?, guarda pra mim?, troca?",
    "Peças encalhadas – meses até vender (afinal, é dinheiro vivo)",
    "Qualidade incerta – fotos escuras, descrições vagas, defeitos omitidos",
    "Taxas e comissões escondidas – está barato? Olhe as letras miúdas",
    "Falta de proteção – calote, não entrega, peça manchada e… acabou",
    "Sustentabilidade zero – fast-fashion e brechó empurram volume, não reutilização",
    "Oferta desbalanceada – muita body RN, zero casaco 5-6 anos quando você precisa",
    "Comunidade? Nenhuma – é cada um por si"
  ];

  const benefits = [
    { 
      title: "Girinha = crédito quase 1:1", 
      desc: "Taxa justa de apenas 5%: você recebe 95% do valor em Girinhas, muito melhor que outros intermediários que ficam com 40-80%.",
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
    }
  ];

  const steps = [
    { 
      number: "01", 
      title: "Poste sua peça", 
      desc: "Tire uma foto, descreva o estado e publique. Leva menos de 2 minutos!",
      features: ["Foto com boa iluminação", "Estado da peça (novo, seminovo, etc.)", "Tamanho e marca", "Valor justo automaticamente calculado"]
    },
    { 
      number: "02", 
      title: "Receba Girinhas", 
      desc: "Assim que outra mãe reservar, suas Girinhas caem na conta instantly.",
      features: ["1 real = 1 Girinha", "Sem taxas ou comissões", "Crédito liberado na confirmação", "Sem prazo de espera"]
    },
    { 
      number: "03", 
      title: "Troque por outras peças", 
      desc: "Use suas Girinhas para pegar qualquer peça disponível na plataforma.",
      features: ["Catálogo sempre atualizado", "Busca por tamanho, tipo, marca", "Reserva instantânea", "Entrega na vizinhança"]
    },
    { 
      number: "04", 
      title: "Receba em casa", 
      desc: "Logística hiperlocal: outras mães da sua região fazem a entrega.",
      features: ["Entrega por mães próximas", "Sem custo de frete", "Agende quando quiser", "Avalie a experiência"]
    }
  ];

  const faqs = [
    {
      q: "Por que vocês cobram 5% em Girinhas?",
      a: "A taxa de 5% em Girinhas nos permite manter a plataforma funcionando, desenvolver novos recursos e garantir a qualidade do serviço. Comparado a outros intermediários que ficam com 40-80% do valor, nossa taxa é muito mais justa e transparente."
    },
    {
      q: "Como sei que vou receber uma peça de qualidade?",
      a: "Nosso sistema de reputação é rigoroso. Cada usuária tem uma avaliação visível baseada em trocas anteriores. Fotos devem ser reais e detalhadas. Se alguém enviar peças em mau estado, a reputação cai e os anúncios são removidos. A própria comunidade se autorregula para manter a qualidade alta."
    },
    {
      q: "E se eu não gostar da peça que recebi?",
      a: "Temos uma política de satisfação garantida. Se a peça não estiver conforme descrito, você pode devolver em até 7 dias e suas Girinhas são restituídas integralmente. Além disso, o sistema de avaliações previne esse tipo de problema."
    },
    {
      q: "Como funciona a logística? Tenho que ir buscar longe?",
      a: "Nossa logística é hiperlocal! As entregas são feitas por outras mães da sua região. Você agenda um horário conveniente e recebe em casa, sem custos de frete. É rápido, prático e você ainda conhece mães da sua vizinhança."
    },
    {
      q: "Posso confiar no sistema de Girinhas?",
      a: "As Girinhas têm valor real. Diferente de outros apps que desvalorizam seus itens, no GiraMãe você mantém 95% do poder de compra (descontando apenas nossa taxa de 5%). É como ter uma conta corrente, mas sem taxas bancárias abusivas."
    },
    {
      q: "E se ninguém quiser a minha peça?",
      a: "Nosso algoritmo inteligente promove suas peças para usuárias que procuram exatamente aquilo. Além disso, temos as Missões - quando algum tipo de peça está escasso, oferecemos bônus em Girinhas para quem publicar. Isso mantém o marketplace sempre equilibrado."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Sparkles className="h-8 w-8 text-primary mr-2" />
              <span className="text-2xl font-bold text-primary">GiraMãe</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#como-funciona" className="text-gray-600 hover:text-primary transition-colors">Como funciona</a>
              <a href="#faq" className="text-gray-600 hover:text-primary transition-colors">FAQ</a>
              <a href="#contato" className="text-gray-600 hover:text-primary transition-colors">Contato</a>
              <Button className="bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white rounded-full">
                Começar grátis
              </Button>
            </div>
          </div>
        </div>
      </nav>

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
            Pare de deixar <span className="text-red-500">dinheiro na mesa!</span>
          </h3>
          
          <p className="text-base md:text-xl text-gray-700 mb-8 leading-relaxed max-w-3xl mx-auto">
            Com o GiraMãe você transforma cada peça infantil em <strong>crédito integral</strong>, 
            troca na mesma qualidade e mantém o guarda-roupa sempre no ponto —
            <em>rápido, justo e sustentável</em>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white px-8 py-4 text-lg rounded-full transform hover:scale-105 transition-all duration-300">
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-4 text-lg rounded-full border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300">
              Ver Itens Disponíveis
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-xl md:text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-xs md:text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
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
              Por que quase toda forma tradicional de vender/comprar itens infantis <span className="text-red-600">falha</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600">
              E só o GiraMãe resolve de verdade. Veja onde você está <strong>perdendo dinheiro e tempo</strong>:
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-red-600">💸 Dinheiro perdido</th>
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
            <h3 className="text-xl md:text-2xl font-bold text-center text-red-600 mb-6">
              <span className="text-red-500">10 dores</span> que TODAS essas opções provocam
            </h3>
            <p className="text-center text-gray-600 mb-8">(e o GiraMãe corta pela raiz)</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {painPoints.map((point, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
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
                Outras plataformas desvalorizam suas peças, cobram taxas altas e fazem você esperar.
              </blockquote>
              <p className="text-lg md:text-xl font-semibold text-primary">
                O GiraMãe cobra apenas 5% em Girinhas, acelera a troca e beneficia toda a comunidade.
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

      {/* How it Works */}
      <section id="como-funciona" className="py-12 md:py-20 px-4 bg-white">
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

          {/* Example - Exato como na imagem */}
          <div className="mt-16 bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-lg max-w-4xl mx-auto">
            <h3 className="text-xl md:text-2xl font-bold text-center text-gray-900 mb-8">
              Exemplo prático: como Ana trocou um macacão por um casaco
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-4">1</div>
                <h4 className="font-bold text-gray-900 mb-2">Postou macacão</h4>
                <p className="text-sm text-gray-600 mb-1">Tamanho 2 anos, R$ 80 orig.</p>
                <p className="text-sm font-semibold text-teal-600">Ganhou 80 Girinhas</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-200 text-green-800 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-4">2</div>
                <h4 className="font-bold text-gray-900 mb-2">Carla reservou</h4>
                <p className="text-sm text-gray-600 mb-1">Em 3 horas a peça foi reservada</p>
                <p className="text-sm font-semibold text-green-600">Girinhas liberadas!</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-200 text-purple-800 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-4">3</div>
                <h4 className="font-bold text-gray-900 mb-2">Ana escolheu casaco</h4>
                <p className="text-sm text-gray-600 mb-1">Tam 3 anos, perfeito estado</p>
                <p className="text-sm font-semibold text-purple-600">Gastou 80 Girinhas</p>
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
                Resultado: Ana trocou uma peça que não serve mais por outra que precisa, sem perder 1 centavo!
              </p>
            </div>
            
            <div className="text-center mt-6">
              <Button size="lg" className="bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white px-8 py-4 rounded-full">
                Quero fazer minha primeira troca
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
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
            Oferta de lançamento - 100% gratuito para sempre
          </Badge>
          
          <h2 className="text-2xl md:text-5xl font-bold mb-6">
            Pronta para a <span className="text-yellow-300">revolução?</span>
          </h2>
          
          <p className="text-lg md:text-xl mb-8 opacity-90 max-w-3xl mx-auto">
            Junte-se a mais de 10.000 mães inteligentes que já descobriram como preservar o valor das roupas infantis, 
            economizar tempo e ainda ajudar outras famílias.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="flex flex-col md:flex-row items-center justify-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0" />
              <span className="font-semibold text-center md:text-left">⚖️ Troca 1:1<br />Sem perda de valor</span>
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
          
          <div className="bg-white/10 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
            <p className="text-lg font-semibold mb-2">Últimas vagas para o programa Beta</p>
            <p className="opacity-90">Estamos limitando o número de usuárias para garantir a melhor experiência. Apenas 500 vagas restantes!</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg rounded-full font-semibold">
              Garantir minha vaga gratuita
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg rounded-full">
              Baixar o app agora
            </Button>
          </div>
          
          <div className="text-center opacity-90 mb-8">
            <p className="text-sm mb-4">✅ Sem cartão de crédito • ✅ Sem taxa de inscrição • ✅ Cancele quando quiser</p>
            <div className="flex items-center justify-center gap-2 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-300 fill-current" />
              ))}
              <span className="font-semibold ml-2">4.9/5 nas lojas de app</span>
            </div>
          </div>
          
          <div className="bg-yellow-400 text-gray-900 rounded-lg p-6 max-w-4xl mx-auto">
            <p className="font-semibold text-base md:text-lg">
              <strong>Garantimos:</strong> Se você não economizar pelo menos R$ 200 nos primeiros 3 meses usando o GiraMãe, 
              nós devolvemos todo o valor que você teria perdido em outras plataformas. 
              É isso mesmo - <em>seu sucesso é garantido ou seu dinheiro de volta!</em>
            </p>
          </div>
        </div>
      </section>

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
