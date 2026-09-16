import { findDemoScenario } from '@/demo/scenarios/index';
import type { DemoScenario } from '@/demo/scenarios/index';
import type { DemoState } from '@/demo/types';

/**
 * 场景切换的编排（协议 1.5）：应用 patch + 可选重置种子数据 + 跳转路由 + 可选启动引导。
 *
 * 依赖通过参数注入（navigate / notify / invalidate），因为这个函数需要：
 * 路由跳转（React hook）、Toast、Query 失效 —— 把三者注入进来，函数本身保持可测。
 */
export interface ScenarioDeps {
  patch: (partial: Partial<DemoState>) => void;
  navigate: (to: string) => void;
  notify: (message: string) => void;
  /** 种子数据被重写后，让 React Query 重新拉取。 */
  invalidate: () => void;
  /** 场景不存在时的提示文案。 */
  unknownMessage: string;
  /** 应用成功的提示文案（由调用方决定措辞，避免本文件依赖 UI 文案）。 */
  appliedMessage: (scenario: DemoScenario) => string;
}

export async function applyDemoScenario(
  id: string,
  deps: ScenarioDeps,
): Promise<DemoScenario | null> {
  const scenario = findDemoScenario(id);

  if (scenario === undefined) {
    deps.notify(deps.unknownMessage);
    return null;
  }

  // 先写数据再改状态：否则页面会先切到空目标页、再被数据补上，出现闪动
  if (scenario.seedData !== undefined) {
    await scenario.seedData();
    deps.invalidate();
  }

  deps.patch({
    ...scenario.patch,
    enabled: true,
    // tour 为 null 时也会写进状态，等于「切场景时先取消正在跑的引导」
    tour: scenario.tourId ?? null,
  });

  deps.navigate(scenario.route);
  deps.notify(deps.appliedMessage(scenario));

  return scenario;
}
