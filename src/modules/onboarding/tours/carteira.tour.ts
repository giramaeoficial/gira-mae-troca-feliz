import { TourConfig } from '../types';

export const carteiraTour: TourConfig = {
  id: 'carteira-tour',
  name: 'Conhecendo a Carteira',
  description: 'Tour guiado pela carteira de Girinhas',
  triggerCondition: 'first-visit',
  triggerDelay: 1000,
  validRoutes: ['/carteira'],
  reward: 3,
  allowReplay: true,

  steps: [
    {
      id: 'welcome-carteira',
      title: 'Sua Carteira! 💰',
      text: 'Aqui você gerencia todas as suas Girinhas e acompanha seu saldo.',
      giraEmotion: 'waving',
      attachTo: null,
    },
    {
      id: 'bonus-diario',
      title: 'Bônus Diário 🎁',
      text: 'Todo dia você pode coletar Girinhas grátis aqui! Não esqueça de voltar diariamente.',
      giraEmotion: 'celebrating',
      attachTo: { element: '[data-tour="bonus-diario"]', on: 'bottom' },
    },
    {
      id: 'saldo',
      title: 'Seu Saldo ✨',
      text: 'Este é o total de Girinhas que você tem disponível para usar nas trocas.',
      giraEmotion: 'pointing',
      attachTo: { element: '[data-tour="saldo-display"]', on: 'bottom' },
    },
    {
      id: 'tabs',
      title: 'Navegação 📋',
      text: 'Aqui você pode ver seu histórico, validades, comprar mais Girinhas ou transferir para amigas.',
      giraEmotion: 'talking',
      attachTo: { element: '[data-tour="carteira-tabs"]', on: 'top' },
    },
    {
      id: 'finish-carteira',
      title: 'Tudo pronto! 🎉',
      text: 'Agora você sabe como usar sua carteira de Girinhas!',
      giraEmotion: 'thumbsup',
      attachTo: null,
    }
  ],

  onComplete: async (userId) => {
    console.log(`[Tour Carteira] Usuário ${userId} completou o tour`);
  },

  onCancel: async (userId, stepId) => {
    console.log(`[Tour Carteira] Usuário ${userId} cancelou no step ${stepId}`);
  },
};
