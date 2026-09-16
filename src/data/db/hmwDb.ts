import Dexie from 'dexie';
import type { Table } from 'dexie';

import type { CheckInRecord } from '@/data/contracts/growth';
import type { DemoProbe } from '@/data/contracts/demoProbe';
import type { NotificationRecord, TaskRecord, UserRecord } from '@/data/db/records';

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
 * - v2：阶段 2 用户成长域新增 users / checkins / tasks / notifications。
 *   每次升级都要重复写全部表定义，这是 Dexie 的约定（不是冗余）。
 */
export class HmwDatabase extends Dexie {
  declare readonly probes: Table<DemoProbe, string>;
  declare readonly users: Table<UserRecord, string>;
  declare readonly checkins: Table<CheckInRecord, string>;
  declare readonly tasks: Table<TaskRecord, string>;
  declare readonly notifications: Table<NotificationRecord, string>;

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
  }
}

export const hmwDb = new HmwDatabase();
