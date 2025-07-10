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
  Trophy,
  Target,
  Gift
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/shared/Header";
import QuickNav from "@/components/shared/QuickNav";
import { useAuth } from "@/hooks/useAuth";
import { useConfigSistema } from "@/hooks/useConfigSistema";
import { useMissoes } from "@/hooks/useMissoes";
import { useConfigCategorias } from "@/hooks/useConfigCategorias";

const LandingPageOptimized = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const { user } = useAuth();
  const { taxaTransacao } = useConfigSistema();
  const { missoes } = useMissoes();
  const { configuracoes } = useConfigCategorias();

  // Calcular valores dinâmicos das missões
  const totalGirinhasMissoes = missoes?.reduce((total, missao) => total + missao.recompensa_girinhas, 0) || 0;
  const missaoPactoEntrada = missoes?.find(m => m.tipo_missao === 'basic' && m.categoria === 'pacto_entrada');
  const recompensaPacto = missaoPactoEntrada?.recompensa_girinhas || 100;
  const itensNecessarios = missaoPactoEntrada?.condicoes?.quantidade || 2;

  // Categorizar missões por tipo
  const missoesPorTipo = {
    basic: missoes?.filter(m => m.tipo_missao === 'basic') || [],
    engagement: missoes?.filter(m => m.tipo_missao === 'engagement') || [],
    social: missoes?.filter(m => m.tipo_missao === 'social') || []
  };

  // Criar resumo de faixas de preços das categorias
  const faixasPrecos = configuracoes?.map(cat => ({
    nome: cat.nome,
    minimo: cat.valor_minimo,
    maximo: cat.valor_maximo,
    icone: cat.icone
  })) || [];

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
    "Falta de proteção – calote, não entrega, peça manchada e… acabimport React, { useState } from 'react';
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
  Gift
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
      desc: `Taxa justa de apenas ${taxaTransacao}%: você recebe ${100 - taxaTransacao}% do valor em Girinhas, muito melhor que outros intermediários que ficam com 40-80%.`,
      exclusive: true
    },
    { 
      title: "Sistema de bloqueio inteligente", 
      desc: "Ao reservar um item, suas Girinhas ficam bloqueadas até a confirmação da entrega. Se não rolar, o dinheiro volta automaticamente. Zero risco de calote!"
    },
    { 
      title: "Fila de espera automática", 
      desc: "Item esgotado? Entre na fila! Quando alguém desistir ou um item similar aparecer, você é notificada na hora."
    },
    { 
      title: "WhatsApp liberado só quando necessário", 
      desc: "Após a reserva confirmada, o WhatsApp de ambas as partes é liberado para marcar entrega. Privacidade total até o momento certo!"
    },
    { 
      title: "Bônus diário garantido", 
      desc: "Todo dia você pode coletar Girinhas grátis! Acesse o app, colete seu bônus e mantenha sua carteira sempre ativa."
    },
    { 
      title: "Transferências P2P", 
      desc: `Envie Girinhas para outras mães com taxa baixíssima de ${useConfigSistema().taxaTransferencia || 1}%. Ideal para presentes ou ajudar uma amiga!`
    },
    { 
      title: "Sistema de indicações premiado", 
      desc: "Indique amigas e ganhe Girinhas a cada cadastro, primeira publicação e primeira troca. Todo mundo sai ganhando!"
    },
    { 
      title: "Cards inteligentes no feed", 
      desc: "Cada item mostra foto, preço, tamanho, distância e até se tem fila de espera. Informações completas de uma só vez!"
    },
    { 
      title: "Gestão completa de reservas", 
      desc: "Na tela 'Minhas Reservas' você acompanha tudo: itens que reservou, que vendeu, histórico completo e status em tempo real."
    },
    { 
      title: "Cadastro de filhos e escolas", 
      desc: "Cadastre seus filhos com idades e escola. O sistema destaca automaticamente itens do tamanho deles e facilita entregas entre mães da mesma escola!"
    },
    { 
      title: "Logística hiperlocal", 
      desc: "Busca e entrega na vizinhança; sem correio, sem atrasos. Conectamos mães da mesma região e escola!"
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
      title: "Explore o feed inteligente", 
      desc: "Navegue pelos cards com informações completas: fotos, preços, tamanhos, distância e disponibilidade.",
      features: ["Cards com informações completas", "Filtros por tamanho dos seus filhos", "Distância da sua localização", "Status de fila de espera visível"]
    },
    { 
      number: "03", 
      title: "Reserve com proteção total", 
      desc: "Ao reservar, suas Girinhas ficam bloqueadas (não perdidas!). Se der problema, o dinheiro volta automaticamente.",
      features: ["Girinhas bloqueadas, não perdidas", "WhatsApp liberado para contato", "Reembolso automático se necessário", "Fila de espera para itens esgotados"]
    },
    { 
      number: "04", 
      title: "Gerencie tudo em um lugar", 
      desc: "Use 'Minhas Reservas' para acompanhar vendas, compras, histórico e coletar bônus diário.",
      features: ["Acompanhe todas suas transações", "Colete bônus diário", "Transfira Girinhas para amigas", "Sistema de indicações premiado"]
    }
  ];

  const faqs = [
    {
      q: `Por que vocês cobram ${taxaTransacao}% em Girinhas?`,
      a: `A taxa de ${taxaTransacao}% em Girinhas nos permite manter a plataforma funcionando, desenvolver novos recursos e garantir a qualidade do serviço. Comparado a outros intermediários que ficam com 40-80% do valor, nossa taxa é muito mais justa e transparente.`
    },
    {
      q: "Como funciona o sistema de bloqueio de Girinhas?",
      a: "Quando você reserva um item, o valor é bloqueado (não perdido!) na sua carteira. Apenas após a confirmação da entrega as Girinhas são transferidas para o vendedor. Se houver problema, o valor retorna automaticamente para você. É proteção total contra calotes!"
    },
    {
      q: "O que acontece com meu WhatsApp na plataforma?",
      a: "Seu WhatsApp só é revelado após uma reserva confirmada, exclusivamente para as partes envolvidas marcarem a entrega. Esta é a única forma de contato disponível na plataforma e é uma condição essencial para usar nossa comunidade. Sua privacidade está protegida até ser realmente necessário."
    },
    {
      q: "Como funcionam os valores dos itens? Qualquer preço vale?",
      a: `Não! Cada categoria tem faixas de valores pré-definidas para manter a economia justa: ${faixasPrecos.slice(0, 3).map(f => `${f.icone} ${f.nome}: ${f.minimo}-${f.maximo} Girinhas`).join(', ')}. Isso evita preços absurdos e orienta valores realistas.`
    },
    {
      q: "Como sei que vou receber uma peça de qualidade?",
      a: "Nosso sistema de reputação é rigoroso. Cada usuária tem uma avaliação visível baseada em trocas anteriores. Fotos devem ser reais e detalhadas. Se alguém enviar peças em mau estado, a reputação cai e os anúncios são removidos. A própria comunidade se autorregula para manter a qualidade alta."
    },
    {
      q: "E se eu não gostar da peça que recebi?",
      a: "Temos uma política de satisfação garantida. Se a peça não estiver conforme descrito, você pode devolver em até 7 dias e suas Girinhas são restituídas integralmente. Caso o usuário que forneceu a peça não colaborar, a plataforma te garante a devolução e restituição de suas Girinhas."
    },
    {
      q: "Como funciona a logística? Tenho que ir buscar longe?",
      a: "Nossa logística é hiperlocal! As entregas são feitas por outras mães da sua região. Você agenda um horário conveniente e recebe em casa, sem custos de frete. É rápido, prático e você ainda conhece mães da sua vizinhança. Se cadastrar a escola do seu filho, priorizamos mães da mesma escola!"
    },
    {
      q: "Posso confiar no sistema de Girinhas?",
      a: `As Girinhas têm valor real. Diferente de outros apps que desvalorizam seus itens, no GiraMãe você mantém ${100 - taxaTransacao}% do poder de compra (descontando apenas nossa taxa de ${taxaTransacao}%). É como ter uma conta corrente, mas sem taxas bancárias abusivas.`
    },
    {
      q: "E se ninguém quiser a minha peça?",
      a: "Nosso algoritmo inteligente promove suas peças para usuárias que procuram exatamente aquilo. Além disso, temos as Missões - quando algum tipo de peça está escasso, oferecemos bônus em Girinhas para quem publicar. Isso mantém o marketplace sempre equilibrado."
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
              Pare de deixar <span className="text-red-500">dinheiro na mesa!</span>
            </h3>
            
            <p className="text-base md:text-xl text-gray-700 mb-8 leading-relaxed max-w-3xl mx-auto">
              Com o GiraMãe você transforma cada peça infantil em <strong>crédito integral</strong>, 
              troca na mesma qualidade e mantém o guarda-roupa sempre no ponto —
              <em>rápido, justo e sustentável</em>.
            </p>
            
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-8 max-w-3xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                <Trophy className="h-8 w-8 text-green-600 mr-3" />
                <h3 className="text-xl font-bold text-green-700">Sistema de Missões Completo!</h3>
              </div>
              <p className="text-green-700 text-lg mb-4">
                Você já inicia podendo obter suas primeiras peças de roupas <strong>sem desembolsar 1 centavo!</strong> 
                Apenas cumpra nossa única missão obrigatória: publique {itensNecessarios} itens (roupas, calçados, brinquedos ou outros) 
                e ganhe {recompensaPacto} Girinhas instantaneamente.
              </p>
              
              {/* Lista de Missões Disponíveis */}
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-700">Básicas</h4>
                  </div>
                  <p className="text-sm text-blue-600 mb-2">Missões essenciais para começar</p>
                  {missoesPorTipo.basic.slice(0, 3).map(missao => (
                    <div key={missao.id} className="flex justify-between text-xs text-blue-700 mb-1">
                      <span className="truncate">{missao.titulo}</span>
                      <span className="font-semibold">+{missao.recompensa_girinhas}G</span>
                    </div>
                  ))}
                  {missoesPorTipo.basic.length > 3 && (
                    <p className="text-xs text-blue-600">+{missoesPorTipo.basic.length - 3} mais...</p>
                  )}
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold text-purple-700">Engajamento</h4>
                  </div>
                  <p className="text-sm text-purple-600 mb-2">Use a plataforma e ganhe</p>
                  {missoesPorTipo.engagement.slice(0, 3).map(missao => (
                    <div key={missao.id} className="flex justify-between text-xs text-purple-700 mb-1">
                      <span className="truncate">{missao.titulo}</span>
                      <span className="font-semibold">+{missao.recompensa_girinhas}G</span>
                    </div>
                  ))}
                  {missoesPorTipo.engagement.length > 3 && (
                    <p className="text-xs text-purple-600">+{missoesPorTipo.engagement.length - 3} mais...</p>
                  )}
                </div>

                <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-pink-600" />
                    <h4 className="font-semibold text-pink-700">Sociais</h4>
                  </div>
                  <p className="text-sm text-pink-600 mb-2">Indique e interaja</p>
                  {missoesPorTipo.social.slice(0, 3).map(missao => (
                    <div key={missao.id} className="flex justify-between text-xs text-pink-700 mb-1">
                      <span className="truncate">{missao.titulo}</span>
                      <span className="font-semibold">+{missao.recompensa_girinhas}G</span>
                    </div>
                  ))}
                  {missoesPorTipo.social.length > 3 && (
                    <p className="text-xs text-pink-600">+{missoesPorTipo.social.length - 3} mais...</p>
                  )}
                </div>
              </div>
              
              {totalGirinhasMissoes > 0 && (
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-yellow-700 font-semibold text-center">
                    🎯 Total disponível em missões: <span className="text-2xl text-yellow-800">{totalGirinhasMissoes} Girinhas</span>
                  </p>
                  <p className="text-yellow-600 text-sm mt-2 text-center">
                    💰 Equivalente a aproximadamente <strong>R$ {totalGirinhasMissoes.toLocaleString('pt-BR')},00</strong> em poder de compra!
                  </p>
                  <p className="text-yellow-600 text-xs mt-1 text-center">
                    Complete todas as missões e tenha esse valor para trocar por itens na plataforma!
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
                  O GiraMãe cobra apenas {taxaTransacao}% em Girinhas, acelera a troca e beneficia toda a comunidade.
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

            {/* Example */}
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
