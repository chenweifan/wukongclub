import { describe, expect, it } from 'vitest';

import {
  countUnread,
  filterByCategory,
  groupTasksByKind,
  isNotificationItem,
  isTaskItem,
  resolveTaskStatus,
  sortNotifications,
} from '@/data/contracts/growth';
import type { NotificationItem, TaskItem } from '@/data/contracts/growth';

function task(overrides: Partial<TaskItem>): TaskItem {
  return {
    id: 'task-1',
    kind: 'daily',
    title: '土地庙上香',
    description: '每日上香',
    progress: 0,
    target: 1,
    reward: 10,
    status: 'active',
    expiresAt: null,
    ...overrides,
  };
}

function notification(overrides: Partial<NotificationItem>): NotificationItem {
  return {
    id: 'n-1',
    category: 'system',
    title: '标题',
    body: '正文',
    createdAt: '2026-02-14T08:00:00.000Z',
    read: false,
    link: null,
    ...overrides,
  };
}

describe('任务契约', () => {
  it('守卫接受合法任务', () => {
    expect(isTaskItem(task({}))).toBe(true);
  });

  it('守卫拒绝错类型与非法 kind/status', () => {
    expect(isTaskItem(task({ kind: 'monthly' as TaskItem['kind'] }))).toBe(false);
    expect(isTaskItem(task({ status: 'done' as TaskItem['status'] }))).toBe(false);
    expect(isTaskItem({ ...task({}), progress: '0' })).toBe(false);
    expect(isTaskItem(null)).toBe(false);
  });

  it('状态由进度推导（避免服务端与前端两套判断）', () => {
    expect(resolveTaskStatus(0, 3, false)).toBe('active');
    expect(resolveTaskStatus(2, 3, false)).toBe('active');
    expect(resolveTaskStatus(3, 3, false)).toBe('claimable');
    expect(resolveTaskStatus(5, 3, false)).toBe('claimable');
    expect(resolveTaskStatus(3, 3, true)).toBe('claimed');
    // 已领取优先于进度：即使进度被重置也不会退回可领取
    expect(resolveTaskStatus(0, 3, true)).toBe('claimed');
  });

  it('按类别分组：空数组时三类都在（不是 undefined）', () => {
    const grouped = groupTasksByKind([]);
    expect(grouped.daily).toEqual([]);
    expect(grouped.weekly).toEqual([]);
    expect(grouped.hidden).toEqual([]);
  });

  it('按类别分组：顺序保持输入顺序', () => {
    const tasks = [
      task({ id: 'a', kind: 'daily' }),
      task({ id: 'b', kind: 'weekly' }),
      task({ id: 'c', kind: 'daily' }),
    ];
    const grouped = groupTasksByKind(tasks);

    expect(grouped.daily.map((item) => item.id)).toEqual(['a', 'c']);
    expect(grouped.weekly.map((item) => item.id)).toEqual(['b']);
  });
});

describe('消息契约', () => {
  it('守卫校验分类与可空 link', () => {
    expect(isNotificationItem(notification({}))).toBe(true);
    expect(
      isNotificationItem(notification({ category: 'spam' as NotificationItem['category'] })),
    ).toBe(false);
    expect(isNotificationItem(notification({ link: '/user' }))).toBe(true);
    expect(isNotificationItem(notification({ read: 'no' as unknown as boolean }))).toBe(false);
  });

  it('countUnread 统计未读（空数组为 0）', () => {
    expect(countUnread([])).toBe(0);
    expect(
      countUnread([
        notification({ id: '1', read: false }),
        notification({ id: '2', read: true }),
        notification({ id: '3', read: false }),
      ]),
    ).toBe(2);
  });

  it('filterByCategory：all 返回副本，其余精确匹配', () => {
    const items = [
      notification({ id: '1', category: 'system' }),
      notification({ id: '2', category: 'like' }),
    ];

    expect(filterByCategory(items, 'all')).toHaveLength(2);
    expect(filterByCategory(items, 'all')).not.toBe(items); // 返回副本，调用方改不到源数据
    expect(filterByCategory(items, 'like').map((item) => item.id)).toEqual(['2']);
    expect(filterByCategory(items, 'follow')).toEqual([]);
  });

  it('sortNotifications：未读优先，其次时间倒序', () => {
    const items = [
      notification({ id: 'read-new', read: true, createdAt: '2026-02-14T10:00:00.000Z' }),
      notification({ id: 'unread-old', read: false, createdAt: '2026-02-10T10:00:00.000Z' }),
      notification({ id: 'unread-new', read: false, createdAt: '2026-02-14T09:00:00.000Z' }),
      notification({ id: 'read-old', read: true, createdAt: '2026-02-01T10:00:00.000Z' }),
    ];

    expect(sortNotifications(items).map((item) => item.id)).toEqual([
      'unread-new',
      'unread-old',
      'read-new',
      'read-old',
    ]);
  });

  it('sortNotifications 不改动原数组（纯函数）', () => {
    const items = [notification({ id: 'b', read: true }), notification({ id: 'a', read: false })];
    const snapshot = items.map((item) => item.id);

    sortNotifications(items);

    expect(items.map((item) => item.id)).toEqual(snapshot);
  });
});
