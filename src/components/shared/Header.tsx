import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Menu, X, ChevronDown, Home, Plus, Package, Trophy, Users, Wallet, Heart, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SaldoHeader from './SaldoHeader';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

/* ---------------- NAVLINK COMPONENT ------------------ */

const NavLink = ({ to, icon: Icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2 hover:text-pink-600 transition-colors",
        isActive ? "text-pink-600" : "text-gray-800"
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{children}</span>
    </Link>
  );
};

/* ---------------- DESKTOP NAVIGATION ------------------ */

const DesktopNav = () => {
  return (
    <nav className="flex items-center text-sm font-medium">
      <div className="flex gap-5 items-center">
        <NavLink to="/feed" icon={Home}>Feed</NavLink>
        <NavLink to="/publicar" icon={Plus}>Publicar</NavLink>
        <NavLink to="/minhas-reservas" icon={Package}>Reservas</NavLink>

        <div className="border-l h-5 border-gray-300 mx-2"></div>

        <NavLink to="/carteira" icon={Wallet}>Carteira</NavLink>
        <NavLink to="/favoritos" icon={Heart}>Favoritos</NavLink>
        <NavLink to="/maes-seguidas" icon={UserCheck}>Mães Seguidas</NavLink>

        <div className="border-l h-5 border-gray-300 mx-2"></div>

        <NavLink to="/missoes" icon={Trophy}>Missões</NavLink>
        <NavLink to="/indicacoes" icon={Users}>Indicações</NavLink>
      </div>
    </nav>
  );
};

/* ---------------------- HEADER ------------------------ */

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cadastroIncompleto, setCadastroIncompleto] = useState(false);
  const [loadingCadastroStatus, setLoadingCadastroStatus] = useState(true);

  const shouldSkipProfile = location.pathname === '/cadastro';
  const { profile } = shouldSkipProfile ? { profile: null } : useProfile();

  /* ------ VERIFICAR STATUS DO CADASTRO ------ */
  useEffect(() => {
    const checkCadastroStatus = async () => {
      if (!user || shouldSkipProfile) {
        setLoadingCadastroStatus(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('profiles')
          .select('cadastro_status')
          .eq('id', user.id)
          .single();

        if (data) setCadastroIncompleto(data.cadastro_status === 'incompleto');
      } catch {
        setCadastroIncompleto(true);
      } finally {
        setLoadingCadastroStatus(false);
      }
    };

    checkCadastroStatus();
  }, [user, shouldSkipProfile]);

  /* SE O HEADER NÃO DEVE APARECER */
  if (user && cadastroIncompleto && location.pathname === '/cadastro') return null;

  const shouldHideMenus = location.pathname === '/cadastro';

  /* LOGOUT */
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso!');
      navigate('/auth');
    } catch {
      toast.error('Erro ao fazer logout');
    }
  };

  const desktopNavItems = [
    { label: 'Feed', path: '/feed', icon: Home },
    { label: 'Publicar', path: '/publicar', icon: Plus },
    { label: 'Carteira', path: '/carteira', icon: Wallet },
    { label: 'Favoritos', path: '/favoritos', icon: Heart },
    { label: 'Mães Seguidas', path: '/maes-seguidas', icon: UserCheck },
    { label: 'Missões', path: '/missoes', icon: Trophy },
    { label: 'Reservas', path: '/minhas-reservas', icon: Package }
  ];

  /* ------------------ HEADER DESLOGADO ------------------ */

  if (!user) {
    return (
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="w-full max-w-[1400px] mx-auto px-4">
          <div className="flex justify-between items-center h-16">

            <Link to="/" className="flex items-center gap-2">
              <img src="/giramae_logo.png" alt="Logo GiraMãe"
                className="h-16 w-auto object-contain" />
            </Link>

            <div className="flex items-center space-x-4">
              <Link to="/login"><Button variant="outline">Entrar</Button></Link>
              <Link to="/auth"><Button>Cadastrar</Button></Link>
            </div>

          </div>
        </div>
      </header>
    );
  }

  /* ------------------ HEADER LOGADO ------------------ */

  return (
    <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="w-full max-w-[1400px] mx-auto px-4">
          
          <div className="flex justify-between items-center h-16">

            {/* -------------- LOGO -------------- */}
            <Link to="/feed" className="flex items-center gap-2">
              <img src="/giramae_logo.png" alt="Logo GiraMãe"
                className="h-16 w-auto object-contain" />
              
            </Link>

            {/* -------------- MENU CENTRAL -------------- */}
            {!shouldHideMenus && (
              <div className="hidden md:flex items-center justify-center flex-1">
                <DesktopNav />
              </div>
            )}

            {/* -------------- LADO DIREITO -------------- */}
            <div className="hidden md:flex items-center space-x-4">
              {!shouldHideMenus && <SaldoHeader />}
              {!shouldHideMenus && <NotificationBell />}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  {!shouldHideMenus && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/perfil')}>Meu Perfil</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/perfil/editar')}>Editar Perfil</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/configuracoes')}>Configurações</DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}>Sair</DropdownMenuItem>
                </DropdownMenuContent>

              </DropdownMenu>

            </div>

            {/* -------------- MOBILE BUTTON -------------- */}

            <div className="md:hidden flex items-center space-x-2">
              {!shouldHideMenus && <SaldoHeader />}
              {!shouldHideMenus && <NotificationBell />}

              {!shouldHideMenus ? (
                <Button variant="ghost" size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>

                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}

                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      {mobileMenuOpen && !shouldHideMenus && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50"
             onClick={() => setMobileMenuOpen(false)}>

          <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg"
               onClick={e => e.stopPropagation()}>

            <div className="p-4 border-b flex justify-between items-center">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="w-10 h-10 rounded-full" />
              ) : (
                <User className="w-10 h-10 p-2 bg-gray-100 rounded-full" />
              )}

              <Button variant="ghost" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="p-4 space-y-2">
              {desktopNavItems.map(item => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 py-2 px-3 rounded-md text-sm ${
                      location.pathname === item.path
                        ? "bg-primary text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}

              <hr className="my-4" />

              <button
                onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 w-full py-2 px-3 text-red-600 hover:bg-red-50 rounded-md"
              >
                <X className="w-4 h-4" />
                Sair
              </button>
            </nav>

          </div>
        </div>
      )}

    </>
  );
};

export default Header;
