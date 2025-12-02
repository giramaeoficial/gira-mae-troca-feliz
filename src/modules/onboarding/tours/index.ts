import { feedTour } from './feed.tour';
import { carteiraTour } from './carteira.tour';
import { reservasTour } from './reservas.tour';

export const tours = {
  'feed-tour': feedTour,
  'carteira-tour': carteiraTour,
  'reservas-tour': reservasTour,
};

export type TourId = keyof typeof tours;
