import { useMutation, useQueryClient } from '@tanstack/react-query';

import { growthRepo } from '@/data/repositories';
import { useSessionStore } from '@/entities/session/sessionStore';
import { GROWTH_QUERY_KEYS } from '@/entities/growth/queries';
import { pushToast } from '@/stores/toastStore';
import { describeUnknownError } from '@/utils/errorMessage';
import { COPY } from '@/utils/copy';

/**
 * 成长域的写操作。
 *
 * 三个 mutation 的共同点：**都会改变用户资料**（灵蕴、修为）。
 * 因此成功后统一用返回的 user 覆盖会话里的用户，而不是去重新拉一次 /me ——
 * 服务端已经把它算好了，少一次往返也少一处不一致。
 */

export function useCheckInMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => growthRepo.checkIn(),
    onSuccess: (outcome) => {
      useSessionStore.getState().updateUser(outcome.user);
      void queryClient.invalidateQueries({ queryKey: GROWTH_QUERY_KEYS.checkIn });
      // 上香会让「每日上香」任务变成可领取，任务列表必须跟着刷新
      void queryClient.invalidateQueries({ queryKey: GROWTH_QUERY_KEYS.tasks });
      pushToast(
        COPY.growth.checkIn.success(outcome.record.reward, outcome.record.streak),
        'success',
      );
    },
    onError: (error) => {
      pushToast(describeUnknownError(error), 'danger');
    },
  });
}

export function useClaimTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => growthRepo.claimTask(taskId),
    onSuccess: (outcome) => {
      useSessionStore.getState().updateUser(outcome.user);
      void queryClient.invalidateQueries({ queryKey: GROWTH_QUERY_KEYS.tasks });
      pushToast(COPY.growth.tasks.claimSuccess(outcome.task.title, outcome.task.reward), 'success');
    },
    onError: (error) => {
      pushToast(`${COPY.growth.tasks.claimFailed}：${describeUnknownError(error)}`, 'danger');
    },
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => growthRepo.markNotificationRead(notificationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: GROWTH_QUERY_KEYS.notifications });
    },
    onError: (error) => {
      pushToast(
        `${COPY.growth.notifications.readFailed}：${describeUnknownError(error)}`,
        'danger',
      );
    },
  });
}

export function useMarkAllReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => growthRepo.markAllNotificationsRead(),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: GROWTH_QUERY_KEYS.notifications });
      pushToast(COPY.growth.notifications.allReadDone(updated), 'success');
    },
    onError: (error) => {
      pushToast(
        `${COPY.growth.notifications.readFailed}：${describeUnknownError(error)}`,
        'danger',
      );
    },
  });
}
