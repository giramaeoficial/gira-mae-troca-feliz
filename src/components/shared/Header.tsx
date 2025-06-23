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
import DesktopNav from './DesktopNav'; // Mantém o import do seu nav
import { useCarteira } from '@/hooks/useCarteira'; // Hook para o saldo
import { useConversas } from '@/hooks/useConversas'; // Hook para mensagens não lidas

const Header: React.FC = () => {
  const { user, signOut } = useAuth(); // Adicionado signOut
  const { profile } = useProfile();
  const { saldo } = useCarteira();
  const { totalUnread } = useConversas();

  const userInitial = profile?.nome?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'G';

  return (
    <header className="flex items-center justify-between bg-white px-6 py-3 shadow-md sticky top-0 z-50">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <div className="text-pink-600 font-bold text-2xl">✶</div>
        <div className="text-pink-600 font-extrabold text-lg tracking-tight">GiraMãe</div>
      </Link>

      {/* Bloco Central: Navegação (apenas para usuários logados) */}
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
              <span className="absolute top-0 right-0 bg-pink-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center">
                1 {/* Exemplo estático */}
              </span>
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
                  <Link to="/editar-perfil">Editar</Link>
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
