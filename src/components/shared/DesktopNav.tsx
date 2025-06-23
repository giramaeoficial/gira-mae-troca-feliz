import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils"; // Importe a função 'cn' para classes condicionais

const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "hover:text-pink-600 transition-colors",
        isActive ? "text-pink-600" : "text-gray-800"
      )}
    >
      {children}
    </Link>
  );
};

const DesktopNav: React.FC = () => {
  return (
    <nav className="flex gap-8 items-center text-sm font-medium">
      {/* Bloco de Ações Principais */}
      <NavLink to="/feed">Feed</NavLink>
      <NavLink to="/publicar">Publicar</NavLink> {/* Corrigido de /publicar */}
      <NavLink to="/minhas-reservas">Reservas</NavLink>

      {/* Separador Vertical */}
      <div className="border-l h-6 border-gray-300 mx-2"></div>

      {/* Bloco de Gamificação */}
      <NavLink to="/missoes">Missões</NavLink>
      <NavLink to="/indicacoes">Indicações</NavLink>
    </nav>
  );
};

export default DesktopNav;
