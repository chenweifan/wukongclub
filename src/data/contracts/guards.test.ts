import { describe, expect, it } from 'vitest';

import { DEFAULT_PAGE_SIZE, isPaginatedOf, isRecord, toPaginated } from '@/data/contracts/common';
import { isDemoProbe, isPaginatedProbes, isProbeCategory } from '@/data/contracts/demoProbe';
import type { DemoProbe } from '@/data/contracts/demoProbe';

const validProbe: DemoProbe = {
  id: 'probe-1-000',
  label: '灵蕴·7号探针',
  category: 'alpha',
  score: 42,
  collected: false,
  createdAt: '2026-01-01T08:00:00.000Z',
};

describe('isRecord / isPaginatedOf', () => {
  it('isRecord 排除数组与 null', () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord([])).toBe(false);
    expect(isRecord(null)).toBe(false);
    expect(isRecord('x')).toBe(false);
  });

  it('分页守卫校验字段与元素类型', () => {
    const isNumber = (value: unknown): value is number => typeof value === 'number';

    expect(isPaginatedOf({ items: [1, 2], total: 2, page: 1, pageSize: 20 }, isNumber)).toBe(true);
    expect(isPaginatedOf({ items: [1, 'x'], total: 2, page: 1, pageSize: 20 }, isNumber)).toBe(
      false,
    );
    expect(isPaginatedOf({ items: [], total: '2', page: 1, pageSize: 20 }, isNumber)).toBe(false);
    expect(isPaginatedOf(null, isNumber)).toBe(false);
    expect(isPaginatedOf({ items: [] }, isNumber)).toBe(false);
  });

  it('toPaginated 按页切片并保留总数', () => {
    const items = Array.from({ length: 25 }, (_, index) => index);
    const first = toPaginated(items, 1, 10);
    const third = toPaginated(items, 3, 10);

    expect(first.items).toHaveLength(10);
    expect(first.total).toBe(25);
    expect(third.items).toEqual([20, 21, 22, 23, 24]);
    expect(toPaginated([], 1).pageSize).toBe(DEFAULT_PAGE_SIZE);
  });
});

describe('演示探针契约守卫', () => {
  it('接受完整记录', () => {
    expect(isDemoProbe(validProbe)).toBe(true);
  });

  it('拒绝缺字段 / 错类型 / 非法分类', () => {
    expect(isDemoProbe({ ...validProbe, category: 'delta' })).toBe(false);
    expect(isDemoProbe({ ...validProbe, score: '42' })).toBe(false);
    expect(isDemoProbe({ ...validProbe, collected: 'no' })).toBe(false);
    expect(isDemoProbe({ ...validProbe, id: undefined })).toBe(false);
    expect(isDemoProbe(null)).toBe(false);
    expect(isDemoProbe([validProbe])).toBe(false);
  });

  it('isProbeCategory 只认三种分类', () => {
    expect(isProbeCategory('alpha')).toBe(true);
    expect(isProbeCategory('Alpha')).toBe(false);
    expect(isProbeCategory(1)).toBe(false);
  });

  it('分页守卫校验内层元素', () => {
    const page = { items: [validProbe], total: 1, page: 1, pageSize: 1 };
    expect(isPaginatedProbes(page)).toBe(true);
    expect(isPaginatedProbes({ ...page, items: [{ id: 'x' }] })).toBe(false);
  });
});
