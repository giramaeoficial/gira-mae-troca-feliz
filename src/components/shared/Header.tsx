import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Menu, X, ChevronDown, Home, Plus, Package, Trophy, Users, Wallet, MessageCircle, Heart, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

const NavLink: React.FC<{ to: string; icon: React.ElementType; children: React.ReactNode }> = ({ to, icon: Icon, children }) => {
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

const DesktopNav: React.FC = () => {
  return (
    <nav className="flex items-center text-sm font-medium">
      <div className="flex gap-8 items-center">
        {/* Bloco de Ações Principais */}
        <NavLink to="/feed" icon={Home}>Feed</NavLink>
        <NavLink to="/publicar" icon={Plus}>Publicar</NavLink>
        <NavLink to="/minhas-reservas" icon={Package}>Reservas</NavLink>
        
        {/* Separador Vertical */}
        <div className="border-l h-6 border-gray-300 mx-3"></div>
        
        {/* Bloco de Funcionalidades */}
        <NavLink to="/carteira" icon={Wallet}>Carteira</NavLink>
        <NavLink to="/favoritos" icon={Heart}>Favoritos</NavLink>
        <NavLink to="/maes-seguidas" icon={UserCheck}>Mães Seguidas</NavLink>
        
        {/* Separador Vertical */}
        <div className="border-l h-6 border-gray-300 mx-3"></div>
        
        {/* Bloco de Gamificação */}
        <NavLink to="/missoes" icon={Trophy}>Missões</NavLink>
        <NavLink to="/indicacoes" icon={Users}>Indicações</NavLink>
      </div>
    </nav>
  );
};

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cadastroIncompleto, setCadastroIncompleto] = useState(false);
  const [loadingCadastroStatus, setLoadingCadastroStatus] = useState(true);

  // ✅ FIX: Só carregar profile quando não estiver em /cadastro
  const shouldSkipProfile = location.pathname === '/cadastro';
  const { profile } = shouldSkipProfile ? { profile: null } : useProfile();

  // ✅ NOVA VERIFICAÇÃO ADICIONADA - Verificar se o usuário tem cadastro incompleto
  useEffect(() => {
    const checkCadastroStatus = async () => {
      if (!user || shouldSkipProfile) {
        setLoadingCadastroStatus(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('cadastro_status')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setCadastroIncompleto(data.cadastro_status === 'incompleto');
        }
      } catch (error) {
        console.error('Erro ao verificar status do cadastro:', error);
        setCadastroIncompleto(true); // Por segurança, assumir incompleto
      } finally {
        setLoadingCadastroStatus(false);
      }
    };

    checkCadastroStatus();
  }, [user, shouldSkipProfile]);
  
  // ✅ ADICIONAR ESTA CONDIÇÃO ANTES DE TUDO:
  const shouldHideHeader = user && cadastroIncompleto && location.pathname === '/cadastro';
  
  // ✅ SE DEVE OCULTAR, RETORNAR NULL:
  if (shouldHideHeader) {
    return null;
  }
  
  // ✅ VERIFICAR SE DEVE OCULTAR MENUS (não o header todo)
  const shouldHideMenus = location.pathname === '/cadastro';

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso!');
      navigate('/auth');
    } catch (error) {
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

  if (!user) {
    return (
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              {/* <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles h-8 w-8 text-primary">
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
                <path d="M20 3v4"></path>
                <path d="M22 5h-4"></path>
                <path d="M4 17v2"></path>
                <path d="M5 18H3"></path>
              </svg> */}
              <img
                src="/giramae_logo.png"
                alt="Logo GiraMãe"
                className="h-12 w-auto mr-4"
              />
              {/* <span className="text-2xl font-bold text-primary">GiraMãe</span> */}
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline">Entrar</Button>
              </Link>
              <Link to="/auth">
                <Button>Cadastrar</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/feed" className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles h-8 w-8 text-primary">
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
                <path d="M20 3v4"></path>
                <path d="M22 5h-4"></path>
                <path d="M4 17v2"></path>
                <path d="M5 18H3"></path>
              </svg>
              <span className="text-2xl font-bold text-primary">GiraMãe</span>
            </Link>

            {/* Desktop Navigation - Hidden on mobile and during signup */}
            {!shouldHideMenus && (
              <div className="hidden md:flex items-center ml-16">
                <DesktopNav />
              </div>
            )}

            {/* Right side - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Notification Bell - Hide during signup */}
              {!shouldHideMenus && <NotificationBell />}
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.nome || 'Avatar'} 
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {!shouldHideMenus && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/perfil')}>
                        Meu Perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/perfil/editar')}>
                        Editar Perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/configuracoes')}>
                        Configurações
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile menu button and notification */}
            <div className="md:hidden flex items-center space-x-2">
              {/* ✅ FIX: Só mostrar NotificationBell quando não estiver em /cadastro */}
              {!shouldHideMenus && <NotificationBell />}
              {!shouldHideMenus ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2"
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="p-2 text-gray-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay - Hide during signup */}
      {mobileMenuOpen && !shouldHideMenus && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.nome || 'Avatar'} 
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <User className="w-10 h-10 p-2 bg-gray-100 rounded-full" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{profile?.nome || 'Usuário'}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <nav className="p-4 space-y-2">
              {desktopNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
              
              <hr className="my-4" />
              
              <Link
                to="/perfil"
                className="flex items-center gap-3 py-2 px-3 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                Meu Perfil
              </Link>
              <Link
                to="/perfil/editar"
                className="flex items-center gap-3 py-2 px-3 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                Editar Perfil
              </Link>
              <Link
                to="/configuracoes"
                className="flex items-center gap-3 py-2 px-3 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                Configurações
              </Link>
              
              <hr className="my-4" />
              
              <button
                onClick={() => {
                  handleSignOut();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full text-left py-2 px-3 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
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
