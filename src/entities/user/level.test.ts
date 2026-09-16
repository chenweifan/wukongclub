import { describe, expect, it } from 'vitest';

import { resolveUserLevel } from '@/entities/user/level';
import { CULTIVATION_RANKS } from '@/data/contracts/user';

describe('resolveUserLevel', () => {
  it('0 修为是第 1 境凡体', () => {
    const level = resolveUserLevel(0);
    expect(level.level).toBe(1);
    expect(level.rank.id).toBe('mortal');
    expect(level.progress).toBe(0);
  });

  it('恰好达到门槛时进入下一境界（边界值）', () => {
    for (const [index, rank] of CULTIVATION_RANKS.entries()) {
      const level = resolveUserLevel(rank.minExp);
      expect(level.rank.id).toBe(rank.id);
      expect(level.level).toBe(index + 1);
    }
  });

  it('差一点不给下一境界', () => {
    expect(resolveUserLevel(119).rank.id).toBe('mortal');
    expect(resolveUserLevel(120).rank.id).toBe('gatekeeper');
    expect(resolveUserLevel(479).rank.id).toBe('gatekeeper');
    expect(resolveUserLevel(480).rank.id).toBe('walker');
  });

  it('境界内进度按区间计算', () => {
    // 凡体 0 → 山门客 120，取中点应为 0.5
    expect(resolveUserLevel(60).progress).toBeCloseTo(0.5, 5);
  });

  it('最高境界：expToNext 为 null 且进度为 1', () => {
    const level = resolveUserLevel(999_999);
    expect(level.rank.id).toBe('equalHeaven');
    expect(level.expToNext).toBeNull();
    expect(level.progress).toBe(1);
  });

  it('边界：负数、小数、NaN、Infinity 都落到凡体且不抛错', () => {
    for (const exp of [-100, -0.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      const level = resolveUserLevel(exp);
      expect(level.rank.id).toBe('mortal');
      expect(level.progress).toBeGreaterThanOrEqual(0);
    }
  });

  it('小数修为向下取整（避免显示时不稳）', () => {
    expect(resolveUserLevel(119.9).rank.id).toBe('mortal');
  });
});
