
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PackagePlus, HandCoins, Users, CheckCircle, Heart, Sparkles, Gift } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary flex items-center">
          <Sparkles className="h-6 w-6 mr-2" />
          GiraMãe
        </Link>
        <nav className="flex items-center gap-4">
          <a href="#como-funciona" className="text-muted-foreground hover:text-primary transition-colors">Como Funciona</a>
          <Link to="/comprar-girinhas" className="text-muted-foreground hover:text-primary transition-colors">Comprar Girinhas</Link>
          <Button variant="outline">Entrar</Button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 text-center mt-16 mb-24 animate-fade-in-up">
        <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary mb-4">
          <Gift className="h-4 w-4 mr-2" />
          Cadastre-se e ganhe 50 Girinhas para começar!
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
          A economia <span className="text-primary">circular e afetiva</span> para mães
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto">
          Troque roupas e acessórios infantis sem usar dinheiro. Cada mãe ganha um saldo inicial para começar a girar a economia. Participe de uma comunidade de mães que se ajudam!
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button size="lg" className="bg-primary hover:bg-primary/90">Quero participar!</Button>
          <Button size="lg" variant="outline" onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}>Saber mais</Button>
        </div>
      </main>

      {/* How it Works Section */}
      <section id="como-funciona" className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Como o <span className="text-secondary">GiraMãe</span> funciona?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center shadow-lg transform hover:scale-105 transition-transform duration-300">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
                  <PackagePlus className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="mt-4">1. Publique e ganhe</CardTitle>
              </CardHeader>
              <CardContent>
                Publique o que seu filho não usa mais. Você define um valor em Girinhas (onde 1 Girinha equivale a R$1).
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg transform hover:scale-105 transition-transform duration-300">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
                  <HandCoins className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="mt-4">2. Use suas Girinhas</CardTitle>
              </CardHeader>
              <CardContent>
                Use suas 50 Girinhas iniciais ou as que ganhar para "comprar" itens de outras mães, sem gastar nada.
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg transform hover:scale-105 transition-transform duration-300">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="mt-4">3. Combine a entrega</CardTitle>
              </CardHeader>
              <CardContent>
                Converse com a outra mãe por chat e combinem a entrega em um local seguro ou ponto de encontro.
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg transform hover:scale-105 transition-transform duration-300">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
                  <CheckCircle className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="mt-4">4. Acumule e troque</CardTitle>
              </CardHeader>
              <CardContent>
                As Girinhas que você recebe por suas doações vão para seu saldo, prontas para novas trocas!
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Buy Girinhas Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">E se eu não tiver nada para trocar agora?</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Sem problemas! Se você precisa de um item com urgência e ainda não publicou nada, ou quer mais Girinhas para uma troca maior, você pode comprar pacotes e acelerar suas trocas.
          </p>
          <Button asChild size="lg">
            <Link to="/comprar-girinhas">Ver Pacotes de Girinhas</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="text-2xl font-bold text-primary flex items-center justify-center mb-4">
             <Link to="/" className="flex items-center text-primary">
                <Sparkles className="h-6 w-6 mr-2" />
                GiraMãe
            </Link>
          </div>
          <p>&copy; {new Date().getFullYear()} GiraMãe. Feito com <Heart className="inline h-4 w-4 text-primary" /> por e para mães.</p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="#" className="hover:text-primary">Sobre</a>
            <a href="#" className="hover:text-primary">FAQ</a>
            <a href="#" className="hover:text-primary">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
