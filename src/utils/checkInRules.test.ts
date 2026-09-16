import { describe, expect, it } from 'vitest';

import {
  CHECK_IN_BASE_REWARD,
  CHECK_IN_MAX_REWARD,
  addDays,
  buildCalendar,
  buildDateRange,
  calcCheckInReward,
  computeStreak,
  fromDateKey,
  resolveDailyPeriodKey,
  resolvePeriodKey,
  resolveWeeklyPeriodKey,
  toDateKey,
} from '@/utils/checkInRules';

const TODAY = new Date(2026, 1, 14, 9, 0, 0); // 2026-02-14 本地时间

function daysAgo(count: number): string {
  return toDateKey(addDays(TODAY, -count));
}

describe('日期键', () => {
  it('toDateKey 使用本地时区并补零', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toDateKey(TODAY)).toBe('2026-02-14');
  });

  it('fromDateKey 与 toDateKey 可往返', () => {
    for (const key of ['2026-01-01', '2026-02-28', '2024-02-29', '2026-12-31']) {
      expect(toDateKey(fromDateKey(key))).toBe(key);
    }
  });

  it('addDays 能跨月跨年', () => {
    expect(toDateKey(addDays(new Date(2026, 0, 31), 1))).toBe('2026-02-01');
    expect(toDateKey(addDays(new Date(2026, 11, 31), 1))).toBe('2027-01-01');
    expect(toDateKey(addDays(new Date(2026, 0, 1), -1))).toBe('2025-12-31');
  });

  it('buildDateRange 从旧到新，含今天', () => {
    const range = buildDateRange(TODAY, 3);
    expect(range).toEqual(['2026-02-12', '2026-02-13', '2026-02-14']);
  });

  it('buildDateRange 边界：0 天与负数至少给一天', () => {
    expect(buildDateRange(TODAY, 0)).toEqual(['2026-02-14']);
    expect(buildDateRange(TODAY, -5)).toEqual(['2026-02-14']);
  });
});

describe('computeStreak', () => {
  it('空记录为 0（边界：空数组）', () => {
    expect(computeStreak([], TODAY)).toBe(0);
  });

  it('只有今天 → 1', () => {
    expect(computeStreak([{ date: daysAgo(0) }], TODAY)).toBe(1);
  });

  it('今天 + 昨天 → 2', () => {
    expect(computeStreak([{ date: daysAgo(0) }, { date: daysAgo(1) }], TODAY)).toBe(2);
  });

  it('今天还没签但昨天签了 → 从昨天数（补签即可续上，不算断）', () => {
    expect(computeStreak([{ date: daysAgo(1) }, { date: daysAgo(2) }], TODAY)).toBe(2);
  });

  it('断签后归零：只数到断点为止', () => {
    // 今天、昨天连续；前天缺失；更早还有记录但不计入
    const records = [
      { date: daysAgo(0) },
      { date: daysAgo(1) },
      { date: daysAgo(3) },
      { date: daysAgo(4) },
    ];
    expect(computeStreak(records, TODAY)).toBe(2);
  });

  it('连续 40 天全部计入（长历史的边界）', () => {
    const records = Array.from({ length: 40 }, (_, index) => ({ date: daysAgo(index) }));
    expect(computeStreak(records, TODAY)).toBe(40);
  });

  it('重复日期不影响计数（集合语义）', () => {
    const records = [{ date: daysAgo(0) }, { date: daysAgo(0) }, { date: daysAgo(1) }];
    expect(computeStreak(records, TODAY)).toBe(2);
  });
});

describe('buildCalendar', () => {
  it('默认 30 格，最后一格是今天', () => {
    const cells = buildCalendar([], TODAY);
    expect(cells).toHaveLength(30);
    expect(cells.at(-1)?.date).toBe('2026-02-14');
    expect(cells.at(-1)?.isToday).toBe(true);
    expect(cells[0]?.date).toBe('2026-01-16');
  });

  it('标记已签到与未签到', () => {
    const cells = buildCalendar([{ date: daysAgo(0) }, { date: daysAgo(2) }], TODAY);
    const checked = cells.filter((cell) => cell.checked).map((cell) => cell.date);

    expect(checked).toEqual(['2026-02-12', '2026-02-14']);
  });

  it('窗口外的历史不会被算进日历', () => {
    const cells = buildCalendar([{ date: daysAgo(60) }], TODAY);
    expect(cells.some((cell) => cell.checked)).toBe(false);
  });

  it('dayOfMonth 与日期键一致', () => {
    const cells = buildCalendar([], TODAY, 3);
    expect(cells.map((cell) => cell.dayOfMonth)).toEqual([12, 13, 14]);
  });
});

describe('calcCheckInReward', () => {
  it('第 1 天为基础奖励', () => {
    expect(calcCheckInReward(1)).toBe(CHECK_IN_BASE_REWARD);
  });

  it('连续越久奖励越高', () => {
    expect(calcCheckInReward(3)).toBeGreaterThan(calcCheckInReward(1));
    expect(calcCheckInReward(11)).toBeGreaterThan(calcCheckInReward(5));
  });

  it('封顶 40（避免长期用户奖励失衡）', () => {
    expect(calcCheckInReward(99)).toBe(CHECK_IN_MAX_REWARD);
    expect(calcCheckInReward(1000)).toBe(CHECK_IN_MAX_REWARD);
  });

  it('边界：0 与负数按第 1 天处理', () => {
    expect(calcCheckInReward(0)).toBe(CHECK_IN_BASE_REWARD);
    expect(calcCheckInReward(-3)).toBe(CHECK_IN_BASE_REWARD);
  });
});

describe('周期键', () => {
  it('每日任务按日期键', () => {
    expect(resolveDailyPeriodKey(TODAY)).toBe('2026-02-14');
  });

  it('周常任务按 ISO 周（跨年周归属正确）', () => {
    // 2026-01-01 是周四 → 该周属于 2026 年第 1 周
    expect(resolveWeeklyPeriodKey(new Date(2026, 0, 1))).toBe('2026-W01');
    // 2025-12-29（周一）也在同一 ISO 周
    expect(resolveWeeklyPeriodKey(new Date(2025, 11, 29))).toBe('2026-W01');
    expect(resolveWeeklyPeriodKey(TODAY)).toBe('2026-W07');
  });

  it('隐藏成就不随周期重置', () => {
    expect(resolvePeriodKey('hidden', TODAY)).toBe('permanent');
    expect(resolvePeriodKey('daily', TODAY)).toBe('2026-02-14');
    expect(resolvePeriodKey('weekly', TODAY)).toBe('2026-W07');
  });

  it('同一天多次调用结果稳定（幂等）', () => {
    expect(resolvePeriodKey('weekly', TODAY)).toBe(resolvePeriodKey('weekly', TODAY));
  });
});
