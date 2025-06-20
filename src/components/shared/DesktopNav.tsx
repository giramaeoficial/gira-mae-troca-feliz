
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, MessageCircle, User, Trophy, Wallet, Package, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMissoes } from '@/hooks/useMissoes';

const DesktopNav: React.FC = () => {
  const location = useLocation();
  const { missoesCompletas } = useMissoes();

  const navItems = [
    { icon: Home, label: "Feed", path: "/feed" },
    { icon: Plus, label: "Publicar", path: "/publicar" },
    { icon: Trophy, label: "Missões", path: "/missoes" },
    { icon: MessageCircle, label: "Chat", path: "/mensagens" },
    { icon: Wallet, label: "Carteira", path: "/carteira" },
    { icon: Package, label: "Reservas", path: "/minhas-reservas" },
    { icon: Users, label: "Indicações", path: "/indicacoes" },
    { icon: User, label: "Perfil", path: "/perfil" }
  ];

  return (
    // Mostrar apenas no desktop (hidden md:flex)
    <nav className="hidden md:flex items-center space-x-1">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        
        return (
          <Button
            key={item.path}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            asChild
            className="relative"
          >
            <Link to={item.path} className="flex items-center space-x-2">
              <Icon className="h-4 w-4" />
              <span className="hidden lg:inline">{item.label}</span>
              {item.path === '/missoes' && missoesCompletas > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 text-xs p-0 bg-green-500 flex items-center justify-center">
                  {missoesCompletas}
                </Badge>
              )}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
};

export default DesktopNav;
