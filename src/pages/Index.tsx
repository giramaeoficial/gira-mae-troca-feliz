
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { PackagePlus, HandCoins, Users, CheckCircle, Heart, Star, Sparkles } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-primary flex items-center">
          <Sparkles className="h-6 w-6 mr-2" />
          GiraMãe
        </div>
        <nav className="flex items-center gap-4">
          <a href="#como-funciona" className="text-muted-foreground hover:text-primary transition-colors">Como Funciona</a>
          <a href="#comprar-girinhas" className="text-muted-foreground hover:text-primary transition-colors">Comprar Girinhas</a>
          <Button variant="outline">Entrar</Button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 text-center mt-16 mb-24 animate-fade-in-up">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
          A economia <span className="text-primary">circular e afetiva</span> para mães
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Troque roupas, brinquedos e acessórios infantis de forma fácil, segura e sem usar dinheiro. Participe de uma comunidade de mães que se ajudam!
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button size="lg" className="bg-primary hover:bg-primary/90">Quero participar!</Button>
          <Button size="lg" variant="outline">Saber mais</Button>
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
                <CardTitle className="mt-4">1. Publique um item</CardTitle>
              </CardHeader>
              <CardContent>
                Cadastre o que seu filho não usa mais, defina um valor em Girinhas e adicione fotos.
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg transform hover:scale-105 transition-transform duration-300">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
                  <HandCoins className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="mt-4">2. Reserve com Girinhas</CardTitle>
              </CardHeader>
              <CardContent>
                Encontrou algo que precisa? Use suas Girinhas para reservar o item na hora.
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg transform hover:scale-105 transition-transform duration-300">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="mt-4">3. Combine a troca</CardTitle>
              </CardHeader>
              <CardContent>
                Converse com a outra mãe por chat e combinem a entrega em um local seguro.
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg transform hover:scale-105 transition-transform duration-300">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
                  <CheckCircle className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="mt-4">4. Confirme e avalie</CardTitle>
              </CardHeader>
              <CardContent>
                Após a troca, confirme no app para liberar as Girinhas e aumente sua reputação.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Girinhas Purchase Section */}
      <section id="comprar-girinhas" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Compre Girinhas e comece a trocar!</h2>
          <p className="text-center text-muted-foreground mb-12">Não tem itens para trocar agora? Sem problemas! Compre Girinhas e garanta o que precisa.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {packages.map((pkg, i) => (
              <Card key={i} className={`shadow-lg border-2 ${pkg.popular ? 'border-primary' : 'border-transparent'} transform hover:-translate-y-2 transition-transform duration-300`}>
                {pkg.popular && <div className="bg-primary text-primary-foreground text-center text-sm font-bold py-1 rounded-t-lg">MAIS POPULAR</div>}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <CardDescription className="text-4xl font-bold text-secondary">
                    {pkg.girinhas} <span className="text-lg font-normal text-muted-foreground">Girinhas</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-xl font-semibold">R$ {pkg.price}</p>
                  {pkg.bonus > 0 && <p className="text-green-600 font-semibold mt-2">+{pkg.bonus} Girinhas de bônus!</p>}
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant={pkg.popular ? 'default' : 'outline'}>Comprar Pacote</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="text-2xl font-bold text-primary flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 mr-2" />
            GiraMãe
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

const packages = [
  { name: "Básico", price: "10,00", girinhas: 10, bonus: 0, popular: false },
  { name: "Econômico", price: "25,00", girinhas: 26, bonus: 1, popular: false },
  { name: "Turbinado", price: "50,00", girinhas: 54, bonus: 4, popular: true },
  { name: "Mãe Pro", price: "100,00", girinhas: 112, bonus: 12, popular: false },
];

export default Index;
