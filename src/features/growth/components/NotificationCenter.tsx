import { useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { SwitchField } from '@/components/ui/Switch';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { StateBoundary } from '@/components/ui/StateBoundary';
import {
  NOTIFICATION_CATEGORIES,
  countUnread,
  filterByCategory,
  sortNotifications,
} from '@/data/contracts/growth';
import type { NotificationCategory, NotificationItem } from '@/data/contracts/growth';
import { useNotificationsQuery } from '@/entities/growth/queries';
import { NotificationRow } from '@/features/growth/components/NotificationRow';
import {
  useMarkAllReadMutation,
  useMarkNotificationReadMutation,
} from '@/features/growth/mutations';
import { pushToast } from '@/stores/toastStore';
import { COPY } from '@/utils/copy';

type CategoryFilter = NotificationCategory | 'all';

const CATEGORY_OPTIONS: readonly { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: COPY.growth.notifications.all },
  ...NOTIFICATION_CATEGORIES.map((category) => ({
    value: category,
    label: COPY.growth.notifications.category[category],
  })),
];

export interface NotificationCenterProps {
  now?: Date;
}

/**
 * 消息中心：分类筛选 + 仅未读 + 全部已读。
 * 默认排序是「未读优先、时间倒序」（contracts 里的 sortNotifications），
 * 因此未读消息永远在最上面，配合顶栏红点形成一致的入口。
 */
export function NotificationCenter({ now }: NotificationCenterProps) {
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const query = useNotificationsQuery();
  const markRead = useMarkNotificationReadMutation();
  const markAll = useMarkAllReadMutation();
  const navigate = useNavigate();

  // `?? []` 每次渲染都会产生新数组，会让下面的 useMemo 每次重算，因此先稳住引用
  const items = useMemo(() => query.data ?? [], [query.data]);
  const unreadCount = countUnread(items);

  const visible = useMemo(() => {
    const scoped = unreadOnly ? items.filter((item) => !item.read) : items;
    return sortNotifications(filterByCategory(scoped, category));
  }, [category, items, unreadOnly]);

  const handleOpen = (item: NotificationItem) => {
    if (!item.read) {
      markRead.mutate(item.id);
    }

    if (item.link === null) {
      pushToast(COPY.growth.notifications.empty);
      return;
    }

    void navigate(item.link);
  };

  return (
    <section aria-labelledby="growth-notifications" className="panel-scroll p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="growth-notifications" className="text-lg">
          {COPY.growth.notifications.title}
        </h2>

        {unreadCount === 0 ? null : (
          <span className="bg-cinnabar rounded-full px-2 py-0.5 text-[11px] text-white">
            {COPY.growth.notifications.unread(unreadCount)}
          </span>
        )}

        <button
          type="button"
          disabled={unreadCount === 0 || markAll.isPending}
          onClick={() => {
            markAll.mutate();
          }}
          className="border-token border-line hover:text-accent ml-auto rounded-scroll border px-3 py-1 text-xs disabled:opacity-50"
        >
          {COPY.growth.notifications.markAllRead}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <SegmentedControl
          label={COPY.growth.notifications.title}
          value={category}
          options={CATEGORY_OPTIONS}
          onChange={setCategory}
        />
        <SwitchField
          label={COPY.growth.notifications.unreadOnly}
          checked={unreadOnly}
          onCheckedChange={setUnreadOnly}
        />
      </div>

      <div className="mt-4">
        <StateBoundary
          query={query}
          label={COPY.growth.notifications.title}
          isEmpty={() => visible.length === 0}
          emptyTitle={
            unreadOnly ? COPY.growth.notifications.emptyUnread : COPY.growth.notifications.empty
          }
        >
          {() => (
            <ul className="space-y-2">
              {visible.map((item) => (
                <NotificationRow
                  key={item.id}
                  item={item}
                  now={now}
                  onOpen={handleOpen}
                  onMarkRead={(notificationId) => {
                    markRead.mutate(notificationId);
                  }}
                />
              ))}
            </ul>
          )}
        </StateBoundary>
      </div>
    </section>
  );
}
