import { beforeEach, describe, expect, it } from 'vitest';

import { HttpError } from '@/data/HttpError';
import {
  NORMAL_DELAY_RANGE,
  SLOW_DELAY_RANGE,
  mockError,
  pickMockDelay,
} from '@/data/mocks/mockControl';
import { useDemoStore } from '@/demo/demoStore';

describe('pickMockDelay（纯函数，注入随机源以便断言边界）', () => {
  it('正常档使用 200–500ms 区间', () => {
    expect(pickMockDelay('normal', () => 0, 1)).toBe(NORMAL_DELAY_RANGE.min);
    expect(pickMockDelay('normal', () => 0.999999, 1)).toBeLessThanOrEqual(NORMAL_DELAY_RANGE.max);
  });

  it('slow 档使用 3–5s 区间（协议指定）', () => {
    expect(pickMockDelay('slow', () => 0, 1)).toBe(SLOW_DELAY_RANGE.min);
    expect(pickMockDelay('slow', () => 0.999999, 1)).toBeGreaterThanOrEqual(
      SLOW_DELAY_RANGE.max - 1,
    );
  });

  it('slow 明显慢于正常档', () => {
    expect(pickMockDelay('slow', () => 0.5, 1)).toBeGreaterThan(
      pickMockDelay('normal', () => 0.5, 1),
    );
  });

  it('缩放系数用于测试环境提速，且不改变档位关系', () => {
    expect(pickMockDelay('slow', () => 0, 0.02)).toBe(Math.round(SLOW_DELAY_RANGE.min * 0.02));
    expect(pickMockDelay('normal', () => 0, 0.02)).toBeLessThan(
      pickMockDelay('slow', () => 0, 0.02),
    );
  });

  it('任何界面状态都能取到非负延迟', () => {
    for (const uiState of ['normal', 'empty', 'loading', 'error', 'slow', 'offline'] as const) {
      expect(pickMockDelay(uiState, () => 0.5, 1)).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('mockError（统一错误注入）', () => {
  beforeEach(() => {
    useDemoStore.getState().reset();
  });

  it('offline → HttpError(0)，前端据此展示断网态', () => {
    useDemoStore.getState().patch({ uiState: 'offline' });

    try {
      mockError();
      expect.unreachable('offline 状态必须抛错');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError);
      expect((error as HttpError).status).toBe(0);
      expect((error as HttpError).isOffline).toBe(true);
    }
  });

  it('error → HttpError(500) 且文案为「灵蕴紊乱」', () => {
    useDemoStore.getState().patch({ uiState: 'error' });

    try {
      mockError();
      expect.unreachable('error 状态必须抛错');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError);
      expect((error as HttpError).status).toBe(500);
      expect((error as HttpError).message).toBe('灵蕴紊乱');
      expect((error as HttpError).isServerError).toBe(true);
    }
  });

  it('normal / slow / empty / loading 不抛错（延迟由 mockDelay 负责）', () => {
    for (const uiState of ['normal', 'slow', 'empty', 'loading'] as const) {
      useDemoStore.getState().patch({ uiState });
      expect(() => {
        mockError();
      }).not.toThrow();
    }
  });
});
