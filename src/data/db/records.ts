import type { NotificationItem, TaskItem } from '@/data/contracts/growth';
import type { User } from '@/data/contracts/user';

/**
 * 本地库的记录类型（mock 后端的「数据库表结构」）。
 * 它们比对外契约多出**服务端才该知道**的字段：密码摘要、归属用户、周期键、是否已领取。
 * 对外一律经 toPublicUser / toTaskItem 转换后再返回，避免这些字段泄漏到前端。
 */

export interface UserRecord extends User {
  passwordDigest: string;
}

export interface TaskRecord {
  id: string;
  userId: string;
  kind: TaskItem['kind'];
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: number;
  claimed: boolean;
  /**
   * 周期键：每日任务为 YYYY-MM-DD，周常为 YYYY-Www。
   * 它让「跨天后每日任务自动重置」成为一次纯比较，而不是定时任务。
   */
  periodKey: string;
  expiresAt: string | null;
}

export interface NotificationRecord extends NotificationItem {
  userId: string;
}

/** 去掉密码摘要。少一个字段就少一条泄漏路径。 */
export function toPublicUser(record: UserRecord): User {
  const { passwordDigest: _passwordDigest, ...user } = record;
  return user;
}
