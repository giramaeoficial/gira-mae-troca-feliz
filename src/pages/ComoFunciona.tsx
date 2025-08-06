import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, Recycle, Shield, ChevronRight } from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';

const ComoFunciona = () => {
  const steps = [
    {
      number: "01",
      title: "Cadastre-se Grátis",
      description: "Crie sua conta em segundos e faça parte da nossa comunidade de mães conscientes.",
      icon: <Users className="h-6 w-6" />
    },
    {
      number: "02", 
      title: "Publique seus Itens",
      description: "Fotografe roupas, brinquedos e calçados que não servem mais e defina o valor em Girinhas.",
      icon: <Heart className="h-6 w-6" />
    },
    {
      number: "03",
      title: "Encontre o que Precisa",
      description: "Navegue pelos itens disponíveis e reserve com suas Girinhas acumuladas.",
      icon: <Recycle className="h-6 w-6" />
    },
    {
      number: "04",
      title: "Troque com Segurança",
      description: "Confirme a entrega e finalize a troca. Simples, seguro e sustentável!",
      icon: <Shield className="h-6 w-6" />
    }
  ];

  const benefits = [
    "💰 Economia para a família",
    "🌱 Sustentabilidade ambiental", 
    "👥 Comunidade local forte",
    "🔄 Economia circular"
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Como Funciona a GiraMãe - Plataforma de Trocas entre Mães",
    "description": "Aprenda como usar a GiraMãe para trocar roupas, brinquedos e calçados infantis de forma sustentável usando nossa moeda virtual Girinhas.",
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.title,
      "text": step.description
    }))
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
              Na GiraMãe, você troca roupas, brinquedos e calçados infantis usando nossa moeda virtual <strong>Girinhas</strong>. 
              É sustentável, econômico e fortalece nossa comunidade!
            </p>
          </div>

          {/* Como Funciona - Steps */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">
              4 Passos Simples para Começar
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <Card key={index} className="relative group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
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
          </section>

          {/* O que são Girinhas */}
          <section className="mb-20">
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-3xl font-bold mb-4">
                      O que são as Girinhas? 🪙
                    </h2>
                    <p className="text-lg mb-6 text-muted-foreground">
                      Girinhas são nossa moeda virtual interna. <strong>1 Girinha = R$ 1,00</strong> em valor de referência. 
                      Você ganha Girinhas vendendo itens e usa para "comprar" outros itens da comunidade.
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

          {/* Benefícios */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">
              Por que Escolher a GiraMãe?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center hover:shadow-md transition-shadow">
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
                  Junte-se à nossa comunidade de mães conscientes e sustentáveis!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="/auth" 
                    className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors"
                  >
                    Cadastrar Grátis
                  </a>
                  <a 
                    href="/contato" 
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