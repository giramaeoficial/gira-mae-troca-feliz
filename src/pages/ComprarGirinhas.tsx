
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/shared/Header";

const ComprarGirinhas = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecionar automaticamente para a nova página do sistema
    const timer = setTimeout(() => {
      navigate("/sistema-girinhas");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-24 md:pb-8">
      <Header activePage="comprar-girinhas" />
      
      <main className="flex-grow flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Sparkles className="h-6 w-6 text-yellow-500" />
              Sistema Atualizado!
            </CardTitle>
            <CardDescription>
              Agora temos um sistema completo de Girinhas com metas, conquistas e muito mais!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Você será redirecionado automaticamente em alguns segundos...
            </p>
            <Button asChild className="w-full">
              <Link to="/sistema-girinhas" className="flex items-center gap-2">
                Ir para Sistema de Girinhas
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>

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
