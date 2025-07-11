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
  /**
   * Rota de fallback customizada (opcional)
   * Se não fornecida, usa a rota determinada pela function do banco
   */
  fallbackRoute?: string;
}

// ====================================================================
// COMPONENT PRINCIPAL
// ====================================================================

const SmartGuard: React.FC<SmartGuardProps> = ({ 
  children, 
  fallbackRoute
}) => {
  const location = useLocation();
  const { 
    rotaDestino, 
    podeAcessar, 
    motivo, 
    dadosDebug, 
    loading, 
    error 
  } = useRotaUsuario();

  // ====================================================================
  // LOADING STATE
  // ====================================================================
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

  // ====================================================================
  // ERROR STATE
  // ====================================================================
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
  // LÓGICA SUPER SIMPLIFICADA: CONFIAR 100% NA FUNÇÃO DO BANCO
  // MAS PERMITIR TRANSIÇÕES DENTRO DO FLUXO DA MISSÃO
  // ====================================================================

  console.log(`🛡️ SmartGuard - Verificando acesso para ${location.pathname}`, {
    rotaDestino,
    podeAcessar,
    motivo,
    currentPath: location.pathname
  });

  // ✅ CASO ESPECIAL: Transições dentro do fluxo da missão
  const missaoFlowRoutes = ['/conceito-comunidade', '/publicar-primeiro-item'];
  const isMissionFlow = missaoFlowRoutes.includes(location.pathname) && 
                       missaoFlowRoutes.includes(rotaDestino);

  if (isMissionFlow) {
    // Se está dentro do fluxo da missão, permitir navegação
    console.log('✅ Navegação dentro do fluxo da missão - permitindo acesso');
    return <>{children}</>;
  }

  // ✅ CASO 1: Função disse que pode acessar e está na rota certa
  if (podeAcessar && location.pathname === rotaDestino) {
    console.log('✅ Function liberou acesso e usuário está na rota correta');
    return <>{children}</>;
  }

  // ✅ CASO 2: Está tentando acessar uma rota diferente da determinada pela função
  if (location.pathname !== rotaDestino) {
    const redirectTo = fallbackRoute || rotaDestino;
    
    console.log(`🔄 SmartGuard - Redirecionando para rota correta: ${redirectTo}`, {
      from: location.pathname,
      reason: motivo,
      podeAcessar,
      dadosDebug: {
        cadastro_status: dadosDebug.cadastro_status,
        cidade_liberada: dadosDebug.cidade_liberada,
        itens_publicados: dadosDebug.itens_publicados,
        is_admin: dadosDebug.is_admin
      }
    });

    return <Navigate to={redirectTo} replace />;
  }

  // ✅ CASO 3: Está na rota correta mas função disse que não pode acessar
  // (ex: está em /aguardando-liberacao porque cidade não foi liberada)
  if (location.pathname === rotaDestino && !podeAcessar) {
    console.log('✅ Usuário está na rota correta aguardando liberação');
    return <>{children}</>;
  }

  // ❌ FALLBACK: Não deveria chegar aqui
  console.warn('⚠️ SmartGuard - Situação não mapeada, permitindo acesso');
  return <>{children}</>;
};

// ====================================================================
// COMPONENTES AUXILIARES SIMPLIFICADOS
// ====================================================================

/**
 * Guard padrão que simplesmente obedece à função do banco
 */
export const SimpleGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SmartGuard>
    {children}
  </SmartGuard>
);

// ====================================================================
// HOOK AUXILIAR PARA VERIFICAR PERMISSÕES
// ====================================================================

/**
 * Hook para verificar se usuário pode acessar determinado nível
 */
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
      onboardingComplete: dadosDebug.telefone_verificado && dadosDebug.termos_aceitos && dadosDebug.politica_aceita && dadosDebug.endereco_completo
    }
  };
};

// ====================================================================
// COMPONENTE PARA DEBUG (apenas em desenvolvimento)
// ====================================================================

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
