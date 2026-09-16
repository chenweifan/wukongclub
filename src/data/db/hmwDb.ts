import Dexie from 'dexie';
import type { Table } from 'dexie';

import type { CheckInRecord } from '@/data/contracts/growth';
import type { GuideArticle } from '@/data/contracts/guide';
import type { NewsArticle } from '@/data/contracts/news';
import type { WikiEntry } from '@/data/contracts/encyclopedia';
import type { DemoProbe } from '@/data/contracts/demoProbe';
import type {
  FavoriteRecord,
  GuideLikeRecord,
  NotificationRecord,
  TaskRecord,
  UserRecord,
} from '@/data/db/records';

export const HMW_DB_NAME = 'hmw-db';

/**
 * 本地库（协议技术栈：dexie）。
 * 它是「没有后端」时的持久层，等价于服务端数据库 —— 因此**只有**
 * src/data/mocks 下的 handler 与 src/data/db 下的数据操作可以直接访问它，
 * 页面与 features 一律走 Repository。
 *
 * 用 declare 声明表字段：配合 TS 的 useDefineForClassFields，
 * 普通字段声明会在构造器里被赋成 undefined，反而覆盖掉 Dexie 建好的表。
 *
 * 版本演进：
 * - v1：probes（阶段 1 的演示自检数据）
 * - v2：用户成长域 users / checkins / tasks / notifications
 * - v3：影神图 wikiEntries / favorites
 * - v4：资讯 newsArticles
 * 每次升级都要重复写全部表定义，这是 Dexie 的约定（不是冗余）。
 */
export class HmwDatabase extends Dexie {
  declare readonly probes: Table<DemoProbe, string>;
  declare readonly users: Table<UserRecord, string>;
  declare readonly checkins: Table<CheckInRecord, string>;
  declare readonly tasks: Table<TaskRecord, string>;
  declare readonly notifications: Table<NotificationRecord, string>;
  declare readonly wikiEntries: Table<WikiEntry, string>;
  declare readonly favorites: Table<FavoriteRecord, string>;
  declare readonly newsArticles: Table<NewsArticle, string>;
  declare readonly guideArticles: Table<GuideArticle, string>;
  declare readonly guideLikes: Table<GuideLikeRecord, string>;

  constructor() {
    super(HMW_DB_NAME);

    this.version(1).stores({
      probes: 'id, category, collected, createdAt',
    });

    this.version(2).stores({
      probes: 'id, category, collected, createdAt',
      users: 'id, &username',
      checkins: 'id, userId, date, [userId+date]',
      tasks: 'id, userId, kind, [userId+periodKey]',
      notifications: 'id, userId, category, read, createdAt',
    });

    // v3：影神图百科（词条 + 收藏）。收藏按 ownerId 归属，账号与设备共用一张表。
    this.version(3).stores({
      probes: 'id, category, collected, createdAt',
      users: 'id, &username',
      checkins: 'id, userId, date, [userId+date]',
      tasks: 'id, userId, kind, [userId+periodKey]',
      notifications: 'id, userId, category, read, createdAt',
      wikiEntries: 'id, category, chapter, rarity, name',
      favorites: 'id, ownerId, entryId, [ownerId+entryId]',
    });

    // v4：资讯（聚合列表）。pinned 与 publishedAt 建索引，置顶与时间线排序都靠它。
    this.version(4).stores({
      probes: 'id, category, collected, createdAt',
      users: 'id, &username',
      checkins: 'id, userId, date, [userId+date]',
      tasks: 'id, userId, kind, [userId+periodKey]',
      notifications: 'id, userId, category, read, createdAt',
      wikiEntries: 'id, category, chapter, rarity, name',
      favorites: 'id, ownerId, entryId, [ownerId+entryId]',
      newsArticles: 'id, category, publishedAt, pinned',
    });

    // v5：攻略库（攻略 + 点赞）。点赞与收藏同构。
    this.version(5).stores({
      probes: 'id, category, collected, createdAt',
      users: 'id, &username',
      checkins: 'id, userId, date, [userId+date]',
      tasks: 'id, userId, kind, [userId+periodKey]',
      notifications: 'id, userId, category, read, createdAt',
      wikiEntries: 'id, category, chapter, rarity, name',
      favorites: 'id, ownerId, entryId, [ownerId+entryId]',
      newsArticles: 'id, category, publishedAt, pinned',
      guideArticles: 'id, kind, difficulty, chapter, updatedAt, views',
      guideLikes: 'id, ownerId, guideId, [ownerId+guideId]',
    });
  }
}

export const hmwDb = new HmwDatabase();
