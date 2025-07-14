import React from 'react';
import { useRotaUsuario } from '@/hooks/useRotaUsuario';
import { SmartGuardDebugInfo } from './SmartGuard';

// ====================================================================
// COMPONENTE DE DEBUG PARA DESENVOLVIMENTO
// ====================================================================

const SmartGuardDebugWrapper: React.FC = () => {
  return <SmartGuardDebugInfo />;
};

export default SmartGuardDebugWrapper;