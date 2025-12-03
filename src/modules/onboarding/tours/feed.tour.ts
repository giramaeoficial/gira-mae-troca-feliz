import type { TourConfig } from '../types';
import * as actions from '../actions';

export const feedTour: TourConfig = {
  id: 'feed-tour',
  name: 'Conhecendo o Feed',
  description: 'Tour introdutório da página principal',
  triggerCondition: 'first-visit',
  triggerDelay: 1500,
  validRoutes: ['/feed', '/'],
  reward: 5,
  allowReplay: false,

  steps: [
    {
      id: 'welcome',
      title: 'Bem-vinda ao GiraMãe! 💕',
      text: 'Eu sou a Gira, sua guia aqui! Vou te mostrar como funciona a plataforma.',
      giraEmotion: 'waving',
      attachTo: null,
    },
    {
      id: 'wallet',
      title: 'Suas Girinhas ✨',
      text: 'Aqui você vê seu saldo de Girinhas, a moeda da comunidade!',
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
      text: 'Use os filtros para encontrar exatamente o que você precisa.',
      giraEmotion: 'talking',
      attachTo: {
        element: '[data-tour="filters-panel"]',
        on: 'bottom',
      },
      beforeShow: async () => {
        await actions.expandFilters();
      },
    },
    {
      id: 'items',
      title: 'Itens Disponíveis 👕',
      text: 'Veja os itens publicados por outras mães da comunidade. Clique em "Concluir" para ganhar suas Girinhas!',
      giraEmotion: 'celebrating',
      attachTo: {
        element: '[data-tour="item-card"]',
        on: 'bottom',
      },
    },
  ],

  onComplete: async (userId) => {
    console.log('Tour Feed completed for user:', userId);
  },

  onCancel: async (userId, stepId) => {
    console.log('Tour Feed cancelled at step:', stepId);
  },
};
