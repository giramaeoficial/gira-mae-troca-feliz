
// Hook legacy mantido para compatibilidade
import { useNotifications } from '@/hooks/useNotifications';

export const useLocationNotifications = () => {
  const { preferences, updatePreferences, loading } = useNotifications();

  // Mapear para estrutura legacy
  const notifications = {
    ativo: preferences.sistema,
    frequencia: 'imediata',
    horario_resumo: '09:00:00',
    items_mesma_escola: preferences.reservas,
    items_mesmo_bairro: preferences.reservas,
    items_raio_km: 5,
    novas_maes_escola: false,
    novas_maes_bairro: false
  };

  const atualizarPreferencias = async (updates: any) => {
    // Mapear updates legacy para nova estrutura
    const newPrefs: any = {};
    
    if ('ativo' in updates) {
      newPrefs.sistema = updates.ativo;
    }
    if ('items_mesma_escola' in updates || 'items_mesmo_bairro' in updates) {
      newPrefs.reservas = updates.items_mesma_escola || updates.items_mesmo_bairro;
    }
    
    await updatePreferences(newPrefs);
  };

  return {
    notifications,
    loading,
    atualizarPreferencias,
    refetch: () => Promise.resolve()
  };
};
