import { consoleGuideTour } from '@/demo/tours/consoleGuideTour';
import { firstVisitTour } from '@/demo/tours/firstVisitTour';
import { DEMO_TOUR_IDS } from '@/demo/tours/types';
import type { DemoTour, DemoTourId } from '@/demo/tours/types';

export const DEMO_TOURS: readonly DemoTour[] = [firstVisitTour, consoleGuideTour];

export function findDemoTour(id: string): DemoTour | undefined {
  return DEMO_TOURS.find((tour) => tour.id === id);
}

/** 类型守卫：URL 上的 tour 参数是 unknown，用它收敛。 */
export function isDemoTourId(value: unknown): value is DemoTourId {
  return typeof value === 'string' && (DEMO_TOUR_IDS as readonly string[]).includes(value);
}

export { DEMO_TOUR_IDS, firstVisitTour, consoleGuideTour };
export type { DemoTour, DemoTourId };
