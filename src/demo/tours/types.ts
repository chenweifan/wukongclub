/**
 * 引导步骤的类型与注册接口（协议 1.6）。
 * 故意把「步骤」与「文案」拆开：步骤只写选择器与路由，文案全部在 fixtures/tourCopy.ts，
 * 非技术人员改文案时不必碰这份逻辑。
 */

export const DEMO_TOUR_IDS = ['first-visit', 'console-guide'] as const;

export type DemoTourId = (typeof DEMO_TOUR_IDS)[number];

export interface TourStep {
  /** 全局唯一的文案键，与 TOUR_COPY 的键一一对应（单测会校验完整性）。 */
  id: string;
  /** 该步骤所在路由：与当前路由不一致时，引导会自动跳转过去。 */
  route: string;
  /** 目标元素的 CSS 选择器（UI 上用 data-tour 标注，避免依赖易变的类名）。 */
  selector: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export interface DemoTour {
  id: DemoTourId;
  name: string;
  description: string;
  /** 剧本的起始路由：启动时会先跳到这里。 */
  startRoute: string;
  /** 是否需要先展开演示控制台（控制台内的步骤需要它可见）。 */
  opensConsole?: boolean;
  steps: readonly TourStep[];
}

/** 引导步骤可用的选择器约定：统一用 data-tour 属性。 */
export function tourSelector(name: string): string {
  return `[data-tour="${name}"]`;
}
