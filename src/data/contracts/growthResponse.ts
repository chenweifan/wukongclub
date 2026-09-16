import type { LoginInput, RegisterInput, User } from '@/data/contracts/user';
import { isPaginatedOf, isRecord, toPaginated } from '@/data/contracts/common';
import {
  isCheckInRecord,
  isCheckInState,
  isTaskItem,
  isNotificationItem,
  isPaginatedNotifications,
} from '@/data/contracts/growth';
import type {
  CheckInRecord,
  CheckInState,
  NotificationItem,
  TaskItem,
} from '@/data/contracts/growth';

/**
 * 契约之外的两个「响应组合」类型：它们只在接口边界出现，
 * 但同样需要运行时守卫 —— 组合体的字段比单体更容易漏。
 */
export interface CheckInOutcome {
  state: CheckInState;
  record: CheckInRecord;
  user: User;
}

export interface ClaimOutcome {
  task: TaskItem;
  user: User;
}

export function isCheckInOutcome(value: unknown): value is CheckInOutcome {
  return (
    isRecord(value) &&
    isCheckInState(value.state) &&
    isCheckInRecord(value.record) &&
    isUserShape(value.user)
  );
}

export function isClaimOutcome(value: unknown): value is ClaimOutcome {
  return isRecord(value) && isTaskItem(value.task) && isUserShape(value.user);
}

export function isTaskListResponse(value: unknown): value is { items: TaskItem[] } {
  return (
    isRecord(value) && Array.isArray(value.items) && value.items.every((item) => isTaskItem(item))
  );
}

export function isNotificationList(
  value: unknown,
): value is { items: NotificationItem[]; total: number } {
  return (
    isRecord(value) &&
    isPaginatedNotifications({ items: value.items, total: value.total, page: 1, pageSize: 1 })
  );
}

export function isNotificationPage(value: unknown) {
  return isPaginatedOf(value, isNotificationItem);
}

export function buildTaskListResponse(items: readonly TaskItem[]): { items: TaskItem[] } {
  return { items: [...items] };
}

export function buildNotificationPage(items: readonly NotificationItem[], page = 1, pageSize = 30) {
  return toPaginated(items, page, pageSize);
}

export type { CheckInRecord, CheckInState, NotificationItem, TaskItem, LoginInput, RegisterInput };

/* 内部：只校验 User 的形状，避免与 user.ts 的守卫互相 import 造成环 */
function isUserShape(value: unknown): value is User {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.username === 'string' &&
    typeof value.displayName === 'string' &&
    typeof value.exp === 'number' &&
    typeof value.spiritPoints === 'number' &&
    Array.isArray(value.badges)
  );
}
