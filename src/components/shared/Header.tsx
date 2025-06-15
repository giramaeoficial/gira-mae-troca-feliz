
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sparkles, Menu, User, Wallet, ShoppingBag, Plus, LogOut, LogIn, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";

type HeaderProps = {
  activePage?: 'comprar-girinhas' | 'como-funciona';
};

const Header = ({ activePage }: HeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };
  
  const isActive = (path: string) => location.pathname === path;

  const isLoading = authLoading || (user && profileLoading);

  return (
    <header className="container mx-auto px-4 py-6 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-primary flex items-center">
        <Sparkles className="h-6 w-6 mr-2" />
        GiraMãe
      </Link>
      
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center gap-6">
        {user && (
          <>
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
              to="/minhas-reservas" 
              className={cn("text-muted-foreground hover:text-primary transition-colors flex items-center gap-2", { 'text-primary font-semibold': isActive('/minhas-reservas') })}
            >
              <Clock className="w-4 h-4" />
              Reservas
            </Link>
            <Link 
              to="/carteira" 
              className={cn("text-muted-foreground hover:text-primary transition-colors flex items-center gap-2", { 'text-primary font-semibold': isActive('/carteira') })}
            >
              <Wallet className="w-4 h-4" />
              Carteira
            </Link>
          </>
        )}
        <a href="/#como-funciona" className={cn("text-muted-foreground hover:text-primary transition-colors", { 'text-primary font-semibold': activePage === 'como-funciona' })}>Como Funciona</a>
      </nav>

      {/* Desktop User Menu */}
      <div className="hidden lg:flex items-center gap-4">
        {isLoading ? (
          <Skeleton className="h-9 w-28 rounded-md" />
        ) : user && profile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {profile.nome?.split(' ')[0] || "Usuário"}
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
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:bg-red-50 focus:text-red-600 flex items-center gap-2 cursor-pointer">
                <LogOut className="w-4 h-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild>
            <Link to="/login" className="flex items-center gap-2">
              <LogIn className="w-4 h-4 mr-2" />
              Entrar
            </Link>
          </Button>
        )}
      </div>

      {/* Mobile Menu */}
      <div className="lg:hidden">
        {isLoading ? (
          <Skeleton className="h-9 w-9 rounded-md" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
               <div className="flex flex-col items-start p-2">
                  <span className="font-semibold">{profile?.nome || "Usuário"}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              <DropdownMenuSeparator />
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
                <Link to="/minhas-reservas" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Minhas Reservas
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
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:bg-red-50 focus:text-red-600 flex items-center gap-2 cursor-pointer">
                <LogOut className="w-4 h-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild>
            <Link to="/login">
              Entrar
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
