import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRotaUsuario } from '@/hooks/useRotaUsuario';
import LoadingSpinner from '@/components/loading/LoadingSpinner';

// ====================================================================
// ONBOARDING SYSTEM 2.0 - SMARTGUARD COM PROTEÇÃO ANTI-BURLA
// ====================================================================

interface SmartGuardProps {
  children: React.ReactNode;
  fallbackRoute?: string;
}

// ====================================================================
// SMARTGUARD COM PROTEÇÃO TOTAL CONTRA BURLA
// ====================================================================

const SmartGuard: React.FC<SmartGuardProps> = ({ children, fallbackRoute }) => {
  const location = useLocation();
  const { rotaDestino, podeAcessar, motivo, dadosDebug, loading, error } = useRotaUsuario();

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
          <p className="text-gray-600">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  // ====================================================================
  // ERROR STATE
  // ====================================================================
  if (error) {
    console.error('❌ SmartGuard - Erro no useRotaUsuario:', error);
    
    if (location.pathname === '/auth') {
      return <>{children}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-lg font-semibold text-red-800">Erro de Verificação</h2>
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
  // PROTEÇÃO ANTI-BURLA CRÍTICA
  // ====================================================================

  const currentPath = location.pathname;
  const onboardingStep = dadosDebug.onboarding_step || 1;
  
  console.log('🛡️ SmartGuard - Verificação anti-burla:', {
    currentPath,
    rotaDestino,
    onboardingStep,
    podeAcessar,
    motivo
  });

  // ✅ REGRA 1: STEP 5+ NUNCA PODE VOLTAR PARA ONBOARDING
  if (onboardingStep >= 5) {
    const onboardingRoutes = [
      '/onboarding/whatsapp',
      '/onboarding/codigo', 
      '/onboarding/endereco',
      '/conceito-comunidade',
      '/publicar-primeiro-item'
    ];
    
    if (onboardingRoutes.includes(currentPath)) {
      console.log('🚨 BLOQUEADO: Step 5+ tentando acessar onboarding', {
        step: onboardingStep,
        tentandoAcessar: currentPath
      });
      return <Navigate to={rotaDestino} replace />;
    }
  }

  // ✅ REGRA 2: PROTEÇÃO CONTRA URL MANUAL - SEMPRE VERIFICAR ROTA CORRETA
  if (currentPath !== rotaDestino && !podeAcessar) {
    console.log('🚨 BLOQUEADO: Tentativa de acesso via URL manual', {
      rotaCorreta: rotaDestino,
      rotaTentativa: currentPath,
      step: onboardingStep
    });
    return <Navigate to={rotaDestino} replace />;
  }

  // ✅ REGRA 3: VALIDAÇÃO ESPECÍFICA POR STEP
  switch (onboardingStep) {
    case 1:
      // Step 1: Só pode acessar WhatsApp
      if (currentPath !== '/onboarding/whatsapp' && currentPath !== rotaDestino) {
        console.log('🚨 BLOQUEADO: Step 1 só pode acessar WhatsApp');
        return <Navigate to="/onboarding/whatsapp" replace />;
      }
      break;
      
    case 2:
      // Step 2: Código ou WhatsApp (pode voltar)
      const allowedStep2 = ['/onboarding/codigo', '/onboarding/whatsapp'];
      if (!allowedStep2.includes(currentPath) && currentPath !== rotaDestino) {
        console.log('🚨 BLOQUEADO: Step 2 só pode acessar código ou WhatsApp');
        return <Navigate to="/onboarding/codigo" replace />;
      }
      break;
      
    case 3:
      // Step 3: Só endereço  
      if (currentPath !== '/onboarding/endereco' && currentPath !== rotaDestino) {
        console.log('🚨 BLOQUEADO: Step 3 só pode acessar endereço');
        return <Navigate to="/onboarding/endereco" replace />;
      }
      break;
      
    case 4:
      // Step 4: Ritual (conceito ou publicar)
      const allowedStep4 = ['/conceito-comunidade', '/publicar-primeiro-item'];
      if (!allowedStep4.includes(currentPath) && currentPath !== rotaDestino) {
        console.log('🚨 BLOQUEADO: Step 4 só pode acessar ritual');
        return <Navigate to={rotaDestino} replace />;
      }
      break;
      
    case 5:
      // Step 5: Acesso total ou aguardando
      const blockedForStep5 = [
        '/onboarding/whatsapp',
        '/onboarding/codigo',
        '/onboarding/endereco', 
        '/conceito-comunidade',
        '/publicar-primeiro-item'
      ];
      if (blockedForStep5.includes(currentPath)) {
        console.log('🚨 BLOQUEADO: Step 5+ não pode acessar onboarding');
        return <Navigate to={rotaDestino} replace />;
      }
      break;
  }

  // ====================================================================
  // LÓGICA DE ACESSO PRINCIPAL
  // ====================================================================

  // ✅ Admin bypass (se telefone verificado)
  if (dadosDebug.is_admin && currentPath === '/admin') {
    return <>{children}</>;
  }

  // ✅ Se tem acesso total, liberar
  if (podeAcessar) {
    return <>{children}</>;
  }

  // ✅ Se está na rota correta determinada pela function, permitir
  if (currentPath === rotaDestino) {
    return <>{children}</>;
  }

  // ✅ Qualquer outra tentativa: redirecionar
  console.log('🔄 Redirecionando para rota correta:', {
    de: currentPath,
    para: rotaDestino,
    motivo
  });
  
  return <Navigate to={rotaDestino} replace />;
};

// ====================================================================
// COMPONENTES AUXILIARES
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
    onboardingStep: dadosDebug.onboarding_step,
    debugInfo: {
      isAdmin: dadosDebug.is_admin,
      cityReleased: dadosDebug.cidade_liberada,
      itemsPublished: dadosDebug.itens_publicados,
      onboardingStep: dadosDebug.onboarding_step,
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
      <div>Step: {dadosDebug.onboarding_step}</div>
      <div>Motivo: {motivo}</div>
      <div>Admin: {dadosDebug.is_admin ? '✅' : '❌'}</div>
      <div>Cidade: {dadosDebug.cidade_liberada ? '✅' : '❌'}</div>
      <div>Itens: {dadosDebug.itens_publicados}</div>
    </div>
  );
};

export default SmartGuard;