import type { TourConfig } from '../types';
import * as actions from '../actions';

export const feedTour: TourConfig = {
  // ─────────────────────────────────────────────────
  // METADADOS
  // ─────────────────────────────────────────────────
  id: 'feed-tour',
  name: 'Conhecendo o Feed',
  description: 'Tour introdutório da página principal',
  
  // ─────────────────────────────────────────────────
  // GATILHO
  // ─────────────────────────────────────────────────
  triggerCondition: 'first-visit',  // Quando disparar
  triggerDelay: 1500,               // Delay em ms
  validRoutes: ['/feed', '/'],      // Rotas válidas
  
  // ─────────────────────────────────────────────────
  // RECOMPENSA
  // ─────────────────────────────────────────────────
  reward: 5,            // Girinhas ao completar
  allowReplay: true,    // Pode repetir
  
  // ─────────────────────────────────────────────────
  // PASSOS
  // ─────────────────────────────────────────────────
  steps: [
    {
      id: 'welcome',
      title: 'Bem-vinda ao GiraMãe! 💕',
      text: 'Eu sou a Gira, sua guia aqui!',
      giraEmotion: 'waving',
      attachTo: null,  // null = modal centralizado
    },
    {
      id: 'wallet',
      title: 'Suas Girinhas ✨',
      text: 'Aqui você vê seu saldo...',
      giraEmotion: 'pointing',
      attachTo: {
        element: '[data-tour="wallet-button"]',
        on: 'bottom',
      },
      highlightClass: 'gira-highlight-pulse',
    },
    {
      id: 'filters',
      title: 'Filtros 🔍',
      text: 'Encontre o que precisa...',
      giraEmotion: 'talking',
      attachTo: {
        element: '[data-tour="filters-panel"]',
        on: 'right',
      },
      beforeShow: async () => {
        await actions.expandFilters();
      },
    },
    {
      id: 'items',
      title: 'Itens',
      text: 'Veja os itens disponíveis para troca ou venda.',
      giraEmotion: 'pointing',
      attachTo: {
        element: '[data-tour="item-card"]',
        on: 'bottom',
      },
    },
    {
      id: 'finish',
      title: 'Tudo pronto!',
      text: 'Agora você já sabe como navegar. Divirta-se!',
      giraEmotion: 'celebrating',
      attachTo: null,
    }
  ],
  
  // ─────────────────────────────────────────────────
  // CALLBACKS
  // ─────────────────────────────────────────────────
  onComplete: async (userId) => {
    console.log('Tour completed for user:', userId);
    // Registra no Supabase, dá recompensa
  },
  onCancel: async (userId, stepId) => {
    console.log('Tour cancelled at step:', stepId);
    // Tracking de abandono
  },
};