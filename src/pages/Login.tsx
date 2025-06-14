
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/shared/Header";
import { Heart, Sparkles } from "lucide-react";

const Login = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <Card className="mx-auto max-w-sm w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Acessar GiraMãe</CardTitle>
            <CardDescription>
              Entre com seus dados para começar a trocar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="mae@exemplo.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                </div>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Entrar
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Não tem uma conta?{" "}
              <Link to="/cadastro" className="underline text-primary">
                Cadastre-se aqui
              </Link>
            </div>
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
        </div>
      </footer>
    </div>
  );
};

export default Login;
