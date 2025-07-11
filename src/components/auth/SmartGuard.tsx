// src/components/auth/SmartGuard.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRotaUsuario } from '@/hooks/useRotaUsuario';
import LoadingSpinner from '@/components/loading/LoadingSpinner';

// ====================================================================
// INTERFACES
// ====================================================================

interface SmartGuardProps {
  children: React.ReactNode;
  fallbackRoute?: string;
}

// ====================================================================
// GRUPOS DE FLUXO
// ====================================================================

const grupos: string[][] = [
  ['/onboarding/whatsapp', '/onboarding/codigo'],
  ['/onboarding/termos', '/onboarding/endereco'],
  ['/conceito-comunidade', '/publicar-primeiro-item'],
  ['/aguardando-liberacao'],
];
const telasSensiveis = grupos.flat();
const idxGrupo = (rota: string) => grupos.findIndex(g => g.includes(rota));

// ====================================================================
// COMPONENT PRINCIPAL
// ====================================================================

const SmartGuard: React.FC<SmartGuardProps> = ({ children, fallbackRoute }) => {
  const location = useLocation();
  const { rotaDestino, podeAcessar, motivo, dadosDebug, loading, error } = useRotaUsuario();

  // LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-pink-500 rounded-full flex items-center justify-center mx-auto">
            <LoadingSpinner className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Verificando seu acesso...
          </h2>
          <p className="text-gray-600">
            Aguarde um momento
          </p>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    console.error('❌ SmartGuard - Erro no hook useRotaUsuario:', error);

    // Se estamos em /auth e há erro, permitir acesso para quebrar loop
    if (location.pathname === '/auth') {
      return <>{children}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-lg font-semibold text-red-800">
            Erro de Verificação
          </h2>
          <p className="text-red-600 text-sm">
            Ocorreu um erro ao verificar suas permissões. Tente recarregar a página.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Recarregar Página
          </button>
        </div>
      </div>
    );
  }

  // ====================================================================
  // LÓGICA DE ACESSO FLUXO SENSÍVEL / NORMAL
  // ====================================================================

  // 1. Cadastro completo (podeAcessar = true): só bloqueia se tentar acessar tela sensível
  if (podeAcessar) {
    if (location.pathname === '/admin' && !dadosDebug.is_admin) {
      return <Navigate to="/feed" replace />;
    }
    if (telasSensiveis.includes(location.pathname)) {
      return <Navigate to="/feed" replace />;
    }
    return <>{children}</>;
  }

  // 2. Cadastro INCOMPLETO: pode alternar entre rotas do mesmo grupo, mas não pode saltar grupos
  if (location.pathname === rotaDestino) return <>{children}</>;

  const idxDestino = idxGrupo(rotaDestino);
  const idxAtual = idxGrupo(location.pathname);
  const emMesmoGrupo = idxDestino !== -1 && idxAtual !== -1 && idxDestino === idxAtual;

  if (emMesmoGrupo) return <>{children}</>;

  const redirectTo = fallbackRoute || rotaDestino;
  return <Navigate to={redirectTo} replace />;
};

// ====================================================================
// COMPONENTES AUXILIARES SIMPLIFICADOS
// ====================================================================

export const SimpleGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SmartGuard>{children}</SmartGuard>
);

export const useCanAccess = () => {
  const { podeAcessar, motivo, dadosDebug } = useRotaUsuario();

  return {
    canAccessFull: podeAcessar,
    isAdmin: dadosDebug.is_admin,
    currentReason: motivo,
    debugInfo: {
      isAdmin: dadosDebug.is_admin,
      cityReleased: dadosDebug.cidade_liberada,
      itemsPublished: dadosDebug.itens_publicados,
      onboardingComplete:
        dadosDebug.telefone_verificado &&
        dadosDebug.termos_aceitos &&
        dadosDebug.politica_aceita &&
        dadosDebug.endereco_completo,
    },
  };
};

export const SmartGuardDebugInfo: React.FC = () => {
  const { rotaDestino, podeAcessar, motivo, dadosDebug, loading } = useRotaUsuario();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  if (loading) {
    return <div className="fixed bottom-4 right-4 bg-yellow-100 p-2 rounded text-xs">Loading...</div>;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs max-w-xs">
      <div className="font-bold mb-2">🛡️ SmartGuard Debug</div>
      <div>Rota: {rotaDestino}</div>
      <div>Acesso: {podeAcessar ? '✅' : '❌'}</div>
      <div>Motivo: {motivo}</div>
      <div>Admin: {dadosDebug.is_admin ? '✅' : '❌'}</div>
      <div>Cidade: {dadosDebug.cidade_liberada ? '✅' : '❌'}</div>
      <div>Itens: {dadosDebug.itens_publicados}</div>
    </div>
  );
};

export default SmartGuard;
