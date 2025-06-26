
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, Trophy, Menu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMissoes } from '@/hooks/useMissoes';
import MoreMenu from './MoreMenu';

const QuickNav: React.FC = () => {
  const location = useLocation();
  const { missoesCompletas } = useMissoes();

  const mainItems = [
    { icon: Home, label: "Feed", path: "/feed" },
    { icon: Plus, label: "Publicar", path: "/publicar" },
    { icon: Trophy, label: "Missões", path: "/missoes" }
  ];

  return (
    // Mostrar apenas no mobile (md:hidden)
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-4 h-16">
        {mainItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center space-y-1 relative ${
                isActive 
                  ? 'text-primary bg-primary/5' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.path === '/missoes' && missoesCompletas > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-4 w-4 text-xs p-0 bg-green-500 flex items-center justify-center">
                    {missoesCompletas}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
        
        {/* Menu "Mais" */}
        <MoreMenu>
          <div className="flex flex-col items-center justify-center space-y-1 text-gray-500 hover:text-gray-700 cursor-pointer">
            <Menu className="h-5 w-5" />
            <span className="text-xs font-medium">Mais</span>
          </div>
        </MoreMenu>
      </div>
    </nav>
  );
};

export default QuickNav;
