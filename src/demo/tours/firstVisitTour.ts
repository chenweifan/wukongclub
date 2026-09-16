import { TOUR_SUMMARY } from '@/demo/fixtures/tourCopy';
import { tourSelector } from '@/demo/tours/types';
import type { DemoTour } from '@/demo/tours/types';

/**
 * 首次到访引导：覆盖站点骨架，并刻意包含两次跨页跳转（/ → /wiki → /），
 * 用来验证「步骤绑定路由、跨页自动跳转」这条协议要求。
 *
 * ⚠️ 跨页步骤的目标必须是**该页面长期存在的锚点**：
 * 这里用的是影神图列表区（空态/错误态下也在），而不是当年那个占位页锚点 ——
 * 占位页被真实页面取代后，旧锚点会让这一步「跳过去但高亮不到东西」。
 */
export const firstVisitTour: DemoTour = {
  id: 'first-visit',
  name: TOUR_SUMMARY['first-visit'].name,
  description: TOUR_SUMMARY['first-visit'].description,
  startRoute: '/',
  steps: [
    { id: 'fv-brand', route: '/', selector: tourSelector('brand'), side: 'bottom' },
    { id: 'fv-sidebar', route: '/', selector: tourSelector('sidebar'), side: 'right' },
    { id: 'fv-theme', route: '/', selector: tourSelector('theme-switcher'), side: 'bottom' },
    { id: 'fv-spoiler', route: '/', selector: tourSelector('spoiler-toggle'), side: 'bottom' },
    { id: 'fv-gourd', route: '/', selector: tourSelector('gourd'), side: 'left' },
    { id: 'fv-modules', route: '/', selector: tourSelector('home-modules'), side: 'top' },
    { id: 'fv-wiki', route: '/wiki', selector: tourSelector('wiki-wall'), side: 'bottom' },
    { id: 'fv-tokens', route: '/', selector: tourSelector('home-tokens'), side: 'top' },
  ],
};
