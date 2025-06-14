import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Sparkles, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/shared/Header";

const packages = [
  { name: "Básico", price: "10,00", girinhas: 10, bonus: 0, popular: false },
  { name: "Econômico", price: "25,00", girinhas: 26, bonus: 1, popular: false },
  { name: "Turbinado", price: "50,00", girinhas: 54, bonus: 4, popular: true },
  { name: "Mãe Pro", price: "100,00", girinhas: 112, bonus: 12, popular: false },
];

const ComprarGirinhas = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <Header activePage="comprar-girinhas" />
      
      {/* Girinhas Purchase Section */}
      <main className="flex-grow">
        <section id="comprar-girinhas" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-4">Compre Girinhas e comece a trocar!</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">Precisa de um item específico e não tem itens para trocar no momento? Sem problemas! Compre Girinhas e garanta o que precisa para seu filho.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {packages.map((pkg, i) => (
                <Card key={i} className={`shadow-lg border-2 ${pkg.popular ? 'border-primary' : 'border-transparent'} transform hover:-translate-y-2 transition-transform duration-300 flex flex-col`}>
                  {pkg.popular && <div className="bg-primary text-primary-foreground text-center text-sm font-bold py-1 rounded-t-lg">MAIS POPULAR</div>}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                    <CardDescription className="text-4xl font-bold text-secondary">
                      {pkg.girinhas} <span className="text-lg font-normal text-muted-foreground">Girinhas</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center flex-grow">
                    <p className="text-xl font-semibold">R$ {pkg.price}</p>
                    <p className="text-sm text-muted-foreground">(1 Girinha ≈ R$ 1,00)</p>
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
      </main>

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

export default ComprarGirinhas;
