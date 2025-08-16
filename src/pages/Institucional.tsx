// pages/institucional.tsx
import React from "react";
import SEOHead from "@/components/seo/SEOHead";
import { Card, CardContent } from "@/components/ui/card";

const Institucional: React.FC = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "GiraMãe Institucional",
    description:
      "Conheça o problema, a solução e os impactos sociais da plataforma GiraMãe",
    url: "https://giramae.com.br/parcerias-publicas",
  };

  return (
    <>
      <SEOHead
        title="Institucional - GiraMãe"
        description="Página institucional da GiraMãe: problemas, soluções e impacto social."
        structuredData={structuredData}
      />

      <div className="bg-white">
        {/* Seção 1: O Problema */}
        <section className="py-16 bg-gradient-to-br from-pink-100 to-purple-100 ">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl text-center md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              O Problema que Conhecemos
            </h2>
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <h3 className="text-2xl font-bold mb-6 text-red-600">
                  Realidade das Famílias
                </h3>
                <ul className="space-y-4 text-lg">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-3">•</span>Roupas infantis
                    custam em média R$ 2.400/ano por criança
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-3">•</span>Criança cresce 6
                    tamanhos nos primeiros 2 anos
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-3">•</span>40% das roupas
                    são usadas menos de 10 vezes
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-3">•</span>Mães descartam
                    ou guardam roupas em bom estado
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-6 text-blue-600">
                  Impacto Social
                </h3>
                <ul className="space-y-4 text-lg">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3">•</span>Famílias
                    vulneráveis priorizam alimentação sobre vestuário
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3">•</span>Crianças podem
                    ir à escola com roupas inadequadas
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3">•</span>Descarte gera
                    impacto ambiental desnecessário
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3">•</span>Mães se sentem
                    isoladas em suas dificuldades
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Seção 2: Solução */}
        <section className="py-16 ">
          <div className="container mx-auto px-4 ">
            <h2 className="text-4xl font-bold text-center mb-12">
              A Solução GiraMãe
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">🆓</div>
                  <h3 className="text-xl font-bold mb-3">100% Gratuito</h3>
                  <p>
                    Mães usam sem pagar nada. Ganham créditos virtuais
                    (Girinhas) através de atividades simples
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">🏠</div>
                  <h3 className="text-xl font-bold mb-3">Local</h3>
                  <p>
                    Criado em Canoas, foca na comunidade local, priorizando
                    entregas na mesma região/escola
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">🔒</div>
                  <h3 className="text-xl font-bold mb-3">Seguro</h3>
                  <p>
                    Sistema de reputação, verificação por WhatsApp e moderação
                    ativa da comunidade
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">📱</div>
                  <h3 className="text-xl font-bold mb-3">Simples</h3>
                  <p>
                    Interface intuitiva, funciona no celular, não requer
                    conhecimento técnico avançado
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Seção 3: Potencial de Parceria */}
        <section className="py-16 bg-blue-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12">
              Potencial de Apoio aos Programas Existentes
            </h2>
            <div className="grid md:grid-cols-2 gap-12">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4 text-blue-600">
                    🏫 Educação
                  </h3>
                  <h4 className="text-lg font-semibold mb-3">
                    Possibilidades:
                  </h4>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>
                      Escolas poderiam divulgar a plataforma para famílias
                    </li>
                    <li>Facilitar trocas entre mães da mesma escola</li>
                    <li>Reduzir impacto financeiro no material escolar</li>
                    <li>Promover educação ambiental na prática</li>
                  </ul>
                  <div className="mt-4 p-4 bg-green-100 rounded">
                    <strong>Sem custo:</strong> Apenas divulgação institucional
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4 text-green-600">
                    🤝 Assistência Social
                  </h3>
                  <h4 className="text-lg font-semibold mb-3">
                    Possibilidades:
                  </h4>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Indicar plataforma para famílias atendidas</li>
                    <li>Complementar programas de transferência</li>
                    <li>Promover autonomia e dignidade</li>
                    <li>Criar rede de apoio entre beneficiárias</li>
                  </ul>
                  <div className="mt-4 p-4 bg-green-100 rounded">
                    <strong>Sem custo:</strong> Orientação nos atendimentos
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Seção 4: Por que Apoiar */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12">
              Por que Apoiar a GiraMãe?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6 text-center bg-green-100">
                  <div className="text-4xl mb-4">🌟</div>
                  <h3 className="text-xl font-bold mb-3">Solução Pronta</h3>
                  <p>
                    Plataforma já desenvolvida e testada, pronta para uso
                    imediato
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center bg-green-100">
                  <div className="text-4xl mb-4">💰</div>
                  <h3 className="text-xl font-bold mb-3">Custo Zero</h3>
                  <p>
                    Não requer investimento público, apenas apoio institucional
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center bg-green-100">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-xl font-bold mb-3">Transparência</h3>
                  <p>
                    Relatórios de impacto e transparência total sobre resultados
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Seção 5: Call to Action */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-green-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">Vamos Conversar?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Apoie uma iniciativa local que beneficia centenas de famílias de
              Canoas, sem custo para o município.
            </p>
            <div className="space-y-4 text-lg">
              <p>
                📧{" "}
                <a href="mailto:parcerias@giramae.com.br" className="underline">
                  parcerias@giramae.com.br
                </a>
              </p>
              {/* <p>📱 (51) 99999-9999</p> */}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Institucional;
