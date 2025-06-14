
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Plus, User, Clock } from "lucide-react";

const QuickNav = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: "Início", path: "/feed" },
    { icon: Search, label: "Explorar", path: "/feed" },
    { icon: Plus, label: "Publicar", path: "/publicar-item" },
    { icon: Clock, label: "Reservas", path: "/minhas-reservas" },
    { icon: User, label: "Perfil", path: "/perfil" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 z-50 md:hidden">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-gray-600 hover:text-primary hover:bg-primary/5"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default QuickNav;
