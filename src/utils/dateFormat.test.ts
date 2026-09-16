import { describe, expect, it } from 'vitest';

import { formatDate, formatDateTime, formatDeadline, formatRelativeTime } from '@/utils/dateFormat';

const NOW = new Date('2026-02-14T12:00:00.000Z');

describe('formatDate / formatDateTime', () => {
  it('输出 YYYY-MM-DD', () => {
    expect(formatDate('2026-02-14T09:30:00.000Z')).toMatch(/^2026-02-14$/);
  });

  it('非法输入返回兜底值而不是 Invalid Date', () => {
    expect(formatDate('not-a-date')).toBe('—');
    expect(formatDateTime('')).toBe('—');
    expect(formatDate('nope', '未知')).toBe('未知');
  });

  it('formatDateTime 带时分', () => {
    expect(formatDateTime('2026-02-14T09:30:00.000Z')).toMatch(/^2026-02-14 \d{2}:\d{2}$/);
  });

  it('formatDeadline 只到天，且按本地时区往返一致', () => {
    // 用本地时间构造再转 ISO：断言的是「同一天往返」，不依赖运行机器的时区
    const localEndOfDay = new Date(2026, 1, 15, 23, 59, 59);
    expect(formatDeadline(localEndOfDay.toISOString())).toBe('2026-02-15');
  });
});

describe('formatRelativeTime', () => {
  it('一分钟内 → 刚刚', () => {
    expect(formatRelativeTime(new Date(NOW.getTime() - 30_000).toISOString(), NOW)).toBe('刚刚');
  });

  it('分钟 / 小时 / 天 三档', () => {
    expect(formatRelativeTime(new Date(NOW.getTime() - 5 * 60_000).toISOString(), NOW)).toBe(
      '5 分钟前',
    );
    expect(formatRelativeTime(new Date(NOW.getTime() - 3 * 3_600_000).toISOString(), NOW)).toBe(
      '3 小时前',
    );
    expect(formatRelativeTime(new Date(NOW.getTime() - 2 * 86_400_000).toISOString(), NOW)).toBe(
      '2 天前',
    );
  });

  it('超过 7 天退回具体日期', () => {
    expect(formatRelativeTime('2026-01-01T00:00:00.000Z', NOW)).toBe('2026-01-01');
  });

  it('未来时间显示为「刚刚」而不是负数', () => {
    expect(formatRelativeTime(new Date(NOW.getTime() + 60_000).toISOString(), NOW)).toBe('刚刚');
  });

  it('非法输入返回兜底值（边界）', () => {
    expect(formatRelativeTime('x', NOW)).toBe('—');
  });
});
