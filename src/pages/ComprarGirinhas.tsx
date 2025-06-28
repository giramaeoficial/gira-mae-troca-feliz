
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/shared/Header";
import { useMercadoPago } from "@/hooks/useMercadoPago";

const ComprarGirinhas = () => {
  const { verificarStatusPagamento } = useMercadoPago();

  useEffect(() => {
    // Verificar se há parâmetros de retorno do Mercado Pago
    verificarStatusPagamento();
  }, [verificarStatusPagamento]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-24 md:pb-8">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6" />
                Comprar Girinhas
              </CardTitle>
              <CardDescription>
                Adquira Girinhas para trocar na comunidade GiraMãe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Como funciona?</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>✨ 1 Girinha = R$ 1,00</p>
                  <p>🛒 Compre Girinhas para reservar itens</p>
                  <p>💰 Receba Girinhas quando vender seus itens</p>
                  <p>🎁 Ganhe bônus por completar trocas</p>
                </div>
              </div>

              <div className="text-center">
                <Button asChild className="bg-gradient-to-r from-primary to-pink-500">
                  <Link to="/carteira">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Ir para Carteira
                  </Link>
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Gerencie suas Girinhas na sua carteira
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
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
