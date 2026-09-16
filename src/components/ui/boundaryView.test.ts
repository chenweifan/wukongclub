import { describe, expect, it } from 'vitest';

import { resolveBoundaryView } from '@/components/ui/boundaryView';
import type { BoundaryViewInput } from '@/components/ui/boundaryView';
import { DEMO_UI_STATES } from '@/demo/types';

function resolve(overrides: Partial<BoundaryViewInput>): string {
  return resolveBoundaryView({
    demoUiState: 'normal',
    queryStatus: 'success',
    isEmpty: false,
    ...overrides,
  });
}

describe('resolveBoundaryView', () => {
  it('演示状态优先：error / offline / loading / empty 直接决定渲染哪个 slot', () => {
    expect(resolve({ demoUiState: 'error', queryStatus: 'success' })).toBe('error');
    expect(resolve({ demoUiState: 'offline', queryStatus: 'success' })).toBe('offline');
    expect(resolve({ demoUiState: 'loading', queryStatus: 'success' })).toBe('loading');
    expect(resolve({ demoUiState: 'empty', queryStatus: 'success' })).toBe('empty');
  });

  it('演示状态优先于真实成功结果（这是「覆盖」语义的关键）', () => {
    expect(resolve({ demoUiState: 'error', queryStatus: 'success', isEmpty: false })).toBe('error');
    expect(resolve({ demoUiState: 'empty', queryStatus: 'success', isEmpty: false })).toBe('empty');
  });

  it('normal 回落到真实查询状态：pending → loading，error → error', () => {
    expect(resolve({ demoUiState: 'normal', queryStatus: 'pending' })).toBe('loading');
    expect(resolve({ demoUiState: 'normal', queryStatus: 'error' })).toBe('error');
  });

  it('normal + success：按 isEmpty 区分空态与就绪', () => {
    expect(resolve({ queryStatus: 'success', isEmpty: true })).toBe('empty');
    expect(resolve({ queryStatus: 'success', isEmpty: false })).toBe('ready');
  });

  it('slow 与 normal 走同一套回落逻辑（延迟由 mockDelay 注入，而不是 UI 假装转圈）', () => {
    const cases: readonly (readonly [BoundaryViewInput['queryStatus'], boolean, string])[] = [
      ['pending', false, 'loading'],
      ['error', false, 'error'],
      ['success', true, 'empty'],
      ['success', false, 'ready'],
    ];

    for (const [queryStatus, isEmpty, expected] of cases) {
      expect(resolve({ demoUiState: 'slow', queryStatus, isEmpty })).toBe(expected);
      expect(resolve({ demoUiState: 'normal', queryStatus, isEmpty })).toBe(expected);
    }
  });

  it('覆盖全部 6 × 3 组合都不抛错，且结果始终是合法视图', () => {
    const valid = new Set(['loading', 'error', 'offline', 'empty', 'ready']);

    for (const demoUiState of DEMO_UI_STATES) {
      for (const queryStatus of ['pending', 'error', 'success'] as const) {
        for (const isEmpty of [true, false]) {
          expect(valid.has(resolve({ demoUiState, queryStatus, isEmpty }))).toBe(true);
        }
      }
    }
  });
});
