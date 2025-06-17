
import { Link, useLocation } from "react-router-dom";
import { Search, Plus, Clock, User, Badge as BadgeIcon } from "lucide-react";
import { useCarteira } from "@/hooks/useCarteira";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

const QuickNav = () => {
  const location = useLocation();
  const { saldo } = useCarteira();
  const { user } = useAuth();
  
  if (!user) return null;
  
  const navItems = [
    { 
      icon: Search, 
      label: "Explorar", 
      path: "/feed", 
      id: "nav-explorar" 
    },
    { 
      icon: Plus, 
      label: "Publicar", 
      path: "/publicar", 
      id: "nav-publicar" 
    },
    { 
      icon: Clock, 
      label: "Trocas", 
      path: "/reservas", 
      id: "nav-reservas" 
    },
    { 
      icon: User, 
      label: "Perfil", 
      path: "/perfil", 
      id: "nav-perfil" 
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 md:hidden">
      <div className="grid grid-cols-4 h-20">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`relative flex flex-col items-center justify-center gap-1 transition-all duration-200 min-h-[44px] ${
                isActive 
                  ? "text-primary bg-primary/5" 
                  : "text-gray-600 hover:text-primary hover:bg-primary/5"
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
                
                {/* Badge de notificação para Trocas */}
                {item.path === "/reservas" && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">3</span>
                  </div>
                )}
              </div>
              
              <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
              
              {/* Indicador de aba ativa */}
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full" />
              )}
            </Link>
          );
        })}
      </div>
      
      {/* Floating Girinhas Badge */}
      <div className="absolute -top-3 right-4">
        <Link to="/carteira">
          <Badge 
            variant="secondary" 
            className="relative bg-yellow-100 text-yellow-800 font-semibold px-3 py-1 shadow-lg border border-yellow-200"
          >
            <BadgeIcon className="h-3 w-3 mr-1" />
            {saldo.toFixed(0)}
            
            {/* Pulse indicator */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </Badge>
        </Link>
      </div>
    </nav>
  );
};

export default QuickNav;
