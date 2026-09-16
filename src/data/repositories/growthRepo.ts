import { API_PATHS, fillPath } from '@/data/apiPaths';
import { HttpError } from '@/data/HttpError';
import { isCheckInState, isNotificationItem, isTaskItem } from '@/data/contracts/growth';
import type { CheckInState, NotificationItem, TaskItem } from '@/data/contracts/growth';
import {
  isClaimOutcome,
  isCheckInOutcome,
  isNotificationPage,
  isTaskListResponse,
} from '@/data/contracts/growthResponse';
import type { ClaimOutcome, CheckInOutcome } from '@/data/contracts/growthResponse';
import { requestJson } from '@/data/httpClient';

/**
 * 成长域 Repository：签到、任务、消息。
 * 每个方法都把 unknown 收敛成契约类型，形状不对就抛 CONTRACT_MISMATCH ——
 * 这样后端字段一改，问题会在这一层立刻暴露，而不是在页面里变成 undefined。
 */
export interface GrowthRepository {
  checkInState(): Promise<CheckInState>;
  checkIn(): Promise<CheckInOutcome>;
  tasks(): Promise<TaskItem[]>;
  claimTask(taskId: string): Promise<ClaimOutcome>;
  notifications(): Promise<NotificationItem[]>;
  markNotificationRead(notificationId: string): Promise<NotificationItem>;
  markAllNotificationsRead(): Promise<number>;
}

function contractMismatch(what: string): HttpError {
  return new HttpError(500, `${what}响应不符合契约`, { code: 'CONTRACT_MISMATCH' });
}

export const growthRepo: GrowthRepository = {
  async checkInState() {
    const payload = await requestJson(API_PATHS.growth.checkIn);

    if (!isCheckInState(payload)) {
      throw contractMismatch('签到状态');
    }

    return payload;
  },

  async checkIn() {
    const payload = await requestJson(API_PATHS.growth.checkIn, { method: 'POST' });

    if (!isCheckInOutcome(payload)) {
      throw contractMismatch('签到');
    }

    return payload;
  },

  async tasks() {
    const payload = await requestJson(API_PATHS.growth.tasks);

    if (!isTaskListResponse(payload)) {
      throw contractMismatch('任务列表');
    }

    return payload.items;
  },

  async claimTask(taskId: string) {
    const payload = await requestJson(fillPath(API_PATHS.growth.claimTask, { taskId }), {
      method: 'POST',
    });

    if (!isClaimOutcome(payload)) {
      throw contractMismatch('任务领取');
    }

    return payload;
  },

  async notifications() {
    const payload = await requestJson(API_PATHS.growth.notifications);

    if (!isNotificationPage(payload)) {
      throw contractMismatch('消息列表');
    }

    return payload.items;
  },

  async markNotificationRead(notificationId: string) {
    const payload = await requestJson(
      fillPath(API_PATHS.growth.readNotification, { notificationId }),
      { method: 'POST' },
    );

    if (!isNotificationItem(payload)) {
      throw contractMismatch('消息已读');
    }

    return payload;
  },

  async markAllNotificationsRead() {
    const payload = await requestJson(API_PATHS.growth.readAllNotifications, { method: 'POST' });

    if (
      typeof payload !== 'object' ||
      payload === null ||
      !('updated' in payload) ||
      typeof payload.updated !== 'number'
    ) {
      throw contractMismatch('消息全部已读');
    }

    return payload.updated;
  },
};

export { isTaskItem };
