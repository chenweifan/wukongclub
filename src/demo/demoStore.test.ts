import { beforeEach, describe, expect, it } from 'vitest';

import { readDemoState, useDemoStore } from '@/demo/demoStore';
import { DEFAULT_DEMO_STATE, isDemoState } from '@/demo/types';

describe('demoStore', () => {
  beforeEach(() => {
    useDemoStore.getState().reset();
  });

  it('初始状态与契约默认值一致（含 UI 开关）', () => {
    const state = useDemoStore.getState();

    expect(isDemoState(readDemoState(state))).toBe(true);
    expect(state.consoleOpen).toBe(false);
    expect(state.outline).toBe(false);
    expect(state.perfPanel).toBe(false);
  });

  it('patch 支持部分更新，不影响其他字段', () => {
    useDemoStore.getState().patch({ role: 'admin', uiState: 'offline' });

    const state = useDemoStore.getState();
    expect(state.role).toBe('admin');
    expect(state.uiState).toBe('offline');
    expect(state.theme).toBe(DEFAULT_DEMO_STATE.theme);
    expect(state.seed).toBe(DEFAULT_DEMO_STATE.seed);
  });

  it('reset 恢复默认值并关闭控制台', () => {
    useDemoStore.getState().patch({ enabled: true, role: 'admin', grid: true });
    useDemoStore.getState().setConsoleOpen(true);

    useDemoStore.getState().reset();

    const state = useDemoStore.getState();
    expect(state.enabled).toBe(false);
    expect(state.role).toBe(DEFAULT_DEMO_STATE.role);
    expect(state.grid).toBe(false);
    expect(state.consoleOpen).toBe(false);
  });

  it('readDemoState 只挑出 DemoState 字段，UI 开关不进 URL 与快照', () => {
    useDemoStore.getState().setConsoleOpen(true);
    useDemoStore.getState().setOutline(true);
    useDemoStore.getState().setPerfPanel(true);

    const demoState = readDemoState(useDemoStore.getState());

    expect(Object.keys(demoState).sort()).toEqual(Object.keys(DEFAULT_DEMO_STATE).sort());
    expect(demoState).not.toHaveProperty('consoleOpen');
  });

  it('setTour 是引导运行器的唯一入口（null 表示结束）', () => {
    useDemoStore.getState().setTour('first-visit');
    expect(useDemoStore.getState().tour).toBe('first-visit');

    useDemoStore.getState().setTour(null);
    expect(useDemoStore.getState().tour).toBeNull();
  });

  it('并发 patch：最后一次写入生效，且不会丢掉之前的字段', () => {
    for (let index = 0; index < 20; index += 1) {
      useDemoStore.getState().patch({ seed: index, spoiler: index % 2 === 0 });
    }

    const state = useDemoStore.getState();
    expect(state.seed).toBe(19);
    expect(state.spoiler).toBe(false);
  });
});
