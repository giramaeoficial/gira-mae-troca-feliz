import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Leaf, Target, Award, MapPin } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";

const Sobre = () => {
  const values = [
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Comunidade",
      description:
        "Acreditamos no poder das mães se ajudarem mutuamente, criando uma rede de apoio forte e solidária.",
    },
    {
      icon: <Leaf className="h-6 w-6" />,
      title: "Sustentabilidade",
      description:
        "Promovemos a economia circular, dando nova vida às roupas infantis e cuidando do planeta.",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Inclusão",
      description:
        "Nossa plataforma é acessível a todas as mães, independente da condição socioeconômica.",
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Praticidade",
      description:
        "Facilitamos a vida das mães com uma plataforma simples, segura e intuitiva.",
    },
  ];

  const stats = [
    {
      number: "R$2.400",
      label: "Gasto médio anual com roupas infantis",
      icon: "💰",
    },
    { number: "6 meses", label: "Tempo médio de uso de cada peça", icon: "⏰" },
    {
      number: "40%",
      label: "Das roupas infantis são pouco usadas",
      icon: "👕",
    },
    { number: "Zero", label: "Custo para participar da solução", icon: "🆓" },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://giramae.com.br/#organization",
        name: "GiraMãe",
        alternateName: "Gira Mae",
        description: "Plataforma de trocas sustentáveis entre mães, promovendo economia circular com roupas, brinquedos e calçados infantis usando moeda virtual Girinhas.",
        url: "https://giramae.com.br",
        logo: {
          "@type": "ImageObject",
          url: "https://giramae.com.br/logo.png",
          width: 512,
          height: 512
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: "Canoas",
          addressRegion: "RS",
          addressCountry: "BR",
          postalCode: "92000-000"
        },
        areaServed: [
          {
            "@type": "Place",
            name: "Canoas, Rio Grande do Sul, Brasil",
            geo: {
              "@type": "GeoCoordinates",
              latitude: -29.9177,
              longitude: -51.1794
            }
          },
          {
            "@type": "Place", 
            name: "Região Metropolitana de Porto Alegre"
          }
        ],
        foundingDate: "2024",
        founders: [{
          "@type": "Person",
          name: "Equipe GiraMãe"
        }],
        industry: "Economia Circular",
        keywords: ["troca roupas infantis", "sustentabilidade", "economia circular", "mães", "brechó online", "moeda virtual"],
        slogan: "Conectando Mães, Cuidando do Futuro",
        mission: "Criar uma plataforma 100% gratuita onde mães de Canoas possam trocar roupas, brinquedos e calçados infantis, gerando economia familiar e reduzindo desperdício.",
        serviceType: "Plataforma de Trocas Sustentáveis",
        target: "Mães de crianças pequenas",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "contato@giramae.com.br",
          availableLanguage: "Portuguese"
        },
        sameAs: []
      },
      {
        "@type": "WebPage",
        "@id": "https://giramae.com.br/sobre",
        name: "Sobre a GiraMãe - Nossa História e Missão",
        description: "Conheça a GiraMãe! Somos uma plataforma que conecta mães para trocas sustentáveis de roupas infantis. Nossa missão é promover economia circular e fortalecer a comunidade materna.",
        isPartOf: {
          "@id": "https://giramae.com.br/#website"
        },
        about: {
          "@id": "https://giramae.com.br/#organization"
        },
        mainEntity: {
          "@id": "https://giramae.com.br/#organization"
        }
      }
    ]
  };

  return (
    <>
      <SEOHead
        title="Sobre a GiraMãe - Nossa História e Missão"
        description="Conheça a GiraMãe! Somos uma plataforma que conecta mães para trocas sustentáveis de roupas infantis. Nossa missão é promover economia circular e fortalecer a comunidade materna."
        keywords="sobre giramae, história giramae, missão sustentabilidade, economia circular mães, comunidade materna canoas, valores giramae"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Sobre Nós
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Conectando Mães, Cuidando do Futuro
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A GiraMãe nasceu do sonho de criar uma comunidade onde mães se
              ajudam mutuamente, promovendo sustentabilidade e economia no
              universo infantil.
            </p>
          </div>

          {/* Nossa História */}
          <section className="mb-20">
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-3xl font-bold mb-6">Nossa História</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        A GiraMãe nasceu da observação de que roupas infantis
                        são usadas por pouco tempo - uma criança cresce em média
                        6 tamanhos nos primeiros 2 anos. Enquanto isso, milhares
                        de peças em perfeito estado ficam guardadas em armários
                        ou são descartadas.
                      </p>
                      <p>
                        Em 2024, decidimos criar uma plataforma que não apenas
                        resolvesse esse problema, mas que também fortalecesse os
                        laços entre mães da nossa comunidade. Assim nasceu a
                        GiraMãe, com nossa moeda virtual{" "}
                        <strong>Girinhas</strong>.
                      </p>
                      <p>
                        Começamos em Canoas/RS e nosso objetivo é expandir para
                        toda a região metropolitana, sempre mantendo o foco na
                        comunidade local e nas relações de confiança.
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-primary/10 rounded-full w-64 h-64 mx-auto flex items-center justify-center text-8xl">
                      👶💕
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Missão, Visão e Valores */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">
              Nossa Missão e Valores
            </h2>

            {/* Missão */}
            <Card className="mb-8">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4 text-primary">
                  Nossa Missão
                </h3>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  Criar uma plataforma 100% gratuita onde mães de Canoas possam
                  trocar roupas, brinquedos e calçados infantis, gerando
                  economia familiar e reduzindo desperdício.
                </p>
              </CardContent>
            </Card>

            {/* Valores */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card
                  key={index}
                  className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <CardContent className="p-6">
                    <div className="text-primary mb-4 flex justify-center">
                      {value.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-3">
                      {value.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Estatísticas */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">
              Nosso Impacto na Comunidade
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card
                  key={index}
                  className="text-center bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20"
                >
                  <CardContent className="p-6">
                    <div className="text-4xl mb-2">{stat.icon}</div>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {stat.number}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Nossa Localização */}
          <section className="mb-20">
            <Card>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                      <MapPin className="h-8 w-8 text-primary" />
                      Nossa Base
                    </h2>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        Estamos orgulhosamente baseadas em{" "}
                        <strong>Canoas, Rio Grande do Sul</strong>. Nossa cidade
                        é conhecida pelo espírito acolhedor e pela força da
                        comunidade feminina.
                      </p>
                      <p className="text-muted-foreground">
                        Escolhemos começar localmente porque acreditamos que as
                        melhores trocas acontecem quando existe proximidade e
                        confiança entre as pessoas.
                      </p>
                      <div className="flex items-center gap-2 text-primary">
                        <MapPin className="h-5 w-5" />
                        <span className="font-medium">
                          Canoas - Rio Grande do Sul
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-primary/10 rounded-lg p-8">
                      <h3 className="text-xl font-bold mb-4">
                        Expansão em Breve!
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Estamos planejando expandir para toda a região
                        metropolitana
                      </p>
                      <div className="space-y-2 text-sm">
                        <div>🎯 Porto Alegre</div>
                        <div>🎯 Esteio</div>
                        <div>🎯 Sapucaia do Sul</div>
                        <div>🎯 Nova Santa Rita</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Por que GiraMãe? */}
          <section className="mb-20">
            <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
              <CardContent className="p-8 text-center">
                <h2 className="text-3xl font-bold mb-6">
                  Por que Escolher a GiraMãe?
                </h2>
                <div className="grid md:grid-cols-3 gap-8 mt-8">
                  <div>
                    <div className="text-4xl mb-4">🌱</div>
                    <h3 className="text-xl font-bold mb-2">Sustentável</h3>
                    <p className="opacity-90">
                      Cada troca é um passo em direção a um futuro mais verde
                      para nossos filhos
                    </p>
                  </div>
                  <div>
                    <div className="text-4xl mb-4">💰</div>
                    <h3 className="text-xl font-bold mb-2">Econômica</h3>
                    <p className="opacity-90">
                      Economize dinheiro enquanto oferece variedade no
                      guarda-roupa dos pequenos
                    </p>
                  </div>
                  <div>
                    <div className="text-4xl mb-4">👥</div>
                    <h3 className="text-xl font-bold mb-2">Comunitária</h3>
                    <p className="opacity-90">
                      Faça parte de uma rede de mães que se apoiam mutuamente
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* CTA Final */}
          <section className="text-center">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-4">
                  Quer Fazer Parte da Nossa História?
                </h2>
                <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Junte-se a centenas de mães que já descobriram uma forma mais
                  sustentável e econômica de cuidar do guarda-roupa dos filhos.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/auth"
                    className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Começar Agora
                  </a>
                  <a
                    href="/como-funciona"
                    className="border border-primary text-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary/5 transition-colors"
                  >
                    Como Funciona
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

export default Sobre;
