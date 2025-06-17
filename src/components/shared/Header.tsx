
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Menu, X, Bell, User, Wallet, ShoppingCart, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCarteira } from "@/hooks/useCarteira";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface HeaderProps {
  activePage?: string;
}

const Header = ({ activePage }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const { saldo } = useCarteira();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setIsMenuOpen(false);
  };

  // Desktop header - mantém funcionalidade atual
  if (!isMobile) {
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
                  <span>Feed</span>
                </Link>

                <Link
                  to="/publicar"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activePage === "publicar"
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-600 hover:text-primary hover:bg-primary/10"
                  }`}
                >
                  <span>Publicar</span>
                </Link>

                <Link
                  to="/reservas"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activePage === "reservas"
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-600 hover:text-primary hover:bg-primary/10"
                  }`}
                >
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
                  <span>Girinhas</span>
                </Link>
              </nav>
            )}

            {/* User Menu Desktop */}
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
  }

  // Mobile header - versão simplificada
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 md:hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center text-primary">
            <Sparkles className="h-5 w-5 mr-2" />
            <span className="text-lg font-bold">GiraMãe</span>
          </Link>

          {/* Mobile Menu e Saldo */}
          <div className="flex items-center space-x-3">
            {user && (
              <>
                {/* Saldo com Badge de Notificação */}
                <Link to="/carteira" className="relative">
                  <Badge variant="secondary" className="text-xs font-medium bg-yellow-100 text-yellow-800 pr-2">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {saldo.toFixed(0)}
                  </Badge>
                  {/* Badge de notificação */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                    <Bell className="h-2 w-2 text-white" />
                  </div>
                </Link>

                {/* Menu Hambúrguer */}
                <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <SheetTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-11 w-11 p-0"
                      aria-label="Abrir menu"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Menu</SheetTitle>
                      <SheetDescription>
                        Acesse todas as funcionalidades do GiraMãe
                      </SheetDescription>
                    </SheetHeader>
                    
                    <div className="mt-6 space-y-1">
                      {/* Perfil do usuário */}
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.user_metadata?.avatar_url} alt="Avatar" />
                          <AvatarFallback>
                            {user.user_metadata?.name?.charAt(0) || user.email?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {user.user_metadata?.name || user.email}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>

                      {/* Links secundários */}
                      <Link
                        to="/perfil"
                        className="flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors min-h-[44px]"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Meu Perfil
                      </Link>
                      
                      <Link
                        to="/carteira"
                        className="flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors min-h-[44px]"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Carteira
                      </Link>
                      
                      <Link
                        to="/sistema-girinhas"
                        className="flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors min-h-[44px]"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sistema Girinhas
                      </Link>

                      <Link
                        to="/indicacoes"
                        className="flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors min-h-[44px]"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Indicações
                      </Link>
                      
                      <div className="border-t border-gray-200 my-4" />
                      
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors min-h-[44px]"
                      >
                        Sair
                      </button>
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            )}

            {!user && (
              <Button size="sm" asChild>
                <Link to="/auth">Entrar</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
