import { beforeEach, describe, expect, it } from 'vitest';

import { UI_STORAGE_KEY, useUiStore } from '@/stores/uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useUiStore.setState({ sidebarCollapsed: false, spoilerVisible: false });
  });

  it('默认状态：侧栏展开、剧透隐藏', () => {
    const state = useUiStore.getState();
    expect(state.sidebarCollapsed).toBe(false);
    expect(state.spoilerVisible).toBe(false);
  });

  it('toggleSidebar 在两次调用间来回切换', () => {
    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().sidebarCollapsed).toBe(true);

    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().sidebarCollapsed).toBe(false);
  });

  it('setSidebarCollapsed 支持显式赋值（幂等）', () => {
    useUiStore.getState().setSidebarCollapsed(true);
    useUiStore.getState().setSidebarCollapsed(true);
    expect(useUiStore.getState().sidebarCollapsed).toBe(true);
  });

  it('toggleSpoiler 切换剧透占位开关', () => {
    useUiStore.getState().toggleSpoiler();
    expect(useUiStore.getState().spoilerVisible).toBe(true);
  });

  it('写操作持久化到 localStorage，且键名带 hmw: 前缀', () => {
    useUiStore.getState().setSidebarCollapsed(true);

    const raw = window.localStorage.getItem(UI_STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(raw).toContain('"sidebarCollapsed":true');
  });

  it('并发写：连续多次切换后最终持久化值与内存状态一致（无竞态丢失）', () => {
    const { toggleSidebar } = useUiStore.getState();
    for (let index = 0; index < 51; index += 1) {
      toggleSidebar();
    }

    const expected = useUiStore.getState().sidebarCollapsed;
    expect(expected).toBe(true);
    expect(window.localStorage.getItem(UI_STORAGE_KEY)).toContain(
      `"sidebarCollapsed":${String(expected)}`,
    );
  });
});
