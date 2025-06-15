
import { Link, useLocation } from "react-router-dom";
import { Search, Plus, User, Clock, Heart } from "lucide-react";

const QuickNav = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: Search, label: "Explorar", path: "/feed", id: "nav-explorar" },
    { icon: Plus, label: "Publicar", path: "/publicar-item", id: "nav-publicar" },
    { icon: Heart, label: "Favoritos", path: "/favoritos", id: "nav-favoritos" },
    { icon: Clock, label: "Reservas", path: "/minhas-reservas", id: "nav-reservas" },
    { icon: User, label: "Perfil", path: "/perfil", id: "nav-perfil" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 z-50 md:hidden">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.id}
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
