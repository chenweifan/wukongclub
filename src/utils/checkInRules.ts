/**
 * 签到相关的纯逻辑：日期键、连续天数、日历单元格、奖励曲线。
 *
 * 放在 utils（跨层纯函数）而不是 entities：mock 后端的种子与签到服务也要用它
 * 来生成历史与计算奖励 —— 若放在 entities，data 层引用就成了反向依赖。
 *
 * 全部用**本地时区**的日期键（YYYY-MM-DD）：签到按「用户当地的今天」算，
 * 用 UTC 会让东八区用户晚上 8 点后签到被算成第二天。
 */

/** 日历展示天数（近 N 天，含今天）。 */
export const CHECK_IN_CALENDAR_DAYS = 30;

/** 签到奖励：基础值 + 连续加成，封顶 40。 */
export const CHECK_IN_BASE_REWARD = 10;
export const CHECK_IN_STREAK_BONUS = 2;
/** 加成步数上限：15 步 × 2 = 30，加上基础值正好触到 40 的封顶。 */
export const CHECK_IN_MAX_BONUS_STEPS = 15;
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
 * - 今天还没签 → 从昨天往前数（今天补签即可续上，不视为断签）；
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

    // 防御：记录异常多时也不会无限循环
    if (streak > 3660) {
      break;
    }
  }

  return streak;
}

export interface CheckInCell {
  date: string;
  dayOfMonth: number;
  checked: boolean;
  isToday: boolean;
}

export function buildCalendar(
  records: readonly CheckInLike[],
  today: Date,
  days: number = CHECK_IN_CALENDAR_DAYS,
): CheckInCell[] {
  const checked = new Set(records.map((record) => record.date));
  const todayKey = toDateKey(today);

  return buildDateRange(today, days).map((dateKey) => ({
    date: dateKey,
    dayOfMonth: fromDateKey(dateKey).getDate(),
    checked: checked.has(dateKey),
    isToday: dateKey === todayKey,
  }));
}

/**
 * 签到奖励：基础值 + 连续加成，封顶 40。
 * 连续越久拿得越多，但不会无限膨胀（否则长期用户奖励失衡）。
 */
export function calcCheckInReward(streak: number): number {
  const safeStreak = Math.max(1, Math.floor(streak));
  const bonus = Math.min(safeStreak - 1, CHECK_IN_MAX_BONUS_STEPS) * CHECK_IN_STREAK_BONUS;
  return Math.min(CHECK_IN_MAX_REWARD, CHECK_IN_BASE_REWARD + bonus);
}

/** 周期键：每日任务按天、周常任务按 ISO 周。跨期即重置。 */
export function resolveDailyPeriodKey(date: Date): string {
  return toDateKey(date);
}

export function resolveWeeklyPeriodKey(date: Date): string {
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  // ISO 周：周四所在的那一年决定周所属年份
  const dayNumber = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNumber + 3);

  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const firstDayNumber = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDayNumber + 3);

  const week =
    1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000));

  return `${target.getFullYear()}-W${`${week}`.padStart(2, '0')}`;
}

export function resolvePeriodKey(kind: 'daily' | 'weekly' | 'hidden', date: Date): string {
  if (kind === 'daily') {
    return resolveDailyPeriodKey(date);
  }
  if (kind === 'weekly') {
    return resolveWeeklyPeriodKey(date);
  }
  // 隐藏成就不随周期重置：给出固定键，跨期判断永远为「同期」
  return 'permanent';
}
