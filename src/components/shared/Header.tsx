
import { Link, useLocation } from "react-router-dom";
import { Sparkles, Menu, User, Wallet, ShoppingBag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type HeaderProps = {
  activePage?: 'comprar-girinhas' | 'como-funciona';
};

const Header = ({ activePage }: HeaderProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="container mx-auto px-4 py-6 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-primary flex items-center">
        <Sparkles className="h-6 w-6 mr-2" />
        GiraMãe
      </Link>
      
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center gap-6">
        <Link 
          to="/feed" 
          className={cn("text-muted-foreground hover:text-primary transition-colors flex items-center gap-2", { 'text-primary font-semibold': isActive('/feed') })}
        >
          <ShoppingBag className="w-4 h-4" />
          Explorar
        </Link>
        <Link 
          to="/publicar-item" 
          className={cn("text-muted-foreground hover:text-primary transition-colors flex items-center gap-2", { 'text-primary font-semibold': isActive('/publicar-item') })}
        >
          <Plus className="w-4 h-4" />
          Publicar
        </Link>
        <Link 
          to="/carteira" 
          className={cn("text-muted-foreground hover:text-primary transition-colors flex items-center gap-2", { 'text-primary font-semibold': isActive('/carteira') })}
        >
          <Wallet className="w-4 h-4" />
          Carteira
        </Link>
        <a href="/#como-funciona" className={cn("text-muted-foreground hover:text-primary transition-colors", { 'text-primary font-semibold': activePage === 'como-funciona' })}>Como Funciona</a>
      </nav>

      {/* Desktop User Menu */}
      <div className="hidden lg:flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Ana Maria
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link to="/perfil" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Meu Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/carteira" className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Carteira
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Menu */}
      <div className="lg:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Menu className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link to="/feed" className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Explorar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/publicar-item" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Publicar Item
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/carteira" className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Carteira
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/perfil" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/login">
                Entrar
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
