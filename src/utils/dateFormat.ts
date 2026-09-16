/** 时间展示工具：集中处理，避免各组件各写一套 toLocaleString。 */

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

function pad(value: number): string {
  return `${value}`.padStart(2, '0');
}

/** ISO → YYYY-MM-DD（本地时区）。 */
export function formatDate(iso: string, fallback = '—'): string {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) {
    return fallback;
  }

  const date = new Date(time);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** ISO → YYYY-MM-DD HH:mm（本地时区）。 */
export function formatDateTime(iso: string, fallback = '—'): string {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) {
    return fallback;
  }

  const date = new Date(time);
  return `${formatDate(iso)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * 相对时间：刚刚 / N 分钟前 / N 小时前 / N 天前，超过 7 天退回具体日期。
 * 未来时间统一显示为「刚刚」，避免出现「-3 分钟前」这种负值。
 */
export function formatRelativeTime(iso: string, now: Date = new Date(), fallback = '—'): string {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) {
    return fallback;
  }

  const diff = now.getTime() - time;

  if (diff < MINUTE_MS) {
    return '刚刚';
  }
  if (diff < HOUR_MS) {
    return `${Math.floor(diff / MINUTE_MS)} 分钟前`;
  }
  if (diff < DAY_MS) {
    return `${Math.floor(diff / HOUR_MS)} 小时前`;
  }
  if (diff < 7 * DAY_MS) {
    return `${Math.floor(diff / DAY_MS)} 天前`;
  }

  return formatDate(iso, fallback);
}

/** 截止时间只关心到天，附在任务行尾部。 */
export function formatDeadline(iso: string, fallback = '—'): string {
  return formatDate(iso, fallback);
}
