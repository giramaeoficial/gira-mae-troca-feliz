import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Trophy, Menu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from '@/hooks/useAuth';
import { useCarteira } from '@/hooks/useCarteira';
import { useNavigate } from 'react-router-dom';
import { useMissoes } from '@/hooks/useMissoes';

const Header: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { saldo } = useCarteira();
  const { missoesCompletas } = useMissoes();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = useNavigate();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/feed':
        return 'Feed';
      case '/publicar':
        return 'Publicar Item';
      case '/mensagens':
        return 'Mensagens';
      case '/perfil':
        return 'Meu Perfil';
      case '/carteira':
        return 'Carteira';
      case '/comprar-girinhas':
        return 'Comprar Girinhas';
      case '/indicacoes':
        return 'Indicações';
      case '/admin':
        return 'Admin Dashboard';
      case '/missoes':
        return 'Missões';
      default:
        return 'GiraMãe';
    }
  };

  const handleLogout = async () => {
    // setLoggingOut(true);
    // await signOut();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center space-x-3">
          <Link to="/feed" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="text-lg font-bold text-primary hidden sm:block">GiraMãe</span>
          </Link>
        </div>

        <h1 className="text-lg font-semibold text-gray-900 truncate flex-1 text-center">
          {getPageTitle()}
        </h1>

        <div className="flex items-center space-x-3">
          {user && (
            <>
              <Link to="/carteira" className="relative">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {saldo.toFixed(0)}
                </Badge>
              </Link>

              <Link to="/missoes" className="relative">
                <Button variant="ghost" size="sm" className="h-11 w-11 p-0">
                  <Trophy className="h-5 w-5 text-primary" />
                </Button>
                {missoesCompletas > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs bg-green-500 flex items-center justify-center p-0">
                    {missoesCompletas}
                  </Badge>
                )}
              </Link>
            </>
          )}

          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-11 w-11 p-0">
                <Menu className="h-5 w-5 text-gray-500" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="sm:max-w-sm">
              <SheetHeader className="space-y-2 text-left">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              {user ? (
                <div className="grid gap-4 py-4">
                  <Button variant="outline" onClick={handleLogout}>
                    Sair
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 py-4">
                  <Link to="/login">
                    <Button variant="outline">
                      Entrar
                    </Button>
                  </Link>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
