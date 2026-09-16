import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 全局 UI 偏好（纯客户端状态）。
 * 与服务端状态严格分家：Query 缓存负责「数据」，本 store 只负责「界面偏好」。
 */
export interface UiState {
  sidebarCollapsed: boolean;
  /**
   * ⚠️ 剧透开关占位：阶段 1 起，剧透的唯一起源是 DemoState.spoiler，
   * 该字段将退化为只读镜像或被移除（避免双真相来源）。
   */
  spoilerVisible: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSpoiler: () => void;
}

/** 命名空间前缀 `hmw:`（协议第六节）。 */
export const UI_STORAGE_KEY = 'hmw:ui';

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      spoilerVisible: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSpoiler: () => set((state) => ({ spoilerVisible: !state.spoilerVisible })),
    }),
    {
      name: UI_STORAGE_KEY,
      version: 1,
    },
  ),
);
