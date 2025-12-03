import { TourConfig } from '../types';

export const reservasTour: TourConfig = {
  id: 'reservas-tour',
  name: 'Conhecendo as Reservas',
  description: 'Tour guiado pela página de reservas',
  triggerCondition: 'first-visit',
  triggerDelay: 1000,
  validRoutes: ['/minhas-reservas'],
  reward: 3,
  allowReplay: false,

  steps: [
    {
      id: 'welcome-reservas',
      title: 'Suas Reservas! 📦',
      text: 'Aqui você gerencia todas as suas trocas: itens que você reservou e itens que outras mães reservaram de você.',
      giraEmotion: 'waving',
      attachTo: null,
    },
    {
      id: 'busca-codigo',
      title: 'Busca por Código 🔍',
      text: 'Encontre rapidamente uma reserva pelo código único do item (GRM-XXXXX).',
      giraEmotion: 'pointing',
      attachTo: { element: '[data-tour="busca-codigo"]', on: 'bottom' },
    },
    {
      id: 'estatisticas',
      title: 'Estatísticas 📊',
      text: 'Veja quantas reservas ativas, filas de espera e vendas você tem. Clique para filtrar!',
      giraEmotion: 'talking',
      attachTo: { element: '[data-tour="reservas-stats"]', on: 'bottom' },
    },
    {
      id: 'finish-reservas',
      title: 'Jornada Concluída! 🎉',
      text: 'Parabéns! Você ganhou Girinhas por completar este tour. Confira seu saldo!',
      giraEmotion: 'celebrating',
      attachTo: { 
        element: '[data-tour="wallet-button"]', 
        on: 'bottom' 
      },
      highlightClass: 'gira-highlight-pulse',
    }
  ],

  onComplete: async (userId) => {
    console.log(`[Tour Reservas] Usuário ${userId} completou o tour`);
  },

  onCancel: async (userId, stepId) => {
    console.log(`[Tour Reservas] Usuário ${userId} cancelou no step ${stepId}`);
  },
};
