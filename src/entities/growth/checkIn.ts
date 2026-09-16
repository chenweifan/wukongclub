/**
 * 签到相关的纯逻辑：日期键、连续天数、日历单元格、奖励曲线。
 *
 * 全部用**本地时区**的日期键（YYYY-MM-DD）：签到是「按用户当地的今天」算的，
 * 用 UTC 会让东八区的用户在晚上 8 点后签到就变成第二天。
 */

/** 日历展示天数（近 N 天，含今天）。 */
export const CHECK_IN_CALENDAR_DAYS = 30;

/** 签到基础奖励与连续加成上限。 */
export const CHECK_IN_BASE_REWARD = 10;
export const CHECK_IN_STREAK_BONUS = 2;
export const CHECK_IN_MAX_REWARD = 40;

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function fromDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map((part) => Number.parseInt(part, 10));
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** 生成 [今天-(days-1) … 今天] 的日期键，从旧到新。 */
export function buildDateRange(today: Date, days: number): string[] {
  const safeDays = Math.max(1, Math.floor(days));

  return Array.from({ length: safeDays }, (_, index) =>
    toDateKey(addDays(today, index - (safeDays - 1))),
  );
}

export interface CheckInLike {
  date: string;
}

/**
 * 连续签到天数。
 *
 * 规则（与常见签到产品一致）：
 * - 今天已签到 → 从今天往前数；
 * - 今天还没签 → 从昨天往前数（今天签到后即可续上，不视为断签）；
 * - 更早已断 → 归零。
 */
export function computeStreak(records: readonly CheckInLike[], today: Date): number {
  const checked = new Set(records.map((record) => record.date));
  const todayKey = toDateKey(today);

  let cursor = checked.has(todayKey) ? today : addDays(today, -1);
  let streak = 0;

  while (checked.has(toDateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);

    // 防御：签到记录异常多时也不会无限循环
    if (streak > 3660) {
      break;
    }
  }

  return streak;
}

export interface CheckInCell {
  date: string;
  /** 日期数字，直接渲染用。 */
  dayOfMonth: number;
  checked: boolean;
  isToday: boolean;
  /** 0=周日 … 6=周六，用于日历换行。 */
  weekday: number;
}

export function buildCalendar(
  records: readonly CheckInLike[],
  today: Date,
  days: number = CHECK_IN_CALENDAR_DAYS,
): CheckInCell[] {
  const checked = new Set(records.map((record) => record.date));
  const todayKey = toDateKey(today);

  return buildDateRange(today, days).map((dateKey) => {
    const date = fromDateKey(dateKey);
    return {
      date: dateKey,
      dayOfMonth: date.getDate(),
      checked: checked.has(dateKey),
      isToday: dateKey === todayKey,
      weekday: date.getDay(),
    };
  });
}

/**
 * 签到奖励：基础值 + 连续加成，封顶 40。
 * 连续越久拿得越多，但不会无限膨胀（否则长期用户奖励失衡）。
 */
export function calcCheckInReward(streak: number): number {
  const safeStreak = Math.max(1, Math.floor(streak));
  const bonus = Math.min(safeStreak - 1, 10) * CHECK_IN_STREAK_BONUS;
  return Math.min(CHECK_IN_MAX_REWARD, CHECK_IN_BASE_REWARD + bonus);
}
