import { isDemoState } from '@/demo/types';
import type { DemoState } from '@/demo/types';

/**
 * 数据快照的结构定义与校验（协议 1.7）。
 * 纯函数集中在这里，I/O 在 snapshot.ts —— 这样「版本校验」可以被单测直接覆盖。
 */

export const SNAPSHOT_VERSION = 1;
export const SNAPSHOT_FILE_NAME = 'hmw-demo-snapshot.json';
export const SNAPSHOT_APP_ID = 'wukongclub-demo';

export interface DemoSnapshot {
  version: number;
  app: string;
  exportedAt: string;
  demoState: DemoState;
  /** Dexie 全量导出：表名 → 记录数组。 */
  db: Record<string, unknown[]>;
  /** localStorage 中 hmw: 前缀的键值。 */
  ls: Record<string, string>;
}

export interface SnapshotInput {
  demoState: DemoState;
  db: Record<string, unknown[]>;
  ls: Record<string, string>;
  exportedAt: string;
}

export function buildSnapshot(input: SnapshotInput): DemoSnapshot {
  return {
    version: SNAPSHOT_VERSION,
    app: SNAPSHOT_APP_ID,
    exportedAt: input.exportedAt,
    demoState: input.demoState,
    db: input.db,
    ls: input.ls,
  };
}

function isStringRecord(value: unknown): value is Record<string, string> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  return Object.values(value).every((item) => typeof item === 'string');
}

function isTableRecord(value: unknown): value is Record<string, unknown[]> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  return Object.values(value).every((item) => Array.isArray(item));
}

/**
 * 导入前的结构 + 版本校验。
 * 版本不匹配直接判定为非法：宁可明确报错，也不要把半个快照灌进本地库。
 */
export function isDemoSnapshot(value: unknown): value is DemoSnapshot {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    candidate.version === SNAPSHOT_VERSION &&
    candidate.app === SNAPSHOT_APP_ID &&
    typeof candidate.exportedAt === 'string' &&
    isDemoState(candidate.demoState) &&
    isTableRecord(candidate.db) &&
    isStringRecord(candidate.ls)
  );
}

/** 供 UI 展示的版本兼容性判断（未来做向下兼容时改这里）。 */
export function isSupportedSnapshotVersion(version: unknown): boolean {
  return version === SNAPSHOT_VERSION;
}
