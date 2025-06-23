
import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Search, Menu, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import DesktopNav from './DesktopNav';

interface HeaderProps {
  onSearch?: (term: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  onSearch, 
  searchPlaceholder = "Buscar...", 
  showSearch = false 
}) => {
  const { user } = useAuth();
  const { profile } = useProfile();

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-primary/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo com novo design */}
          <div className="flex items-center">
            <Link to="/feed" className="flex items-center space-x-3 group">
              {/* Novo logotipo com SVG */}
              <div className="relative">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="40" 
                  height="40" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="text-primary group-hover:text-pink-500 transition-colors duration-200"
                >
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                  <path d="M20 3v4" />
                  <path d="M22 5h-4" />
                  <path d="M4 17v2" />
                  <path d="M5 18H3" />
                </svg>
              </div>
              
              {/* Nome da marca */}
              <div className="flex flex-col">
                <span className="font-bold text-xl bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent group-hover:from-pink-500 group-hover:to-purple-500 transition-all duration-200">
                  GiraMãe
                </span>
                <span className="text-xs text-muted-foreground hidden sm:block">
                  Comunidade de trocas
                </span>
              </div>
            </Link>
          </div>

          {/* Navegação Desktop */}
          <div className="hidden md:block">
            <DesktopNav />
          </div>

          {/* Search Bar (opcional) */}
          {showSearch && (
            <div className="flex-1 max-w-md mx-4 hidden lg:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="search"
                  placeholder={searchPlaceholder}
                  className="pl-10 bg-white/50 border-primary/20 focus:border-primary/40"
                  onChange={(e) => onSearch?.(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            {/* Search Icon Mobile */}
            {showSearch && (
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Search className="h-5 w-5" />
              </Button>
            )}

            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-primary/10"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-pink-500 rounded-full animate-pulse"></span>
            </Button>

            {/* User Section */}
            {user ? (
              <div className="flex items-center space-x-2">
                {/* Saldo de Girinhas (opcional) */}
                <div className="hidden sm:flex items-center space-x-1 bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 rounded-full">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">
                    {profile?.saldo_girinhas || 0}
                  </span>
                </div>

                {/* User Avatar */}
                <Link to="/perfil" className="flex items-center space-x-2 group">
                  <Avatar className="h-8 w-8 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                    <AvatarImage src={user.user_metadata?.avatar_url || profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-pink-500 text-white text-xs">
                      {user.user_metadata?.name?.substring(0, 2).toUpperCase() || 
                       profile?.nome?.substring(0, 2).toUpperCase() ||
                       user.email?.substring(0, 2).toUpperCase() || "GM"}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Nome do usuário (desktop) */}
                  <div className="hidden lg:block">
                    <div className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">
                      {user.user_metadata?.name || profile?.nome || 'Mãe'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Ver perfil
                    </div>
                  </div>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/auth">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="hidden sm:flex"
                  >
                    Entrar
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90"
                  >
                    Cadastrar
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar (quando ativo) */}
      {showSearch && (
        <div className="border-t border-primary/10 px-4 py-3 lg:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              className="pl-10 bg-white/50 border-primary/20"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
