import { HttpResponse, http } from 'msw';

import { API_PATHS } from '@/data/apiPaths';
import { buildNotificationPage, buildTaskListResponse } from '@/data/contracts/growthResponse';
import {
  claimTaskReward,
  markAllNotificationsRead,
  markNotificationRead,
  performCheckIn,
  readCheckInState,
  readNotificationItems,
  readTaskItems,
} from '@/data/db/growthData';
import { toPublicUser } from '@/data/db/records';
import { HttpError } from '@/data/HttpError';
import { mockDelay, mockError, toMockResponse } from '@/data/mocks/mockControl';
import { resolveUserId } from '@/data/mocks/session';

/** 鉴权：未登录一律 401，前端据此展示「请先登录」而不是空列表。 */
function requireUserId(request: Request): string {
  const userId = resolveUserId(request);

  if (userId === null) {
    throw new HttpError(401, '尚未登录', { code: 'UNAUTHORIZED' });
  }

  return userId;
}

function readParam(value: string | readonly string[] | undefined): string {
  return typeof value === 'string' ? value : '';
}

export const growthHandlers = [
  http.get(API_PATHS.growth.checkIn, async ({ request }) => {
    try {
      mockError();
      await mockDelay();

      return HttpResponse.json(await readCheckInState(requireUserId(request), new Date()));
    } catch (error) {
      return toMockResponse(error);
    }
  }),

  http.post(API_PATHS.growth.checkIn, async ({ request }) => {
    try {
      mockError();
      await mockDelay();

      const outcome = await performCheckIn(requireUserId(request), new Date());

      return HttpResponse.json({
        state: outcome.state,
        record: outcome.record,
        user: toPublicUser(outcome.user),
      });
    } catch (error) {
      return toMockResponse(error);
    }
  }),

  http.get(API_PATHS.growth.tasks, async ({ request }) => {
    try {
      mockError();
      await mockDelay();

      const items = await readTaskItems(requireUserId(request), new Date());

      return HttpResponse.json(buildTaskListResponse(items));
    } catch (error) {
      return toMockResponse(error);
    }
  }),

  http.post(API_PATHS.growth.claimTask, async ({ request, params }) => {
    try {
      mockError();
      await mockDelay();

      const outcome = await claimTaskReward(
        requireUserId(request),
        readParam(params.taskId),
        new Date(),
      );

      return HttpResponse.json({ task: outcome.task, user: toPublicUser(outcome.user) });
    } catch (error) {
      return toMockResponse(error);
    }
  }),

  http.get(API_PATHS.growth.notifications, async ({ request }) => {
    try {
      mockError();
      await mockDelay();

      const items = await readNotificationItems(requireUserId(request), new Date());

      return HttpResponse.json(buildNotificationPage(items, 1, Math.max(items.length, 1)));
    } catch (error) {
      return toMockResponse(error);
    }
  }),

  http.post(API_PATHS.growth.readNotification, async ({ request, params }) => {
    try {
      mockError();
      await mockDelay();

      const item = await markNotificationRead(
        requireUserId(request),
        readParam(params.notificationId),
      );

      return HttpResponse.json(item);
    } catch (error) {
      return toMockResponse(error);
    }
  }),

  http.post(API_PATHS.growth.readAllNotifications, async ({ request }) => {
    try {
      mockError();
      await mockDelay();

      const updated = await markAllNotificationsRead(requireUserId(request));

      return HttpResponse.json({ updated });
    } catch (error) {
      return toMockResponse(error);
    }
  }),
];
