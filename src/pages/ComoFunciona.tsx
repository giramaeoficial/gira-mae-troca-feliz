import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Recycle, Shield, ChevronRight } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";

const ComoFunciona = () => {
  const steps = [
    {
      number: "01",
      title: "Cadastre-se Grátis",
      description:
        "Crie sua conta em segundos e faça parte da nossa comunidade de mães conscientes.",
      icon: <Users className="h-6 w-6" />,
    },
    {
      number: "02",
      title: "Ofereça o que Não Usa",
      description:
        "Fotografe roupas que não servem mais e defina quantas Girinhas quer receber. Ou simplesmente complete missões para ganhar créditos.",
      icon: <Heart className="h-6 w-6" />,
    },
    {
      number: "03",
      title: "Encontre o que Precisa",
      description:
        "Navegue pelos itens disponíveis e reserve com suas Girinhas acumuladas.",
      icon: <Recycle className="h-6 w-6" />,
    },
    {
      number: "04",
      title: "Troque com Segurança",
      description:
        "Confirme a entrega e finalize a troca. Simples, seguro e sustentável!",
      icon: <Shield className="h-6 w-6" />,
    },
  ];

  const benefits = [
    "🆓 Gratuito para sempre",
    "💰 Economize comprando roupas",
    "🌱 Evite descartar roupas boas",
    "🤝 Conheça mães da sua região",
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Como Funciona a GiraMãe - Plataforma de Trocas entre Mães",
    description: "Aprenda como usar a GiraMãe para trocar roupas, brinquedos e calçados infantis de forma sustentável usando nossa moeda virtual Girinhas.",
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title,
      text: step.description,
    })),
    totalTime: "PT10M",
    tool: [
      {
        "@type": "Thing",
        name: "Smartphone ou Computador"
      },
      {
        "@type": "Thing", 
        name: "Girinhas (moeda virtual)"
      }
    ],
    supply: [
      {
        "@type": "Thing",
        name: "Roupas, brinquedos ou calçados infantis para trocar"
      }
    ],
    mainEntity: {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "O que são Girinhas?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Girinhas são nossa moeda virtual interna. 1 Girinha = R$ 1,00 em valor de referência. Você ganha vendendo itens e usa para comprar outros itens da comunidade."
          }
        },
        {
          "@type": "Question", 
          name: "Como ganhar Girinhas?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Você pode ganhar Girinhas vendendo itens, completando missões, recebendo bônus diário, indicando outras mães ou comprando dentro da plataforma."
          }
        }
      ]
    }
  };

  return (
    <>
      <SEOHead
        title="Como Funciona a GiraMãe - Troca de Roupas Infantis"
        description="Descubra como funciona a GiraMãe! Plataforma que conecta mães para trocar roupas, brinquedos e calçados infantis usando nossa moeda virtual Girinhas. Economia circular sustentável."
        keywords="como funciona giramae, troca roupas infantis, economia circular mães, sustentabilidade infantil, girinhas moeda virtual, brechó online sustentável"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Como Funciona
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Transforme o Guarda-Roupa dos seus Filhos
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Na GiraMãe, você troca roupas, brinquedos e calçados infantis
              usando nossa moeda virtual <strong>Girinhas</strong>. É
              sustentável, econômico e fortalece nossa comunidade!
            </p>
          </div>

          {/* Banner de Gratuidade */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-12">
            <div className="flex items-center justify-center mb-4">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                🆓 100% Gratuito
              </Badge>
            </div>
            <h2 className="text-2xl font-bold text-center mb-4 text-green-800">
              Você não precisa gastar dinheiro para participar!
            </h2>
            <p className="text-center text-green-700 max-w-2xl mx-auto">
              Ganhe Girinhas completando missões simples, recebendo bônus
              diários e oferecendo itens que não usa mais. É economia circular
              real!
            </p>
          </div>

          <section className="mb-20">
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-3xl font-bold mb-4">
                      O que são as Girinhas? 🪙
                    </h2>
                    <p className="text-lg mb-6 text-muted-foreground">
                      Girinhas são nossa moeda virtual interna.{" "}
                      <strong>1 Girinha = R$ 1,00</strong> em valor de
                      referência. Você ganha Girinhas vendendo itens e usa para
                      "comprar" outros itens da comunidade.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <ChevronRight className="h-5 w-5 text-primary" />
                        <span>Compre Girinhas ou ganhe vendendo itens</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <ChevronRight className="h-5 w-5 text-primary" />
                        <span>Use para reservar itens que precisa</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <ChevronRight className="h-5 w-5 text-primary" />
                        <span>Sistema seguro e transparente</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-primary/10 rounded-full w-48 h-48 mx-auto flex items-center justify-center text-6xl">
                      🪙
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Como obter Girinhas? */}
          <section className="mb-20">
            <Card className="bg-blue-50">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="text-center">
                    <div className="bg-secondary/20 rounded-full w-48 h-48 mx-auto flex items-center justify-center text-6xl">
                      🪙
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-4">
                      Como obter Girinhas? 🪙
                    </h2>
                    <p className="text-lg mb-6 text-muted-foreground">
                      Você pode ganhar Girinhas de várias formas, tornando sua
                      participação na GiraMãe ainda mais acessível e divertida.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <ChevronRight className="h-5 w-5 text-primary" />
                        <span>Ganhando vendendo itens</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <ChevronRight className="h-5 w-5 text-primary" />
                        <span>Ganhando através das missões</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <ChevronRight className="h-5 w-5 text-primary" />
                        <span>Ganhando atraveś do Bônus Diário</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <ChevronRight className="h-5 w-5 text-primary" />
                        <span>Indicando e Avaliando outras Mães</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <ChevronRight className="h-5 w-5 text-primary" />
                        <span>Comprando dentro da plataforma</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Como Funciona - Steps */}
          {/* <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">
              4 Passos Simples para Começar
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <Card
                  key={index}
                  className="relative group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20"
                >
                  <CardContent className="p-6 text-center">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                        {step.number}
                      </div>
                    </div>
                    <div className="text-primary mb-4 flex justify-center mt-4">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section> */}

          {/* Fluxo Detalhado de Aquisição */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">
              Como Adquirir um Item: Passo a Passo Completo
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Veja exatamente como funciona desde encontrar o item até tê-lo em
              casa, incluindo o sistema de código de segurança
            </p>

            <div className="max-w-4xl mx-auto">
              {/* Step 1: Descoberta */}
              <Card className="mb-6 border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      1
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-blue-600 mb-3">
                        Encontre o Item
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-2">
                            🔍 Formas de Descobrir:
                          </h4>
                          <ul className="space-y-1 text-sm">
                            <li>• Navegue pelo feed principal</li>
                            <li>• Use filtros (tamanho, tipo, preço)</li>
                            <li>• Busque por palavras-chave</li>
                            <li>• Veja itens de mães que você segue</li>
                            <li>
                              • Receba notificações de itens que combinam com
                              seu perfil
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">
                            👀 O que Você Vê:
                          </h4>
                          <ul className="space-y-1 text-sm">
                            <li>• Fotos do item</li>
                            <li>• Descrição detalhada</li>
                            <li>• Preço em Girinhas</li>
                            <li>• Reputação da vendedora (⭐⭐⭐⭐⭐)</li>
                            <li>• Localização aproximada</li>
                            <li>
                              • Status: "Disponível" ou "X pessoas na fila"
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Decisão */}
              <Card className="mb-6 border-l-4 border-l-orange-500">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      2
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-orange-600 mb-3">
                        Analise e Decida
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-2">
                            🤔 Verificações Importantes:
                          </h4>
                          <ul className="space-y-1 text-sm">
                            <li>• Seu saldo de Girinhas é suficiente?</li>
                            <li>• O item está no estado descrito?</li>
                            <li>• A vendedora tem boa reputação?</li>
                            <li>• A localização é conveniente?</li>
                            <li>• Há outros interessados (fila de espera)?</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">
                            💡 Dicas de Análise:
                          </h4>
                          <ul className="space-y-1 text-sm">
                            <li>• Zoom nas fotos para ver detalhes</li>
                            <li>• Leia avaliações de outras mães</li>
                            <li>• Compare preços de itens similares</li>
                            <li>• Verifique se vale a pena o transporte</li>
                            <li>• Se tiver dúvidas, mande mensagem antes</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 3: Reserva e Código */}
              <Card className="mb-6 border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      3
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-purple-600 mb-3">
                        Faça a Reserva e Receba seu Código
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">
                            🎯 O que Acontece Quando Você Clica "Reservar":
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p>
                                <strong>✅ Instantâneo:</strong>
                              </p>
                              <ul className="space-y-1 ml-4">
                                <li>• Suas Girinhas são bloqueadas</li>
                                <li>• Item sai do feed para outros</li>
                                <li>
                                  • Sistema gera código único de 6 dígitos
                                </li>
                                <li>• Vendedora recebe notificação</li>
                                <li>• Timer de 24h é ativado</li>
                              </ul>
                            </div>
                            <div>
                              <p>
                                <strong>🔢 Seu Código de Reserva:</strong>
                              </p>
                              <ul className="space-y-1 ml-4">
                                <li>• Aparece na tela imediatamente</li>
                                <li>• Exemplo: "ABC123"</li>
                                <li>• Fica salvo em "Minhas Reservas"</li>
                                <li>• É único para essa transação</li>
                                <li>• Expira em 24h se não usar</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">
                            📱 Tela de Confirmação de Reserva:
                          </h4>
                          <div className="bg-white p-4 rounded border shadow-sm">
                            <div className="text-center">
                              <div className="text-green-600 text-2xl mb-2">
                                ✅
                              </div>
                              <h5 className="font-bold text-lg">
                                Reserva Confirmada!
                              </h5>
                              <p className="text-gray-600 mb-4">
                                Vestido Azul Tam 2 Anos - 25 Girinhas
                              </p>
                              <div className="bg-gray-100 p-3 rounded">
                                <p className="text-sm font-medium">
                                  Seu código de reserva:
                                </p>
                                <p className="text-2xl font-bold text-purple-600 tracking-wider">
                                  ABC123
                                </p>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                Mostre este código para a vendedora na entrega
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                          <p className="text-yellow-800">
                            <strong>⏰ Importante:</strong> Você tem 24 horas
                            para combinar a entrega e usar o código, senão a
                            reserva expira automaticamente!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 4: Contato */}
              <Card className="mb-6 border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      4
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-green-600 mb-3">
                        Combine a Entrega Via WhatsApp
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-2">
                            📱 Contato Automático:
                          </h4>
                          <ul className="space-y-1 text-sm">
                            <li>• Sistema abre WhatsApp automaticamente</li>
                            <li>• Mensagem template já pronta</li>
                            <li>• Ambas recebem dados da transação</li>
                            <li>
                              •{" "}
                              <strong>NÃO envie o código pelo WhatsApp!</strong>
                            </li>
                          </ul>

                          <div className="mt-4 bg-green-50 p-3 rounded text-xs">
                            <p>
                              <strong>Mensagem automática:</strong>
                            </p>
                            <p className="italic">
                              "Olá! Reservei o Vestido Azul Tam 2 Anos por 25
                              Girinhas na GiraMãe. Podemos combinar a entrega?
                              Obs: Tenho o código de reserva."
                            </p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">
                            🤝 Combine Detalhes:
                          </h4>
                          <ul className="space-y-1 text-sm">
                            <li>• Local de encontro</li>
                            <li>• Horário conveniente para ambas</li>
                            <li>• Como se reconhecer</li>
                            <li>• Contato de emergência se necessário</li>
                          </ul>

                          <div className="mt-4 bg-red-50 border border-red-200 p-3 rounded text-xs">
                            <p className="text-red-700">
                              <strong>🚨 Regra de Segurança:</strong>
                            </p>
                            <p className="text-red-600">
                              NUNCA envie o código pelo WhatsApp! Só mostre
                              pessoalmente na hora da entrega.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 5: Entrega e Código */}
              <Card className="mb-6 border-l-4 border-l-teal-500">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-teal-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      5
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-teal-600 mb-3">
                        Encontro e Entrega com Código
                      </h3>

                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-2">
                              👥 No Momento do Encontro:
                            </h4>
                            <ul className="space-y-1 text-sm">
                              <li>• Se apresentem uma para a outra</li>
                              <li>• Compradora mostra o item no app</li>
                              <li>• Vendedora apresenta o item físico</li>
                              <li>• Compradora verifica estado/tamanho</li>
                              <li>• Se tudo OK, prosseguem com o código</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">
                              🔍 Verificação do Item:
                            </h4>
                            <ul className="space-y-1 text-sm">
                              <li>• Item confere com as fotos?</li>
                              <li>• Estado é o mesmo descrito?</li>
                              <li>• Tamanho está correto?</li>
                              <li>• Algum defeito não mencionado?</li>
                              <li>
                                • Se algo estiver errado, NÃO use o código
                              </li>
                            </ul>
                          </div>
                        </div>

                        <div className="bg-teal-50 border border-teal-200 p-6 rounded-lg">
                          <h4 className="font-semibold mb-4 text-center">
                            🔐 Como Funciona a Troca com Código
                          </h4>

                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <h5 className="font-semibold text-purple-600">
                                👆 Compradora (você):
                              </h5>
                              <div className="bg-white p-4 rounded shadow-sm">
                                <p className="text-sm mb-2">
                                  <strong>
                                    1. Abra "Minhas Reservas" no app
                                  </strong>
                                </p>
                                <p className="text-sm mb-2">
                                  <strong>2. Encontre a transação</strong>
                                </p>
                                <p className="text-sm mb-2">
                                  <strong>
                                    3. Mostre o código para a vendedora:
                                  </strong>
                                </p>
                                <div className="bg-gray-100 p-2 rounded text-center">
                                  <p className="text-lg font-bold text-purple-600">
                                    ABC123
                                  </p>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                  ⚠️ Não fale o código, deixe ela ver na tela
                                </p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h5 className="font-semibold text-orange-600">
                                📱 Vendedora:
                              </h5>
                              <div className="bg-white p-4 rounded shadow-sm">
                                <p className="text-sm mb-2">
                                  <strong>
                                    1. Abre "Vendas Pendentes" no app
                                  </strong>
                                </p>
                                <p className="text-sm mb-2">
                                  <strong>
                                    2. Clica em "Confirmar Entrega"
                                  </strong>
                                </p>
                                <p className="text-sm mb-2">
                                  <strong>3. Digita o código mostrado:</strong>
                                </p>
                                <div className="bg-gray-100 p-2 rounded">
                                  <input
                                    type="text"
                                    placeholder="Digite o código"
                                    className="w-full text-center font-bold text-lg"
                                    disabled
                                  />
                                </div>
                                <p className="text-sm mt-2">
                                  <strong>
                                    4. Sistema valida e libera as Girinhas!
                                  </strong>
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 bg-green-100 p-4 rounded-lg">
                            <p className="text-center font-semibold text-green-800">
                              ✅ Quando o código for digitado corretamente, as
                              Girinhas são transferidas automaticamente!
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 6: Pós-entrega */}
              <Card className="mb-6 border-l-4 border-l-pink-500">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      6
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-pink-600 mb-3">
                        Após a Entrega
                      </h3>
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-2">
                              ✅ O que Acontece Automaticamente:
                            </h4>
                            <ul className="space-y-1 text-sm">
                              <li>• Girinhas vão para conta da vendedora</li>
                              <li>
                                • Item vai para seu "Histórico de Compras"
                              </li>
                              <li>• Transação aparece como "Concluída"</li>
                              <li>• Sistema libera para vocês se avaliarem</li>
                              <li>• Notificação de confirmação para ambas</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">
                              ⭐ Avaliação Mútua:
                            </h4>
                            <ul className="space-y-1 text-sm">
                              <li>• Você avalia a vendedora (1-5 estrelas)</li>
                              <li>• Ela avalia você também</li>
                              <li>• Deixem comentários construtivos</li>
                              <li>
                                • <strong>Bônus:</strong> 5 Girinhas para cada
                                avaliação!
                              </li>
                              <li>• Prazo: até 7 dias após a entrega</li>
                            </ul>
                          </div>
                        </div>

                        <div className="bg-pink-50 border border-pink-200 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">
                            📱 Tela de Confirmação Final:
                          </h4>
                          <div className="bg-white p-4 rounded border shadow-sm">
                            <div className="text-center">
                              <div className="text-green-600 text-3xl mb-2">
                                🎉
                              </div>
                              <h5 className="font-bold text-lg text-green-600">
                                Troca Realizada com Sucesso!
                              </h5>
                              <p className="text-gray-600 mb-2">
                                Vestido Azul Tam 2 Anos
                              </p>
                              <p className="text-sm text-gray-500 mb-4">
                                25 Girinhas transferidas para Maria Silva
                              </p>
                              <button className="bg-pink-500 text-white px-4 py-2 rounded text-sm">
                                ⭐ Avaliar Maria Silva
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Segurança do Sistema */}
              <Card className="bg-red-50 border border-red-200">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-red-700 mb-4">
                    🔐 Segurança do Sistema de Códigos
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2 text-red-600">
                        🛡️ Como o Sistema Protege Você:
                      </h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Código único para cada transação</li>
                        <li>• Expira em 24h automaticamente</li>
                        <li>• Só funciona uma vez</li>
                        <li>
                          • Não pode ser adivinhado (6 caracteres aleatórios)
                        </li>
                        <li>
                          • Vendedora só recebe Girinhas COM o código correto
                        </li>
                        <li>• Histórico completo de todas as transações</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-red-600">
                        ⚠️ Regras de Segurança:
                      </h4>
                      <ul className="space-y-1 text-sm">
                        <li>• NUNCA envie o código por mensagem</li>
                        <li>• Só mostre presencialmente</li>
                        <li>• Confira o item ANTES de mostrar o código</li>
                        <li>• Se algo estiver errado, NÃO use o código</li>
                        <li>• Em caso de problema, contate o suporte</li>
                        <li>
                          • Guarde o código até confirmar que está tudo OK
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cenários Especiais */}
              <Card className="bg-gray-50">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-700 mb-4">
                    🚨 Cenários Especiais e Soluções
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2 text-red-600">
                        ❌ Problemas Possíveis:
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li>
                          <strong>Vendedora não aparece:</strong> Código expira
                          em 24h, Girinhas voltam para você
                        </li>
                        <li>
                          <strong>Item não confere:</strong> NÃO mostre o
                          código, reporte no suporte
                        </li>
                        <li>
                          <strong>Código não funciona:</strong> Verifique se
                          digitou certo, se não resolver contate suporte
                        </li>
                        <li>
                          <strong>Vendedora quer Girinhas sem entregar:</strong>{" "}
                          Só mostre código APÓS receber o item
                        </li>
                        <li>
                          <strong>Arrependimento:</strong> Pode cancelar até
                          usar o código
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-blue-600">
                        💡 Dicas Avançadas:
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li>
                          <strong>Vários itens da mesma vendedora:</strong> Cada
                          um tem código próprio
                        </li>
                        <li>
                          <strong>Entrega em local público:</strong> Sempre
                          prefira para segurança
                        </li>
                        <li>
                          <strong>Horário combinado:</strong> Seja pontual,
                          outras pessoas podem estar esperando
                        </li>
                        <li>
                          <strong>Clima ruim:</strong> Remarquem, não vale a
                          pena se molhar
                        </li>
                        <li>
                          <strong>Distância grande:</strong> Considerem dividir
                          custo do transporte
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-blue-800 text-center">
                      <strong>💬 Suporte 24h:</strong> Em caso de qualquer
                      problema, entre em contato{" "}
                      <strong>suporte@giramae.com.br</strong>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* O que são Girinhas */}

          {/* Benefícios */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">
              Por que Escolher a GiraMãe?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <Card
                  key={index}
                  className="text-center hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <p className="text-lg font-medium">{benefit}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA Final */}
          <section className="text-center">
            <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-4">
                  Pronta para Começar?
                </h2>
                <p className="text-lg mb-6 opacity-90">
                  Junte-se à nossa comunidade de mães conscientes e
                  sustentáveis!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/auth"
                    className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors"
                  >
                    Cadastrar Grátis
                  </a>
                  <a
                    href="/faq"
                    className="border border-white/30 px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                  >
                    Tirar Dúvidas
                  </a>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </>
  );
};

export default ComoFunciona;
