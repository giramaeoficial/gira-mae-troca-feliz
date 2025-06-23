
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Search, Menu, Sparkles, MessageSquare, Wallet } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useCarteira } from '@/hooks/useCarteira';
import DesktopNav from './DesktopNav';
import MoreMenu from './MoreMenu';

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
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { saldoTotal } = useCarteira();

  const userInitial = profile?.nome?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'G';

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-primary/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logotipo */}
          <Link to="/feed" className="flex items-center space-x-2 group">
            <svg
              xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="h-8 w-8 text-primary transition-colors duration-200 group-hover:text-pink-500"
            >
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
              <path d="M20 3v4" /><path d="M22 5h-4" /><path d="M4 17v2" /><path d="M5 18H3" />
            </svg>
            <span className="font-bold text-2xl bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent group-hover:from-pink-500 group-hover:to-purple-500 transition-all duration-200">
              GiraMãe
            </span>
          </Link>

          {/* Navegação Desktop */}
          <div className="hidden md:flex flex-1 justify-center">
            <DesktopNav />
          </div>

          {/* Lado Direito */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                {/* Ícones e links do Desktop */}
                <div className="hidden md:flex items-center space-x-4">
                    <Link to="/mensagens" title="Chat">
                        <MessageSquare className="w-5 h-5 text-gray-600 hover:text-pink-600" />
                    </Link>
                    <Link to="/carteira" className="text-sm font-medium text-gray-800 hover:text-pink-600">
                        Carteira
                    </Link>
                    <Button variant="ghost" size="icon" className="relative hover:bg-primary/10">
                        <Bell className="h-5 w-5" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-pink-500 text-[10px] text-white">1</span>
                    </Button>
                </div>
                
                {/* Seção do Usuário (Girinhas e Avatar) */}
                <div className="flex items-center space-x-2">
                    {/* Girinhas - visível no mobile e desktop */}
                    <div className="flex items-center gap-1 text-pink-700 font-bold bg-pink-100 px-2 py-1 rounded-full text-xs">
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm">{saldoTotal?.toFixed(0) || '0'}</span>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="focus:outline-none rounded-full focus:ring-2 focus:ring-pink-500 focus:ring-offset-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.user_metadata?.avatar_url || profile?.avatar_url || ""} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-pink-500 text-white text-sm">
                              {userInitial}
                            </AvatarFallback>
                          </Avatar>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48" align="end">
                        <DropdownMenuItem asChild><Link to="/perfil">Ver perfil</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link to="/perfil/editar">Editar</Link></DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut()} className="text-red-500 focus:bg-red-50 focus:text-red-600">
                          Sair
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Menu Mobile usando MoreMenu */}
                <div className="md:hidden">
                  <MoreMenu>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </MoreMenu>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/auth"><Button variant="ghost" size="sm">Entrar</Button></Link>
                <Link to="/auth"><Button size="sm">Cadastrar</Button></Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
