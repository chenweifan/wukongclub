import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 全局 UI 偏好（纯客户端状态）。
 * 与服务端状态严格分家：Query 缓存负责「数据」，本 store 只负责「界面偏好」。
 *
 * 阶段 1 的收敛：剧透开关已经迁到 DemoState.spoiler（唯一状态源，且会写进 URL），
 * 这里只剩侧栏折叠 —— 它属于「与演示无关的个人偏好」，因此不进 URL、不进快照。
 */
export interface UiState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

/** 命名空间前缀 `hmw:`（协议第六节）。 */
export const UI_STORAGE_KEY = 'hmw:ui';

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: UI_STORAGE_KEY,
      version: 2,
    },
  ),
);
