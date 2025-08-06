import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, MessageCircle, Shield, CreditCard, Recycle, Users } from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';

const FAQ = () => {
  const faqCategories = [
    {
      title: "Como Funciona",
      icon: <HelpCircle className="h-5 w-5" />,
      questions: [
        {
          question: "Como funciona a GiraMãe?",
          answer: "A GiraMãe é uma plataforma onde mães trocam roupas, brinquedos e calçados infantis usando nossa moeda virtual chamada Girinhas. Você publica itens que não usa mais, define um preço em Girinhas, e usa essas Girinhas para 'comprar' outros itens da comunidade."
        },
        {
          question: "O que são Girinhas?",
          answer: "Girinhas são nossa moeda virtual interna. 1 Girinha equivale a R$ 1,00 em valor de referência. Você pode ganhar Girinhas vendendo seus itens ou comprá-las diretamente na plataforma."
        },
        {
          question: "Como faço minha primeira troca?",
          answer: "1) Cadastre-se gratuitamente; 2) Publique alguns itens para ganhar suas primeiras Girinhas; 3) Navegue pelos itens disponíveis; 4) Reserve o item que deseja; 5) Combine a entrega com a vendedora; 6) Confirme o recebimento. Pronto!"
        },
        {
          question: "Preciso pagar alguma taxa?",
          answer: "Sim, cobramos uma pequena taxa de 5% sobre o valor do item no momento da troca. Esta taxa ajuda a manter a plataforma funcionando e segura para todas as mães."
        }
      ]
    },
    {
      title: "Segurança",
      icon: <Shield className="h-5 w-5" />,
      questions: [
        {
          question: "A plataforma é segura?",
          answer: "Sim! Usamos sistema de códigos de confirmação para garantir que as trocas aconteçam corretamente. Além disso, as Girinhas ficam bloqueadas durante a reserva, garantindo segurança para vendedora e compradora."
        },
        {
          question: "E se eu não receber o item?",
          answer: "Se houver algum problema na entrega, você pode cancelar a reserva e suas Girinhas serão devolvidas automaticamente. Nossa equipe também está disponível para mediar qualquer questão."
        },
        {
          question: "Como funciona o código de confirmação?",
          answer: "Quando você reserva um item, geramos um código único. Após receber o item, você compartilha este código com a vendedora, que confirma a entrega na plataforma. Só então as Girinhas são transferidas."
        },
        {
          question: "Posso confiar nas outras mães?",
          answer: "Sim! Nossa comunidade é baseada na confiança mútua entre mães. Temos sistema de avaliações e nossa equipe monitora a plataforma para garantir um ambiente seguro e respeitoso."
        }
      ]
    },
    {
      title: "Girinhas e Pagamentos",
      icon: <CreditCard className="h-5 w-5" />,
      questions: [
        {
          question: "Como comprar Girinhas?",
          answer: "Você pode comprar Girinhas diretamente na plataforma usando cartão de crédito, débito ou PIX através do Mercado Pago. O processo é rápido e seguro."
        },
        {
          question: "As Girinhas vencem?",
          answer: "Sim, as Girinhas têm validade de 12 meses a partir da data de aquisição. Você pode renovar a validade pagando uma pequena taxa antes do vencimento."
        },
        {
          question: "Posso transferir Girinhas para outra mãe?",
          answer: "Sim! Temos a função de transferência P2P onde você pode enviar Girinhas diretamente para outra usuária. É cobrada uma pequena taxa de 1% na transferência."
        },
        {
          question: "Qual o valor mínimo e máximo para comprar Girinhas?",
          answer: "O valor mínimo é de 10 Girinhas (R$ 10,00) e o máximo é de 999.000 Girinhas por compra. Você pode fazer quantas compras quiser."
        }
      ]
    },
    {
      title: "Itens e Trocas",
      icon: <Recycle className="h-5 w-5" />,
      questions: [
        {
          question: "Que tipos de itens posso trocar?",
          answer: "Você pode trocar roupas, calçados, brinquedos e acessórios infantis. Os itens devem estar em bom estado de conservação e adequados para crianças."
        },
        {
          question: "Como defino o preço do meu item?",
          answer: "Você pode definir livremente o preço em Girinhas baseado no estado de conservação, marca e valor original do item. Nossa comunidade é bem consciente sobre preços justos."
        },
        {
          question: "Posso cancelar uma venda?",
          answer: "Sim, você pode cancelar uma reserva até o momento da confirmação de entrega. As Girinhas serão devolvidas automaticamente para a compradora."
        },
        {
          question: "E se o item tiver defeito que não foi informado?",
          answer: "Nossa comunidade preza pela transparência. Se houver algum problema não informado, entre em contato conosco que mediamos a situação e, se necessário, estornamos a transação."
        }
      ]
    },
    {
      title: "Comunidade",
      icon: <Users className="h-5 w-5" />,
      questions: [
        {
          question: "Posso indicar outras mães?",
          answer: "Sim! Temos um sistema de indicações onde tanto você quanto a mãe indicada ganham bônus em Girinhas. É uma forma de fazer nossa comunidade crescer!"
        },
        {
          question: "Tem limite de quantos itens posso publicar?",
          answer: "Não há limite! Você pode publicar quantos itens quiser. Quanto mais ativa você for, mais Girinhas ganha e mais opções tem para trocar."
        },
        {
          question: "Posso seguir outras mães?",
          answer: "Sim! Você pode seguir outras mães para ver quando elas publicam itens novos. É uma ótima forma de não perder nenhuma oportunidade de troca."
        },
        {
          question: "Onde posso trocar experiências com outras mães?",
          answer: "Nossa comunidade é muito ativa! Você pode interagir através dos comentários nos itens e em breve teremos grupos de discussão."
        }
      ]
    },
    {
      title: "Suporte Técnico",
      icon: <MessageCircle className="h-5 w-5" />,
      questions: [
        {
          question: "Esqueci minha senha, como faço?",
          answer: "Na tela de login, clique em 'Esqueci minha senha' e siga as instruções que enviaremos para seu e-mail."
        },
        {
          question: "Não consigo fazer upload das fotos do item",
          answer: "Verifique se as fotos não são muito grandes (máximo 5MB cada). Se o problema persistir, tente usar outro navegador ou entre em contato conosco."
        },
        {
          question: "O app funciona no celular?",
          answer: "Sim! Nossa plataforma é totalmente responsiva e funciona perfeitamente no navegador do celular. Em breve teremos um app nativo."
        },
        {
          question: "Como atualizar meus dados pessoais?",
          answer: "Vá em 'Perfil' > 'Editar Perfil' e atualize suas informações. Lembre-se de salvar as alterações."
        }
      ]
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqCategories.flatMap(category => 
      category.questions.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    )
  };

  return (
    <>
      <SEOHead
        title="FAQ - Perguntas Frequentes | GiraMãe"
        description="Tire suas dúvidas sobre a GiraMãe! Perguntas frequentes sobre trocas, Girinhas, segurança, pagamentos e como usar nossa plataforma de trocas sustentáveis."
        keywords="faq giramae, dúvidas girinhas, como funciona trocas, perguntas frequentes sustentabilidade, suporte giramae, ajuda trocas infantis"
        structuredData={structuredData}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Perguntas Frequentes
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Tire Todas as suas Dúvidas
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Aqui estão as respostas para as perguntas mais comuns sobre nossa plataforma. 
              Não encontrou o que procura? <a href="/contato" className="text-primary hover:underline">Entre em contato conosco!</a>
            </p>
          </div>

          {/* FAQ Categories */}
          <div className="max-w-4xl mx-auto">
            {faqCategories.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="text-primary">
                      {category.icon}
                    </div>
                    <h2 className="text-2xl font-bold">{category.title}</h2>
                  </div>
                  
                  <Accordion type="single" collapsible className="space-y-2">
                    {category.questions.map((faq, faqIndex) => (
                      <AccordionItem 
                        key={faqIndex} 
                        value={`${categoryIndex}-${faqIndex}`}
                        className="border border-border/50 rounded-lg px-4"
                      >
                        <AccordionTrigger className="text-left hover:no-underline">
                          <span className="font-medium">{faq.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <section className="mt-20">
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">
                  Ainda tem dúvidas?
                </h2>
                <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Nossa equipe está sempre pronta para ajudar! Entre em contato conosco e 
                  responderemos sua dúvida o mais rápido possível.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="/contato" 
                    className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Falar Conosco
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

export default FAQ;