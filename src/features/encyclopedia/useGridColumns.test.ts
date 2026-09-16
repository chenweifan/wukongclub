import { describe, expect, it } from 'vitest';

import {
  FALLBACK_COLUMNS,
  GRID_COLUMN_BREAKPOINTS,
  chunkIntoRows,
} from '@/features/encyclopedia/useGridColumns';

describe('chunkIntoRows（虚拟滚动的行切分）', () => {
  it('按列数切行', () => {
    expect(chunkIntoRows([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(chunkIntoRows([1, 2, 3], 3)).toEqual([[1, 2, 3]]);
  });

  it('最后一行为残行也能正常返回', () => {
    expect(chunkIntoRows([1, 2, 3, 4, 5, 6, 7], 3)).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
  });

  it('空数组返回空行列表（边界）', () => {
    expect(chunkIntoRows([], 3)).toEqual([]);
  });

  it('列数非法时按 1 列处理，不会死循环或丢数据', () => {
    expect(chunkIntoRows([1, 2, 3], 0)).toEqual([[1], [2], [3]]);
    expect(chunkIntoRows([1, 2, 3], -2)).toEqual([[1], [2], [3]]);
    expect(chunkIntoRows([1, 2, 3], 2.7)).toEqual([[1, 2], [3]]);
  });

  it('行内元素顺序与输入一致，且元素总数不变', () => {
    const items = Array.from({ length: 25 }, (_, index) => index);
    const rows = chunkIntoRows(items, 4);

    expect(rows.flat()).toEqual(items);
    expect(rows).toHaveLength(7);
  });

  it('断点表按由宽到窄排列（列数递减），保证 readColumns 首次命中即最优', () => {
    for (let index = 1; index < GRID_COLUMN_BREAKPOINTS.length; index += 1) {
      const previous = GRID_COLUMN_BREAKPOINTS[index - 1];
      const current = GRID_COLUMN_BREAKPOINTS[index];
      expect(previous?.minWidth ?? 0).toBeGreaterThan(current?.minWidth ?? 0);
      expect(previous?.columns ?? 0).toBeGreaterThan(current?.columns ?? 0);
    }
  });

  it('jsdom 没有 matchMedia：回退列数是合法值', () => {
    expect(typeof window.matchMedia).toBe('undefined');
    expect(FALLBACK_COLUMNS).toBeGreaterThanOrEqual(1);
  });
});
