import { TourConfig } from '../types';

export const reservasTour: TourConfig = {
  id: 'reservas-tour',
  name: 'Conhecendo as Reservas',
  description: 'Tour guiado pela página de reservas',
  triggerCondition: 'first-visit',
  triggerDelay: 1000,
  validRoutes: ['/reservas'],
  reward: 3,
  allowReplay: true,

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
      title: 'Tudo certo! ✅',
      text: 'Agora você sabe como gerenciar suas trocas! Lembre-se de confirmar a entrega após receber o item.',
      giraEmotion: 'celebrating',
      attachTo: null,
    }
  ],

  onComplete: async (userId) => {
    console.log(`[Tour Reservas] Usuário ${userId} completou o tour`);
  },

  onCancel: async (userId, stepId) => {
    console.log(`[Tour Reservas] Usuário ${userId} cancelou no step ${stepId}`);
  },
};
