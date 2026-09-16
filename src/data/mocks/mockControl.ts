import { HttpResponse } from 'msw';

import { HttpError } from '@/data/HttpError';
import { useDemoStore } from '@/demo/demoStore';
import type { DemoUiState } from '@/demo/types';

/**
 * 统一 Mock 延迟与错误注入（协议 1.3 / 6.3）。
 *
 * ⚠️ 已知的架构例外：本文件（且只有 src/data/mocks/**）允许读取 demoStore。
 * 协议 6.3 给出的写法就是 useDemoStore.getState()，因为「断网/灵蕴紊乱」必须由
 * 演示状态在**请求发生的那一刻**决定，无法通过参数层层传递。
 *
 * 与协议伪代码的唯一差异：协议把错误注入写在 mockDelay() 里，
 * 这里拆成 mockDelay()（只管延迟）+ mockError()（只管错误），handler 先调 mockError()
 * 快速失败、再 await mockDelay()。语义完全一致，但调用点更清楚：
 * 每个 handler 都必须同时出现这两行，评审一眼可查。
 */

/** slow 档延迟区间（协议指定 3–5s）。 */
export const SLOW_DELAY_RANGE = { min: 3000, max: 5000 } as const;

/** 正常档延迟区间：保留随机抖动，让加载态可见又不像卡死。 */
export const NORMAL_DELAY_RANGE = { min: 200, max: 500 } as const;

/**
 * 测试环境把延迟压缩到 2%：单测里每次请求都等 200–500ms 会让整套用例慢得没法跑，
 * 而 slow 档仍保留可观测的差异（60–100ms），足以断言行为。
 */
const TEST_DELAY_SCALE = import.meta.env.MODE === 'test' ? 0.02 : 1;

export function delayRangeFor(uiState: DemoUiState): { min: number; max: number } {
  return uiState === 'slow' ? SLOW_DELAY_RANGE : NORMAL_DELAY_RANGE;
}

/**
 * 纯函数：按界面状态挑一个延迟毫秒数。
 * random 可注入，因此可以在单测里断言边界而不受随机性影响。
 */
export function pickMockDelay(
  uiState: DemoUiState,
  random: () => number = Math.random,
  scale: number = TEST_DELAY_SCALE,
): number {
  const { min, max } = delayRangeFor(uiState);
  const scaledMin = Math.round(min * scale);
  const scaledMax = Math.round(max * scale);
  return scaledMin + Math.round(random() * (scaledMax - scaledMin));
}

/** 错误注入：断网 → status 0；灵蕴紊乱 → status 500。其余状态不抛错。 */
export function mockError(): void {
  const { uiState } = useDemoStore.getState();

  if (uiState === 'offline') {
    throw new HttpError(0, '网络已断开', { code: 'DEMO_OFFLINE' });
  }

  if (uiState === 'error') {
    throw new HttpError(500, '灵蕴紊乱', { code: 'DEMO_ERROR' });
  }
}

/** 延迟注入：按当前演示状态返回真实等待。 */
export async function mockDelay(uiState?: DemoUiState): Promise<number> {
  const target = uiState ?? useDemoStore.getState().uiState;
  const delayMs = pickMockDelay(target);

  await new Promise<void>((resolve) => {
    setTimeout(resolve, delayMs);
  });

  return delayMs;
}

/**
 * 把 mockError/mockDelay 抛出的 HttpError 翻译成合法的 MSW 响应。
 * status 0 用 HttpResponse.error()：让前端拿到真正的网络失败，
 * 而不是一个「状态码为 0 的响应」——后者在浏览器里并不存在。
 */
export function toMockResponse(error: unknown): Response {
  if (error instanceof HttpError) {
    if (error.status === 0) {
      return HttpResponse.error();
    }

    return HttpResponse.json(
      { message: error.message, ...(error.code === null ? {} : { code: error.code }) },
      { status: error.status },
    );
  }

  return HttpResponse.json({ message: '灵蕴紊乱' }, { status: 500 });
}
