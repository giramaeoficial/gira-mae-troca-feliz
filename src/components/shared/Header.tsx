
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Home, Plus, Heart, User, Wallet, ShoppingCart, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCarteira } from "@/hooks/useCarteira";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  activePage?: string;
}

const Header = ({ activePage }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const { saldo } = useCarteira();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center text-primary">
            <Sparkles className="h-6 w-6 mr-2" />
            <span className="text-xl font-bold">GiraMãe</span>
          </Link>

          {/* Navigation */}
          {user && (
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/feed"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activePage === "feed"
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-600 hover:text-primary hover:bg-primary/10"
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Feed</span>
              </Link>

              <Link
                to="/publicar-item"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activePage === "publicar"
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-600 hover:text-primary hover:bg-primary/10"
                }`}
              >
                <Plus className="h-4 w-4" />
                <span>Publicar</span>
              </Link>

              <Link
                to="/minhas-reservas"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activePage === "reservas"
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-600 hover:text-primary hover:bg-primary/10"
                }`}
              >
                <Heart className="h-4 w-4" />
                <span>Trocas</span>
              </Link>

              <Link
                to="/carteira"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activePage === "carteira"
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-600 hover:text-primary hover:bg-primary/10"
                }`}
              >
                <Wallet className="h-4 w-4" />
                <span>Carteira</span>
              </Link>

              <Link
                to="/sistema-girinhas"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activePage === "sistema-girinhas"
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-600 hover:text-primary hover:bg-primary/10"
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Girinhas</span>
              </Link>
            </nav>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Saldo de Girinhas */}
                <Badge variant="secondary" className="text-sm font-medium bg-yellow-100 text-yellow-800">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {saldo.toFixed(0)} Girinhas
                </Badge>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt="Avatar" />
                        <AvatarFallback>
                          {user.user_metadata?.name?.charAt(0) || user.email?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">
                          {user.user_metadata?.name || user.email}
                        </p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/perfil" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Meu Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/carteira" className="flex items-center">
                        <Wallet className="mr-2 h-4 w-4" />
                        <span>Carteira</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/sistema-girinhas" className="flex items-center">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        <span>Sistema Girinhas</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/auth">Entrar</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth">Cadastrar</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
