const LandingPageSuavizada = () => {
  const [openFaq, setOpenFaq] = useState(null);
  
  // Mock de dados que viriam dos hooks reimport React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Users, 
  Recycle, 
  Shield, 
  ArrowRight, 
  CheckCircle,
  ChevronDown,
  Gift,
  Home,
  MapPin
} from "lucide-react";
// Componentes mockados para demonstração
const Link = ({ to, children, ...props }) => (
  <a href={to} {...props}>{children}</a>
);

const Header = () => (
  <header className="bg-white shadow-sm p-4">
    <div className="max-w-6xl mx-auto flex items-center justify-between">
      <div className="flex items-center">
        <Heart className="h-8 w-8 text-primary mr-2" />
        <span className="text-2xl font-bold text-gray-900">GiraMãe</span>
      </div>
      <nav className="hidden md:flex space-x-6">
        <a href="/feed" className="text-gray-600 hover:text-primary">Explorar</a>
        <a href="/como-funciona" className="text-gray-600 hover:text-primary">Como funciona</a>
        <a href="/auth" className="bg-primary text-white px-4 py-2 rounded-lg">Entrar</a>
      </nav>
    </div>
  </header>
);

const QuickNav = () => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
    <div className="flex justify-around py-2">
      <a href="/feed" className="flex flex-col items-center p-2">
        <Home className="w-6 h-6 text-gray-600" />
        <span className="text-xs text-gray-600">Início</span>
      </a>
      <a href="/auth" className="flex flex-col items-center p-2">
        <Users className="w-6 h-6 text-primary" />
        <span className="text-xs text-primary">Entrar</span>
      </a>
    </div>
  </div>
);

