import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Handshake, BarChart3, Heart, Target, TrendingUp, ArrowRight, Mail, Phone } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import SEOHead from "@/components/seo/SEOHead";

export default function ParceriaAssistenciaSocial() {
  // Dados de impacto estimado para gráfico profissional
  const economiaData = [
    { name: "Gastos Tradicionais", valor: 250, fill: "#ef4444" },
    { name: "Com GiraMãe", valor: 0, fill: "#10b981" },
  ];

  // Dados para o gráfico de pizza - distribuição de benefícios
  const beneficiosData = [
    { name: "Economia Familiar", value: 40, fill: "#3b82f6" },
    { name: "Sustentabilidade", value: 25, fill: "#10b981" },
    { name: "Rede Social", value: 20, fill: "#f59e0b" },
    { name: "Dignidade", value: 15, fill: "#8b5cf6" },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GiraMãe",
    description: "Plataforma de troca de roupas infantis entre mães usando moeda virtual Girinhas. Economia circular sustentável para famílias de Canoas/RS.",
    url: "https://giramae.com.br/institucional",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Canoas",
      addressRegion: "RS",
      addressCountry: "BR"
    },
    foundingDate: "2024",
    contactPoint: {
      "@type": "ContactPoint",
      email: "parcerias@giramae.com.br",
      contactType: "Parcerias Institucionais"
    },
    sameAs: [
      "https://giramae.com.br"
    ]
  };

  return (
    <>
      <SEOHead
        title="Institucional - GiraMãe | Parcerias Públicas e Assistência Social"
        description="Conheça como a GiraMãe pode apoiar programas de assistência social em Canoas/RS. Parceria gratuita que beneficia famílias vulneráveis através da economia circular sustentável."
        keywords="giramae institucional, parceria assistência social, economia circular canoas, sustentabilidade social, apoio famílias vulneráveis, prefeitura canoas, SMAS"
        structuredData={structuredData}
      />
     
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 p-4 rounded-full">
              <Handshake className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-6">
            Secretaria de Assistência Social + GiraMãe
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
            Uma parceria estratégica para fortalecer a proteção social em Canoas, 
            conectando tecnologia social com políticas públicas efetivas.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white/20 px-6 py-3 rounded-full">
              <span className="font-semibold">100% Gratuito</span>
            </div>
            <div className="bg-white/20 px-6 py-3 rounded-full">
              <span className="font-semibold">Impacto Imediato</span>
            </div>
            <div className="bg-white/20 px-6 py-3 rounded-full">
              <span className="font-semibold">Solução Local</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-8 space-y-16 py-12">
        {/* Indicadores Sociais */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">
              O Cenário Atual de Canoas
            </h2>
            <p className="text-lg text-blue-700 max-w-2xl mx-auto">
              Dados que mostram a importância de soluções inovadoras na assistência social
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-lg rounded-2xl border-l-4 border-blue-500">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-blue-900">347 mil</h3>
                <p className="text-sm text-gray-600">habitantes total</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg rounded-2xl border-l-4 border-orange-500">
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-orange-900">116.859</h3>
                <p className="text-sm text-gray-600">pessoas vulneráveis</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg rounded-2xl border-l-4 border-green-500">
              <CardContent className="p-6 text-center">
                <Heart className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-green-900">5 CRAS</h3>
                <p className="text-sm text-gray-600">+ 2 CREAS ativos</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg rounded-2xl border-l-4 border-purple-500">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-purple-900">33%</h3>
                <p className="text-sm text-gray-600">população no CadÚnico</p>
              </CardContent>
            </Card>
          </div>

          {/* Destaque estatística principal */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 rounded-2xl text-center">
            <h3 className="text-3xl font-bold mb-2">52.316 famílias</h3>
            <p className="text-xl">inscritas no CadÚnico precisam de apoio contínuo</p>
            <p className="text-blue-200 mt-2">20.075 dessas famílias recebem Bolsa Família</p>
          </div>
        </section>

        {/* Como o GiraMãe Complementa */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">
              Como o GiraMãe Fortalece o Trabalho da Secretaria
            </h2>
            <p className="text-lg text-blue-700 max-w-3xl mx-auto">
              Uma ferramenta adicional que potencializa o impacto das políticas já existentes
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-lg rounded-2xl h-full">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-2xl">
                <CardTitle className="flex items-center gap-3">
                  <Heart className="h-6 w-6" />
                  Benefícios Diretos para as Famílias
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-gray-700">
                      <strong>Economia real:</strong> Até R$ 1.800/ano por família em roupas infantis
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-gray-700">
                      <strong>Acesso imediato:</strong> Itens disponíveis 24h sem dependência de horários de atendimento
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-gray-700">
                      <strong>Dignidade preservada:</strong> Sistema de troca, não doação
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-gray-700">
                      <strong>Rede de apoio:</strong> Conexão entre mães da mesma região/escola
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-2xl h-full">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-2xl">
                <CardTitle className="flex items-center gap-3">
                  <Target className="h-6 w-6" />
                  Vantagens para a Secretaria
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <p className="text-gray-700">
                      <strong>Redução de demanda:</strong> Menos solicitações de benefícios eventuais
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <p className="text-gray-700">
                      <strong>Dados em tempo real:</strong> Dashboard com necessidades e ofertas locais
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <p className="text-gray-700">
                      <strong>Otimização de recursos:</strong> Verbas liberadas para outras prioridades
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <p className="text-gray-700">
                      <strong>Inovação reconhecida:</strong> Canoas como referência em tecnologia social
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Visualização de Dados */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">
              Impacto Financeiro Projetado
            </h2>
            <p className="text-lg text-blue-700">
              Economia real para as famílias cadastradas na assistência social
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Gráfico de Barras - Economia */}
            <Card className="shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-center">Economia Mensal por Família</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={economiaData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis 
                      label={{ value: 'R$', angle: -90, position: 'insideLeft' }}
                      fontSize={12}
                    />
                    <Tooltip formatter={(value) => [`R$ ${value}`, 'Valor']} />
                    <Bar dataKey="valor" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-sm text-center text-gray-600 mt-4">
                  Redução de <span className="font-bold text-green-600">100%</span> nos gastos com roupas infantis
                </p>
              </CardContent>
            </Card>

            {/* Gráfico de Pizza - Benefícios */}
            <Card className="shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-center">Distribuição dos Benefícios</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={beneficiosData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                      fontSize={10}
                    >
                      {beneficiosData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Projeção de Impacto */}
          <Card className="mt-8 shadow-lg rounded-2xl bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-blue-900 mb-4">
                Projeção de Impacto Anual
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-3xl font-bold text-green-600">R$ 36 milhões</p>
                  <p className="text-sm text-gray-600">economia total estimada para 20.075 famílias</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600">-30%</p>
                  <p className="text-sm text-gray-600">redução em benefícios eventuais solicitados</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-purple-600">5.000+</p>
                  <p className="text-sm text-gray-600">famílias beneficiadas no primeiro ano</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Passos para Implementação */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">
              Como Implementar a Parceria
            </h2>
            <p className="text-lg text-blue-700">
              Processo simples e sem custos para a prefeitura
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-lg rounded-2xl text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Assinatura do Termo</h3>
                <p className="text-gray-600">
                  Formalização da parceria através de termo de cooperação técnica
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-2xl text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Capacitação da Equipe</h3>
                <p className="text-gray-600">
                  Treinamento dos profissionais dos CRAS para orientar as famílias
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-2xl text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Lançamento</h3>
                <p className="text-gray-600">
                  Divulgação conjunta e início do atendimento às famílias cadastradas
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-8 rounded-2xl text-center">
          <Handshake className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">
            Vamos Construir Essa Parceria Juntos?
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Uma oportunidade única de inovar na assistência social, 
            fortalecendo a proteção às famílias de Canoas sem custos adicionais.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center gap-6 items-center">
            <div className="flex items-center gap-3 bg-white/20 px-6 py-3 rounded-full">
              <Mail className="h-5 w-5" />
              <a href="mailto:parcerias@giramae.com.br" className="hover:underline">
                parcerias@giramae.com.br
              </a>
            </div>
            
            <div className="flex items-center gap-3 bg-white/20 px-6 py-3 rounded-full">
              <Phone className="h-5 w-5" />
              <span>(51) 99999-9999</span>
            </div>
          </div>
          
          <Button 
            size="lg" 
            className="mt-6 bg-white text-blue-600 hover:bg-blue-50 rounded-full px-8 py-3 text-lg font-semibold shadow-lg"
          >
            Agendar Reunião
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </section>
      </div>
    </div>
    </>
  );
}
