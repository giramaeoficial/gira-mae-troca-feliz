// ================================================================
// 1. AuthGuard.tsx - GUARD BASE (só verifica login)
// ================================================================

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/loading/LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="text-4xl font-bold text-primary mb-4">GiraMãe</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Acesso Necessário</h2>
          <p className="text-gray-600 mb-6">Você precisa fazer login para acessar esta área.</p>
          <button
            onClick={() => window.location.href = '/auth'}
            className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
