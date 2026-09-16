import Dexie from 'dexie';
import type { Table } from 'dexie';

import type { DemoProbe } from '@/data/contracts/demoProbe';

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
 * 阶段 2 增加草稿/收藏/进度等表时，按 Dexie 规范新增 version(2)，不改动 v1 定义。
 */
export class HmwDatabase extends Dexie {
  declare readonly probes: Table<DemoProbe, string>;

  constructor() {
    super(HMW_DB_NAME);
    this.version(1).stores({
      probes: 'id, category, collected, createdAt',
    });
  }
}

export const hmwDb = new HmwDatabase();
