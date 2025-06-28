
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Plus, Heart, User, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

const QuickNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: Search, label: 'Buscar', path: '/feed' },
    { icon: Plus, label: 'Publicar', path: '/publicar' },
    { icon: Heart, label: 'Favoritos', path: '/favoritos' },
    { icon: Wallet, label: 'Carteira', path: '/carteira' },
    { icon: User, label: 'Perfil', path: '/perfil' }
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            size="sm"
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
              isActive(item.path)
                ? 'text-primary bg-primary/10'
                : 'text-gray-600 hover:text-primary hover:bg-primary/5'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickNav;
