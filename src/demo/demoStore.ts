import { create } from 'zustand';

import { readStoredTheme } from '@/app/theme';
import { DEFAULT_DEMO_STATE } from '@/demo/types';
import type { DemoState } from '@/demo/types';

/**
 * 演示状态 store（协议 1.2：暴露 useDemo() 与 useDemoStore）。
 *
 * 为什么用 zustand 而不是 React Context：
 * mockDelay/mockError 需要在**任何时刻同步读取**当前 uiState（协议 6.3 的写法就是
 * useDemoStore.getState()），Context 做不到这一点。
 *
 * 状态源约定：DemoState 的字段以 URL 为准（DemoProvider 负责双向同步）；
 * 下面三个是纯 UI 开关，刻意**不进入** URL，也不进入快照：
 */
export interface DemoStoreUiFlags {
  /** 控制台是否展开（引导需要主动展开它）。 */
  consoleOpen: boolean;
  /** 组件边界高亮（工具）。 */
  outline: boolean;
  /** 性能面板（工具）。 */
  perfPanel: boolean;
}

export interface DemoStoreActions {
  /** 合并式更新，控制台与场景系统的主要入口。 */
  patch: (partial: Partial<DemoState>) => void;
  /** 恢复默认（不触碰 URL，URL 由 DemoProvider 随后覆写）。 */
  reset: () => void;
  setEnabled: (enabled: boolean) => void;
  setTour: (tour: string | null) => void;
  setConsoleOpen: (open: boolean) => void;
  setOutline: (outline: boolean) => void;
  setPerfPanel: (visible: boolean) => void;
}

export type DemoStore = DemoState & DemoStoreUiFlags & DemoStoreActions;

export const useDemoStore = create<DemoStore>()((set) => ({
  ...DEFAULT_DEMO_STATE,
  // 首屏主题沿用上次选择（localStorage），URL 上的 theme 参数随后覆盖它
  theme: readStoredTheme(),
  consoleOpen: false,
  outline: false,
  perfPanel: false,

  patch: (partial) => set(partial),
  reset: () => set({ ...DEFAULT_DEMO_STATE, consoleOpen: false, outline: false, perfPanel: false }),
  setEnabled: (enabled) => set({ enabled }),
  setTour: (tour) => set({ tour }),
  setConsoleOpen: (consoleOpen) => set({ consoleOpen }),
  setOutline: (outline) => set({ outline }),
  setPerfPanel: (perfPanel) => set({ perfPanel }),
}));

/** 从 store 中挑出 DemoState 部分（URL 序列化 / 快照只认这些字段）。 */
export function readDemoState(store: DemoStore): DemoState {
  return {
    enabled: store.enabled,
    role: store.role,
    uiState: store.uiState,
    theme: store.theme,
    spoiler: store.spoiler,
    seed: store.seed,
    frozenTime: store.frozenTime,
    tour: store.tour,
    clean: store.clean,
    grid: store.grid,
  };
}
