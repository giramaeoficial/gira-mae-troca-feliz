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
   * Nível de proteção do guard
   * - 'full': Proteção completa (padrão) - precisa passar por todas as verificações
   * - 'mission_only': Permite acesso para completar missões - só bloqueia onboarding incompleto
   * - 'admin_bypass': Admin sempre pode acessar - para rotas administrativas
   */
  protectionLevel?: 'full' | 'mission_only' | 'admin_bypass';
  
  /**
   * Rota de fallback customizada (opcional)
   * Se não fornecida, usa a rota determinada pela function do banco
   */
  fallbackRoute?: string;
  
  /**
   * Permitir acesso mesmo com verificações pendentes (para casos especiais)
   */
  allowPendingVerification?: boolean;
}

// ====================================================================
// COMPONENT PRINCIPAL
// ====================================================================

const SmartGuard: React.FC<SmartGuardProps> = ({ 
  children, 
  protectionLevel = 'full',
  fallbackRoute,
  allowPendingVerification = false 
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
  // LÓGICA DE DECISÃO POR NÍVEL DE PROTEÇÃO
  // ====================================================================

  const shouldAllow = (() => {
    console.log(`🛡️ SmartGuard - Verificando acesso para ${location.pathname}`, {
      protectionLevel,
      rotaDestino,
      podeAcessar,
      motivo,
      currentPath: location.pathname
    });

    switch (protectionLevel) {
      case 'admin_bypass':
        // Para rotas administrativas - admin sempre pode acessar
        if (dadosDebug.is_admin) {
          console.log('✅ Admin detectado - bypass liberado');
          return true;
        }
        // Se não é admin, seguir lógica normal
        break;

      case 'mission_only':
        // Para /missoes - permite se passou do onboarding básico
        const onboardingMotivos = [
          'whatsapp_nao_verificado', 
          'termos_nao_aceitos', 
          'politica_nao_aceita', 
          'endereco_incompleto'
        ];
        
        if (!onboardingMotivos.includes(motivo)) {
          console.log('✅ Onboarding completo - acesso à missão liberado');
          return true;
        }
        
        console.log('❌ Onboarding incompleto - bloqueando acesso à missão');
        break;

      case 'full':
      default:
        // Proteção completa - segue a decisão da function do banco
        if (podeAcessar) {
          console.log('✅ Function do banco liberou acesso total');
          return true;
        }
        
        // Verificar se está tentando acessar exatamente a rota correta
        if (location.pathname === rotaDestino) {
          console.log('✅ Usuário está na rota correta determinada pelo sistema');
          return true;
        }
        
        console.log('❌ Acesso negado - redirecionamento necessário');
        break;
    }

    return false;
  })();

  // ====================================================================
  // PERMITIR ACESSO
  // ====================================================================
  if (shouldAllow) {
    return <>{children}</>;
  }

  // ====================================================================
  // ROTAS SEMPRE PERMITIDAS (mesmo com restrições)
  // ====================================================================
  const rotasSemprePermitidas = [
    '/auth',
    '/login',
    '/auth-callback',
    '/onboarding/whatsapp',
    '/onboarding/codigo', 
    '/onboarding/termos',
    '/onboarding/endereco',
    '/conceito-comunidade',
    '/publicar-primeiro-item',
    '/aguardando-liberacao'
  ];

  if (rotasSemprePermitidas.includes(location.pathname)) {
    console.log('✅ Rota sempre permitida:', location.pathname);
    return <>{children}</>;
  }

  // ====================================================================
  // VERIFICAÇÃO ESPECIAL PARA PENDING VERIFICATION
  // ====================================================================
  if (allowPendingVerification && motivo.includes('verificacao_pendente')) {
    console.log('✅ Acesso liberado apesar de verificação pendente');
    return <>{children}</>;
  }

  // ====================================================================
  // REDIRECIONAMENTO
  // ====================================================================
  const redirectTo = fallbackRoute || rotaDestino;
  
  console.log(`🔄 SmartGuard - Redirecionando para: ${redirectTo}`, {
    from: location.pathname,
    reason: motivo,
    protectionLevel,
    dadosDebug: {
      cadastro_status: dadosDebug.cadastro_status,
      cidade_liberada: dadosDebug.cidade_liberada,
      itens_publicados: dadosDebug.itens_publicados,
      is_admin: dadosDebug.is_admin
    }
  });

  return <Navigate to={redirectTo} replace />;
};

// ====================================================================
// COMPONENTES AUXILIARES PRÉ-CONFIGURADOS
// ====================================================================

/**
 * Guard para rotas que requerem proteção completa
 * Exemplo: Feed, Carteira, Perfil, etc.
 */
export const FullProtectionGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SmartGuard protectionLevel="full">
    {children}
  </SmartGuard>
);

/**
 * Guard para rotas de missão que precisam ser acessíveis para completar
 * Exemplo: /missoes, /conceito-comunidade, /publicar-primeiro-item
 */
export const MissionGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SmartGuard protectionLevel="mission_only">
    {children}
  </SmartGuard>
);

/**
 * Guard para rotas administrativas
 * Exemplo: /admin
 */
export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SmartGuard protectionLevel="admin_bypass">
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
    canAccessMissions: !['whatsapp_nao_verificado', 'termos_nao_aceitos', 'politica_nao_aceita', 'endereco_incompleto'].includes(motivo),
    canAccessAdmin: dadosDebug.is_admin,
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
