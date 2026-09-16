import { useQuery } from '@tanstack/react-query';

import { growthRepo } from '@/data/repositories';
import { countUnread } from '@/data/contracts/growth';
import { useSessionStore } from '@/entities/session/sessionStore';

/**
 * 成长域的查询定义（Query key + hooks）。
 *
 * 放在 entities 而不是 features：顶栏的未读红点与成长中心的消息列表
 * 必须命中同一个缓存条目，否则会出现「标记已读后红点还在」的错位。
 */
export const GROWTH_QUERY_KEYS = {
  checkIn: ['growth', 'check-in'] as const,
  tasks: ['growth', 'tasks'] as const,
  notifications: ['growth', 'notifications'] as const,
};

/** 未登录时不发请求：让它 401 再展示错误态是没必要的噪音。 */
function useAuthenticated(): boolean {
  return useSessionStore((state) => state.status === 'authenticated');
}

export function useCheckInStateQuery() {
  const enabled = useAuthenticated();

  return useQuery({
    queryKey: GROWTH_QUERY_KEYS.checkIn,
    queryFn: () => growthRepo.checkInState(),
    enabled,
  });
}

export function useTasksQuery() {
  const enabled = useAuthenticated();

  return useQuery({
    queryKey: GROWTH_QUERY_KEYS.tasks,
    queryFn: () => growthRepo.tasks(),
    enabled,
  });
}

export function useNotificationsQuery() {
  const enabled = useAuthenticated();

  return useQuery({
    queryKey: GROWTH_QUERY_KEYS.notifications,
    queryFn: () => growthRepo.notifications(),
    enabled,
  });
}

/** 顶栏红点用的轻量选择器：复用同一份缓存，不额外发请求。 */
export function useUnreadNotificationCount(): number {
  const enabled = useAuthenticated();
  const query = useQuery({
    queryKey: GROWTH_QUERY_KEYS.notifications,
    queryFn: () => growthRepo.notifications(),
    enabled,
  });

  return query.data === undefined ? 0 : countUnread(query.data);
}
