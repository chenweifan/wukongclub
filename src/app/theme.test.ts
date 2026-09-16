import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DEFAULT_THEME,
  THEMES,
  THEME_STORAGE_KEY,
  applyThemeAttribute,
  isTheme,
  readStoredTheme,
  writeStoredTheme,
} from '@/app/theme';

describe('isTheme', () => {
  it('接受三套合法主题', () => {
    for (const theme of THEMES) {
      expect(isTheme(theme)).toBe(true);
    }
  });

  it('拒绝非法值（边界：空字符串 / 大小写不同 / 数字 / null / 对象）', () => {
    expect(isTheme('')).toBe(false);
    expect(isTheme('INK')).toBe(false);
    expect(isTheme('dark')).toBe(false);
    expect(isTheme(0)).toBe(false);
    expect(isTheme(null)).toBe(false);
    expect(isTheme(undefined)).toBe(false);
    expect(isTheme({ theme: 'ink' })).toBe(false);
    expect(isTheme(['ink'])).toBe(false);
  });

  it('拒绝超长字符串而不抛错', () => {
    expect(isTheme('ink'.repeat(1000))).toBe(false);
  });
});

describe('主题持久化', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('未持久化时返回默认主题', () => {
    expect(readStoredTheme()).toBe(DEFAULT_THEME);
  });

  it('写入后可读回（键名带 hmw: 前缀）', () => {
    writeStoredTheme('paper');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('paper');
    expect(readStoredTheme()).toBe('paper');
  });

  it('存储值非法时回落到默认主题', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'ultra-neon');
    expect(readStoredTheme()).toBe(DEFAULT_THEME);
  });

  it('localStorage 抛错时不崩溃（隐私模式 / 配额超限）', () => {
    vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(readStoredTheme()).toBe(DEFAULT_THEME);

    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => writeStoredTheme('contrast')).not.toThrow();
  });
});

describe('applyThemeAttribute', () => {
  it('在指定节点上写入 data-theme', () => {
    const root = document.createElement('div');
    applyThemeAttribute('contrast', root);
    expect(root.getAttribute('data-theme')).toBe('contrast');
  });

  it('重复应用同一主题是幂等的', () => {
    const root = document.createElement('div');
    applyThemeAttribute('paper', root);
    applyThemeAttribute('paper', root);
    expect(root.getAttribute('data-theme')).toBe('paper');
  });
});
