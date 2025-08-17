import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageCircle, MapPin, Clock, Phone, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SEOHead from '@/components/seo/SEOHead';

const Contato = () => {
  const [formData, setFormData] = useState({ nome: '', email: '', assunto: '', mensagem: '' });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Cria o link do WhatsApp com mensagem pré-preenchida
    const numeroWhatsApp = '555198311780'; // substitua pelo número de atendimento com código do país e DDD
    const texto = `Olá! Meu nome é ${formData.nome}. Assunto: ${formData.assunto}. Mensagem: ${formData.mensagem}`;
    const link = `https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodeURIComponent(texto)}`;

    // Abre o WhatsApp em nova aba
    window.open(link, '_blank');

    toast({
      title: 'Mensagem iniciada no WhatsApp! 💕',
      description: 'Você será direcionada para o WhatsApp para finalizar o envio.',
    });

    setFormData({ nome: '', email: '', assunto: '', mensagem: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contato - GiraMãe",
    "description": "Entre em contato com a GiraMãe. Estamos aqui para ajudar você a aproveitar ao máximo nossa plataforma de trocas sustentáveis.",
    "url": "https://giramae.com.br/contato"
  };

  return (
    <>
      <SEOHead
        title="Contato - GiraMãe | Fale Conosco"
        description="Entre em contato com a GiraMãe! Dúvidas sobre trocas, suporte técnico ou sugestões. Estamos aqui para ajudar nossa comunidade de mães em Canoas/RS."
        keywords="contato giramae, suporte giramae, fale conosco, dúvidas trocas infantis, atendimento mães, canoas rs contato"
        structuredData={structuredData}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Fale Conosco
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Estamos Aqui para Você
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tem dúvidas sobre como funciona? Precisa de suporte? Quer dar uma sugestão? 
              Nossa equipe está pronta para ajudar! 💕
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Formulário de Contato */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-6 w-6 text-primary" />
                    Envie sua Mensagem
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="nome" className="text-sm font-medium">
                          Seu Nome *
                        </label>
                        <Input
                          id="nome"
                          name="nome"
                          value={formData.nome}
                          onChange={handleChange}
                          placeholder="Como você gostaria de ser chamada?"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Seu E-mail *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="seu@email.com"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="assunto" className="text-sm font-medium">
                        Assunto *
                      </label>
                      <Input
                        id="assunto"
                        name="assunto"
                        value={formData.assunto}
                        onChange={handleChange}
                        placeholder="Sobre o que você gostaria de falar?"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="mensagem" className="text-sm font-medium">
                        Sua Mensagem *
                      </label>
                      <Textarea
                        id="mensagem"
                        name="mensagem"
                        value={formData.mensagem}
                        onChange={handleChange}
                        placeholder="Conte-nos como podemos ajudar você..."
                        rows={5}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Mensagem
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Informações de Contato */}
            <div className="space-y-6">
              {/* Meios de Contato */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-6 w-6 text-primary" />
                    Nossos Contatos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">E-mail</p>
                      <p className="text-sm text-muted-foreground">atendimento@giramae.com.br</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MessageCircle className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">WhatsApp</p>
                      <p className="text-sm text-muted-foreground">Em breve disponível</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Localização</p>
                      <p className="text-sm text-muted-foreground">Canoas, Rio Grande do Sul</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Horário de Atendimento */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-6 w-6 text-primary" />
                    Horário de Atendimento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Segunda a Sexta</span>
                      <span className="text-sm font-medium">9h às 18h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Sábados</span>
                      <span className="text-sm font-medium">9h às 14h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Domingos</span>
                      <span className="text-sm text-muted-foreground">Fechado</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Respondemos todas as mensagens em até 24 horas!
                  </p>
                </CardContent>
              </Card>

              {/* FAQ Rápido */}
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Dúvidas Frequentes?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Antes de entrar em contato, que tal dar uma olhada nas perguntas mais frequentes?
                  </p>
                  <Button variant="outline" asChild className="w-full">
                    <a href="/faq">Ver FAQ Completo</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Seção adicional - Como podemos ajudar */}
          <section className="mt-20">
            <h2 className="text-3xl font-bold text-center mb-12">
              Como Podemos Ajudar Você?
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card className="text-center hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="text-primary mb-4 flex justify-center">
                    <MessageCircle className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Suporte Técnico</h3>
                  <p className="text-sm text-muted-foreground">
                    Problemas para usar a plataforma? Estamos aqui para ajudar!
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="text-primary mb-4 flex justify-center">
                    <Mail className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Dúvidas sobre Trocas</h3>
                  <p className="text-sm text-muted-foreground">
                    Como funciona? Como trocar? Tire todas as suas dúvidas conosco.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="text-primary mb-4 flex justify-center">
                    <Phone className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Sugestões</h3>
                  <p className="text-sm text-muted-foreground">
                    Sua opinião é muito importante! Conte suas ideias para melhorarmos.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Contato;
