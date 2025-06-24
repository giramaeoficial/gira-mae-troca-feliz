
import { useNotifications } from '@/hooks/useNotifications';

// Hook simplificado que redireciona para o hook principal de notificações
export const useLocationNotifications = () => {
  const { preferences, updatePreferences, loading } = useNotifications();
  
  // Mapeamento para compatibilidade com código legado
  const notifications = {
    items_mesma_escola: false,
    items_mesmo_bairro: false,
    items_raio_km: 5,
    novas_maes_escola: false,
    novas_maes_bairro: false,
    frequencia: 'imediata',
    horario_resumo: '09:00'
  };

  const atualizarPreferencias = (updates: any) => {
    // Converter atualizações de localização para formato de notificações básicas
    updatePreferences(updates);
  };

  return {
    notifications,
    loading,
    atualizarPreferencias
  };
};
