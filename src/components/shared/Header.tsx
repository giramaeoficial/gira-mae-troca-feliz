
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HeaderProps = {
  activePage?: 'comprar-girinhas' | 'como-funciona';
};

const Header = ({ activePage }: HeaderProps) => {
  return (
    <header className="container mx-auto px-4 py-6 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-primary flex items-center">
        <Sparkles className="h-6 w-6 mr-2" />
        GiraMãe
      </Link>
      <nav className="hidden md:flex items-center gap-4">
        <a href="/#como-funciona" className={cn("text-muted-foreground hover:text-primary transition-colors", { 'text-primary font-semibold': activePage === 'como-funciona' })}>Como Funciona</a>
        <Link to="/comprar-girinhas" className={cn("text-muted-foreground hover:text-primary transition-colors", { 'text-primary font-semibold': activePage === 'comprar-girinhas' })}>Comprar Girinhas</Link>
        <Button asChild variant="outline">
            <Link to="/login">Entrar</Link>
        </Button>
      </nav>
      {/* A mobile menu can be added later */}
    </header>
  );
};

export default Header;
