import { TOUR_SUMMARY } from '@/demo/fixtures/tourCopy';
import { tourSelector } from '@/demo/tours/types';
import type { DemoTour } from '@/demo/tours/types';

/**
 * 控制台导览：讲解控制台六个分区。
 * opensConsole = true 让引导启动时自动展开控制台，否则高亮目标根本不在 DOM 里。
 */
export const consoleGuideTour: DemoTour = {
  id: 'console-guide',
  name: TOUR_SUMMARY['console-guide'].name,
  description: TOUR_SUMMARY['console-guide'].description,
  startRoute: '/',
  opensConsole: true,
  steps: [
    { id: 'cg-gourd', route: '/', selector: tourSelector('gourd'), side: 'left' },
    { id: 'cg-identity', route: '/', selector: tourSelector('console-identity'), side: 'left' },
    { id: 'cg-uistate', route: '/', selector: tourSelector('console-uistate'), side: 'left' },
    { id: 'cg-scenario', route: '/', selector: tourSelector('console-scenario'), side: 'left' },
    { id: 'cg-data', route: '/', selector: tourSelector('console-data'), side: 'left' },
    { id: 'cg-tools', route: '/', selector: tourSelector('console-tools'), side: 'left' },
  ],
};
