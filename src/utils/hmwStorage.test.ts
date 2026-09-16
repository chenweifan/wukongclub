import { beforeEach, describe, expect, it } from 'vitest';

import {
  HMW_STORAGE_PREFIX,
  clearHmwEntries,
  collectHmwEntries,
  hasHmwPrefix,
  restoreHmwEntries,
} from '@/utils/hmwStorage';

describe('hmwStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('前缀判定只认 hmw:', () => {
    expect(HMW_STORAGE_PREFIX).toBe('hmw:');
    expect(hasHmwPrefix('hmw:theme')).toBe(true);
    expect(hasHmwPrefix('hmw')).toBe(false);
    expect(hasHmwPrefix('other:theme')).toBe(false);
    expect(hasHmwPrefix('')).toBe(false);
  });

  it('只收集 hmw: 前缀的键，忽略其他站点数据', () => {
    window.localStorage.setItem('hmw:theme', 'paper');
    window.localStorage.setItem('hmw:ui', '{}');
    window.localStorage.setItem('unrelated', '敏感内容');

    expect(collectHmwEntries(window.localStorage)).toEqual({
      'hmw:theme': 'paper',
      'hmw:ui': '{}',
    });
  });

  it('空存储时返回空对象（边界）', () => {
    expect(collectHmwEntries(window.localStorage)).toEqual({});
  });

  it('清理返回被删键数量，且不动其他键', () => {
    window.localStorage.setItem('hmw:theme', 'ink');
    window.localStorage.setItem('hmw:ui', '{}');
    window.localStorage.setItem('keep', '1');

    const cleared = clearHmwEntries(window.localStorage);

    expect(cleared).toBe(2);
    expect(window.localStorage.getItem('hmw:theme')).toBeNull();
    expect(window.localStorage.getItem('keep')).toBe('1');
  });

  it('还原时拒绝非 hmw: 键（快照可能被手改过）', () => {
    const restored = restoreHmwEntries(window.localStorage, {
      'hmw:theme': 'contrast',
      'evil-key': 'x',
    });

    expect(restored).toBe(1);
    expect(window.localStorage.getItem('hmw:theme')).toBe('contrast');
    expect(window.localStorage.getItem('evil-key')).toBeNull();
  });

  it('还原空对象是安全的空操作', () => {
    expect(restoreHmwEntries(window.localStorage, {})).toBe(0);
    expect(window.localStorage.length).toBe(0);
  });

  it('超长值可以往返（快照里可能存着大 JSON）', () => {
    const big = 'x'.repeat(50_000);
    restoreHmwEntries(window.localStorage, { 'hmw:big': big });

    expect(collectHmwEntries(window.localStorage)['hmw:big']).toHaveLength(50_000);
  });
});
