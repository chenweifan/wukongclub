import { isPaginatedOf, isRecord } from '@/data/contracts/common';
import type { Paginated } from '@/data/contracts/common';

/**
 * 成长域契约：土地庙签到、任务中心、消息中心。
 * 时间一律用 ISO 字符串传输，日期键（YYYY-MM-DD）单独用于签到去重与日历。
 */

/* ── 签到 ─────────────────────────────────────────────────────────── */

export interface CheckInRecord {
  id: string;
  userId: string;
  /** 本地时区的日期键，形如 2026-02-14；同一天只能有一条。 */
  date: string;
  at: string;
  /** 该次签到后的连续天数（历史快照，便于回看当时的奖励）。 */
  streak: number;
  reward: number;
}

export interface CheckInState {
  todayChecked: boolean;
  streak: number;
  totalDays: number;
  /** 今天签到可得的灵蕴（未签到时给出预告）。 */
  nextReward: number;
  records: readonly CheckInRecord[];
}

export function isCheckInRecord(value: unknown): value is CheckInRecord {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.userId === 'string' &&
    typeof value.date === 'string' &&
    typeof value.at === 'string' &&
    typeof value.streak === 'number' &&
    typeof value.reward === 'number'
  );
}

export function isCheckInState(value: unknown): value is CheckInState {
  return (
    isRecord(value) &&
    typeof value.todayChecked === 'boolean' &&
    typeof value.streak === 'number' &&
    typeof value.totalDays === 'number' &&
    typeof value.nextReward === 'number' &&
    Array.isArray(value.records) &&
    value.records.every((record) => isCheckInRecord(record))
  );
}

/* ── 任务 ─────────────────────────────────────────────────────────── */

export const TASK_KINDS = ['daily', 'weekly', 'hidden'] as const;

export type TaskKind = (typeof TASK_KINDS)[number];

export const TASK_STATUSES = ['active', 'claimable', 'claimed'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export interface TaskItem {
  id: string;
  kind: TaskKind;
  title: string;
  description: string;
  progress: number;
  target: number;
  /** 完成后可领取的灵蕴。 */
  reward: number;
  status: TaskStatus;
  /** 周常/限时任务的截止时间；每日与隐藏成就为 null。 */
  expiresAt: string | null;
}

export function isTaskKind(value: unknown): value is TaskKind {
  return typeof value === 'string' && (TASK_KINDS as readonly string[]).includes(value);
}

export function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === 'string' && (TASK_STATUSES as readonly string[]).includes(value);
}

export function isTaskItem(value: unknown): value is TaskItem {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    isTaskKind(value.kind) &&
    typeof value.title === 'string' &&
    typeof value.description === 'string' &&
    typeof value.progress === 'number' &&
    typeof value.target === 'number' &&
    typeof value.reward === 'number' &&
    isTaskStatus(value.status) &&
    (value.expiresAt === null || typeof value.expiresAt === 'string')
  );
}

export function isPaginatedTasks(value: unknown): value is Paginated<TaskItem> {
  return isPaginatedOf(value, isTaskItem);
}

/**
 * 任务状态由进度推导，而不是让服务端和前端各存一份：
 * 只要 progress ≥ target 且未领取，就是可领取。这样连上真实后端时
 * 也不会出现「进度满了但状态没更新」的不一致。
 */
export function resolveTaskStatus(progress: number, target: number, claimed: boolean): TaskStatus {
  if (claimed) {
    return 'claimed';
  }
  return progress >= target ? 'claimable' : 'active';
}

export function groupTasksByKind(items: readonly TaskItem[]): Record<TaskKind, TaskItem[]> {
  const grouped: Record<TaskKind, TaskItem[]> = { daily: [], weekly: [], hidden: [] };

  for (const item of items) {
    grouped[item.kind].push(item);
  }

  return grouped;
}

/* ── 消息 ─────────────────────────────────────────────────────────── */

export const NOTIFICATION_CATEGORIES = [
  'system',
  'achievement',
  'reply',
  'like',
  'follow',
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  /** 站内跳转目标；null 表示纯通知，不可点。 */
  link: string | null;
}

export function isNotificationCategory(value: unknown): value is NotificationCategory {
  return (
    typeof value === 'string' && (NOTIFICATION_CATEGORIES as readonly string[]).includes(value)
  );
}

export function isNotificationItem(value: unknown): value is NotificationItem {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    isNotificationCategory(value.category) &&
    typeof value.title === 'string' &&
    typeof value.body === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.read === 'boolean' &&
    (value.link === null || typeof value.link === 'string')
  );
}

export function isPaginatedNotifications(value: unknown): value is Paginated<NotificationItem> {
  return isPaginatedOf(value, isNotificationItem);
}

export function countUnread(items: readonly NotificationItem[]): number {
  return items.reduce((total, item) => (item.read ? total : total + 1), 0);
}

/** 按分类筛选；'all' 表示不筛选。 */
export function filterByCategory(
  items: readonly NotificationItem[],
  category: NotificationCategory | 'all',
): NotificationItem[] {
  return category === 'all' ? [...items] : items.filter((item) => item.category === category);
}

/** 未读优先、时间倒序：消息中心的默认排序。 */
export function sortNotifications(items: readonly NotificationItem[]): NotificationItem[] {
  return [...items].sort((left, right) => {
    if (left.read !== right.read) {
      return left.read ? 1 : -1;
    }
    return right.createdAt.localeCompare(left.createdAt);
  });
}
