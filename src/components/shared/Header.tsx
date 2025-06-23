import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
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
import DesktopNav from './DesktopNav';
import { useCarteira } from '@/hooks/useCarteira';
import { useConversas } from '@/hooks/useConversas';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { saldo } = useCarteira();
  const { totalUnread } = useConversas();

  const userInitial = profile?.nome?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'G';

  return (
    <header className="flex items-center justify-between bg-white px-6 py-3 shadow-md sticky top-0 z-50">
      {/* Logo CORRIGIDO */}
      <Link to="/" className="flex items-center gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8 text-primary"
        >
          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
          <path d="M20 3v4"></path>
          <path d="M22 5h-4"></path>
          <path d="M4 17v2"></path>
          <path d="M5 18H3"></path>
        </svg>
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
          GiraMãe
        </span>
      </Link>

      {/* Bloco Central: Navegação */}
      {user && (
        <div className="flex-1 flex justify-center">
          <DesktopNav />
        </div>
      )}

      {/* Bloco Direita: Conta */}
      <div className="flex items-center gap-4">
        {user && profile ? (
          <>
            {/* Chat */}
            <Link to="/mensagens" title="Chat" className="relative">
              <MessageSquare className="w-5 h-5 text-gray-600 hover:text-pink-600" />
              {totalUnread > 0 && (
                <span className="absolute -top-1 -right-2 bg-pink-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center">
                  {totalUnread}
                </span>
              )}
            </Link>

            {/* Carteira */}
            <Link to="/carteira" className="text-sm font-medium text-gray-800 hover:text-pink-600 hidden sm:block">
              Carteira
            </Link>

            {/* Girinhas */}
            <div className="flex items-center gap-1 text-pink-700 font-bold bg-pink-100 px-2 py-1 rounded-full text-xs">
              <span>{saldo ?? 0}</span>
              <span role="img" aria-label="girinhas">🪙</span>
            </div>

            {/* Notificação */}
            <button className="relative" title="Notificações">
              <Bell className="w-5 h-5 text-gray-600 hover:text-pink-600" />
              <span className="absolute top-0 right-0 bg-pink-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center">1</span>
            </button>

            {/* Menu do Perfil Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 focus:outline-none">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback className="bg-green-800 text-white text-sm">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="end">
                <DropdownMenuItem asChild>
                  <Link to="/perfil">Ver perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/perfil/editar">Editar</Link> {/* CORRIGIDO */}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-red-500 focus:bg-red-50 focus:text-red-600">
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          /* Botões de Entrar/Cadastrar para visitantes */
          <div className="flex items-center gap-2">
            <Link to="/auth">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link to="/auth">
              <Button>Cadastrar</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