const LandingPageSuavizada = () => {
  const [openFaq, setOpenFaq] = useState(null);
  
  // Mock de dados que viriam dos hooks reais
  const taxaTransacao = '4,5'; // Viria de useConfigSistema()

  // Missões do sistema (valores reais, não fake)
  const missoesSistema = [
    {
      nome: "Missão de Entrada",
      descricao: "Publique 2 itens em bom estado",
      premio: "100 Girinhas",
      tipo: "Obrigatória"
    },
    {
      nome: "Bônus Diário", 
      descricao: "Acesse a plataforma todos os dias",
      premio: "Girinhas variáveis",
      tipo: "Recorrente"
    },
    {
      nome: "Primeira Avaliação",
      descricao: "Avalie sua primeira troca",
      premio: "20 Girinhas",
      tipo: "Uma vez"
    },
    {
      nome: "Embaixadora",
      descricao: "Indique uma amiga que complete a missão de entrada",
      premio: "50 Girinhas",
      tipo: "Recorrente"
    }
  ];

  const problemasComuns = [
    "Comprar roupa nova toda hora e ver seu filho usar 3 vezes",
    "Tentar vender no brechó e receber uma mixaria", 
    "Postar em grupo de WhatsApp e ninguém responder",
    "Guardar 'para o próximo filho' e nunca mais usar"
  ];

  const nossasDiferencas = [
    {
      titulo: "Valor preservado",
      descricao: `Taxa justa de apenas ${taxaTransacao || '4,5'}% - você mantém quase todo o valor em Girinhas`
    },
    {
      titulo: "Comunidade real",
      descricao: "Não somos empresa querendo lucrar em cima de você. Somos mães que criaram uma solução para todas nós"
    },
    {
      titulo: "Segurança de mãe para mãe", 
      descricao: "WhatsApp liberado só após reserva, avaliações transparentes, devolução garantida"
    },
    {
      titulo: "Sem pressão",
      descricao: "Poste quando puder, troque no seu tempo. Sem ficar horas negociando"
    }
  ];

  const faqMaernal = [
    {
      q: "Como sei que posso confiar nas outras mães?",
      a: "Criamos um sistema de avaliações entre mães. Cada uma tem sua reputação visível baseada nas trocas anteriores. Quem não cumpre o combinado perde a reputação naturalmente. Além disso, o WhatsApp só é liberado após a reserva ser confirmada."
    },
    {
      q: "E se eu não gostar da peça que recebi?",
      a: "Você pode devolver em até 7 dias e suas Girinhas são restituídas integralmente. Se a outra mãe não colaborar, a plataforma garante sua restituição. Queremos que você se sinta segura."
    },
    {
      q: "Por que cobram uma taxa?",
      a: `Nossa taxa de ${taxaTransacao || '4,5'}% serve para manter o servidor funcionando, desenvolver melhorias e garantir que tudo funcione bem para todas nós. É muito menor que outros intermediários e somos transparentes sobre isso.`
    },
    {
      q: "As Girinhas podem virar dinheiro de verdade?",
      a: "Não, as Girinhas servem apenas para trocar dentro da nossa comunidade. É assim que mantemos tudo justo e funcionando. Você pode comprar Girinhas se precisar, mas não pode convertê-las em dinheiro."
    },
    {
      q: "Como funciona a entrega?",
      a: "Após reservar um item, vocês combinam diretamente por WhatsApp o local e horário que for melhor para ambas. Muitas mães aproveitam a saída da escola ou encontros no parquinho. Não temos entrega por motoboy."
    },
    {
      q: "Posso cadastrar os dados do meu filho?",
      a: "Sim! Ao cadastrar idade, tamanhos e escola do seu filho, o sistema destaca automaticamente os itens que servem para ele. Também priorizamos entregas entre mães da mesma escola."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
      <Header />
      
      <main className="flex-grow pb-32 md:pb-8">
        
        {/* Hero - Conexão Emocional */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Heart className="h-12 w-12 text-primary mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                GiraMãe
              </h1>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              Onde mães cuidam de mães
            </h2>
            
            <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed max-w-3xl mx-auto">
              Sabe aquele sentimento de ver o armário cheio de roupinhas que não servem mais? 
              A gente entende. Por isso criamos um cantinho onde mães se ajudam de verdade.
            </p>
            
            <p className="text-base md:text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Aqui você troca aquelas peças paradas por outras que seu pequeno precisa agora. 
              Entre amigas, com carinho e segurança. Sem pressa, sem pressão.
            </p>
            
            {/* Origem em Canoas */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-2">
                <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium">Nascido em Canoas, feito com amor gaúcho</span>
              </div>
              <p className="text-blue-700 text-sm">
                A ideia nasceu aqui na nossa cidade e agora estamos começando nossa jornada. 
                Vamos crescer juntas, uma mãe por vez.
              </p>
            </div>
            
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg rounded-full">
              <Link to="/auth">
                Quero conhecer a comunidade
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Problema Compartilhado */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
              A gente sabe como é...
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {problemasComuns.map((problema, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                    {index + 1}
                  </div>
                  <p className="text-gray-700">{problema}</p>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <p className="text-xl text-primary font-medium mb-4">
                Não seria lindo se existisse um jeito mais fácil?
              </p>
            </div>
          </div>
        </section>

        {/* Nossa Solução */}
        <section className="py-16 px-4 bg-gradient-to-br from-pink-50 to-purple-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
              Criamos um espaço especial para nós
            </h2>
            
            <div className="bg-white rounded-lg p-8 shadow-lg mb-8">
              <p className="text-lg text-gray-700 mb-6 text-center">
                No GiraMãe, cada roupinha tem seu valor preservado através das Girinhas - nossa moedinha de troca. 
                É como aquela amiga que sempre tem o tamanho que você precisa, só que para todas nós.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-3 text-center">
                  As Girinhas são como vales-troca entre amigas
                </h3>
                <p className="text-blue-700 text-center">
                  Não é dinheiro, não dá para sacar - é só nossa forma de organizar as trocas com justiça. 
                  Assim ninguém sai perdendo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Nossa Missão */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
              Nossa missão de mãe para mãe
            </h2>
            
            <div className="bg-gradient-to-r from-primary/5 to-pink-50 rounded-lg p-8 mb-8">
              <p className="text-lg text-gray-700 mb-6">
                Somos mães que se cansaram de ver valor sendo desperdiçado. Não só o valor das roupinhas, 
                mas o valor do nosso tempo, do nosso esforço, da nossa comunidade.
              </p>
              
              <div className="bg-white rounded-lg p-6 border-l-4 border-primary mb-6">
                <p className="text-lg font-medium text-gray-800 italic">
                  "Transformar a forma como mães lidam com roupas infantis, criando uma rede de apoio mútuo 
                  onde cada peça mantém seu valor real e cada mãe encontra suporte na sua jornada."
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Heart className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Valorizar seu esforço</h4>
                      <p className="text-gray-600 text-sm">Aquela roupa que você escolheu com carinho não vira lixo nem mixaria</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Fortalecer conexões</h4>
                      <p className="text-gray-600 text-sm">Mães apoiando mães, criando laços reais na comunidade</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Simplificar sua vida</h4>
                      <p className="text-gray-600 text-sm">Mais tempo para o que realmente importa</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Recycle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Cuidar do futuro</h4>
                      <p className="text-gray-600 text-sm">Cada troca é um passo para um mundo mais sustentável</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-lg font-medium text-primary mb-2">Nosso sonho:</p>
              <p className="text-gray-700 mb-6">
                Que nenhuma mãe precise escolher entre economizar e vestir bem seu filho. 
                Que toda peça em bom estado continue sua jornada. Que ser mãe fique um pouquinho mais leve.
              </p>
              <p className="text-base text-gray-600 italic">
                "Porque no final do dia, somos mães cuidando de mães. E é nisso que acreditamos."
              </p>
            </div>
          </div>
        </section>

        {/* Como Funciona */}
        <section className="py-16 px-4 bg-gradient-to-br from-pink-50 to-purple-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
              Simples como deveria ser
            </h2>
            
            <div className="space-y-8">
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
                    <CardTitle className="text-xl">Comece com calma</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Poste 2 pecinhas que não usa mais e ganhe 100 Girinhas de boas-vindas. 
                    Sem pressa, no seu tempo.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
                    <CardTitle className="text-xl">Troque com tranquilidade</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Escolha o que seu filho precisa usando suas Girinhas. Se já estiver reservado, 
                    entre na fila sem bloquear nada.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
                    <CardTitle className="text-xl">Receba com segurança</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Combine a entrega direto com a outra mamãe, do jeitinho que preferir. 
                    Na saída da escola, no parquinho, onde for melhor para vocês.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Por que somos diferentes */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
              Por que somos diferentes
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {nossasDiferencas.map((diferenca, index) => (
                <Card key={index} className="bg-gradient-to-br from-primary/5 to-pink-50 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg text-primary">{diferenca.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{diferenca.descricao}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Sistema de Missões */}
        <section className="py-16 px-4 bg-gradient-to-br from-pink-50 to-purple-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
              Nosso sistema de missões
            </h2>
            
            <p className="text-center text-gray-600 mb-8">
              Recompensamos quem ajuda a nossa comunidade crescer
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              {missoesSistema.map((missao, index) => (
                <Card key={index} className="bg-white shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{missao.nome}</CardTitle>
                      <Badge variant={missao.tipo === 'Obrigatória' ? 'default' : 'secondary'}>
                        {missao.tipo}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">{missao.descricao}</p>
                    <div className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-primary">{missao.premio}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Segurança */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Sua tranquilidade é nossa prioridade
              </h2>
            </div>
            
            <p className="text-lg text-gray-700 text-center mb-8">
              Sabemos que confiar é difícil. Por isso construímos tudo pensando em você:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">WhatsApp só após confirmação (sem spam!)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Avaliações transparentes entre mães</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Devolução garantida se não ficar satisfeita</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Seus dados sempre protegidos</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Entrega combinada entre vocês</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Sistema de reputação confiável</span>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h3 className="font-semibold text-amber-800 mb-2">Honestidade sobre limitações:</h3>
              <p className="text-amber-700">
                As Girinhas são só para trocar dentro da comunidade - não dá para converter em dinheiro. 
                É assim que mantemos tudo justo e funcionando.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-4 bg-gradient-to-br from-pink-50 to-purple-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
              Perguntas que outras mães fizeram
            </h2>
            
            <div className="space-y-4">
              {faqMaernal.map((faq, index) => (
                <Card key={index} className="bg-white shadow-lg">
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
          </div>
        </section>

        {/* Convite Final */}
        <section className="py-16 px-4 bg-primary text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-4xl font-bold mb-6">
              Vem fazer parte
            </h2>
            
            <p className="text-lg md:text-xl mb-6 opacity-90">
              Comece aos pouquinhos. Poste só 2 peças para conhecer. 
              Se não gostar, tudo bem. Se gostar, você encontrou sua comunidade.
            </p>
            
            <p className="text-base md:text-lg mb-8 opacity-80">
              Afinal, criar nossos filhos já é desafio suficiente. 
              Que tal facilitar pelo menos a parte das roupinhas?
            </p>
            
            <Button size="lg" variant="secondary" asChild className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg rounded-full">
              <Link to="/auth">
                Quero experimentar com calma
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <QuickNav />
      
      {/* Footer Simples */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-6 w-6 text-primary mr-2" />
            <span className="text-xl font-bold">GiraMãe</span>
          </div>
          <p className="text-gray-400 mb-4">
            Feito com amor por mães, para mães
          </p>
          <p className="text-gray-400 text-sm">
            © 2024 GiraMãe - Canoas, RS
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageSuavizada;
