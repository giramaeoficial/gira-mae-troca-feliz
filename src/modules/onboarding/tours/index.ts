import { feedTour } from './feed.tour.ts';

export const tours = {
  'feed-tour': feedTour,
};

export type TourId = keyof typeof tours;