import { useDemoStore } from '@/demo/demoStore';
import type { DemoStore } from '@/demo/demoStore';

/**
 * 演示状态的统一读取入口（协议 1.2 要求暴露 useDemo()）。
 *
 * 返回整个 store：控制台、场景系统、引导这类「需要全量状态」的消费者用它；
 * 只需要一两个字段的组件请用 `useDemoStore((state) => state.xxx)` 选择器，
 * 避免无关字段变化引起重渲染。
 * 身份守卫（RequireRole）用的就是本 hook。
 */
export function useDemo(): DemoStore {
  return useDemoStore();
}
