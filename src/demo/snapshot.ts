import { isDemoProbe } from '@/data/contracts/demoProbe';
import { clearAllData, markDataInitialized, writeProbes } from '@/data/db/demoData';
import { hmwDb } from '@/data/db/hmwDb';
import { readDemoState, useDemoStore } from '@/demo/demoStore';
import { buildSnapshot, isDemoSnapshot } from '@/demo/snapshotSchema';
import type { DemoSnapshot } from '@/demo/snapshotSchema';
import { collectHmwEntries, restoreHmwEntries } from '@/utils/hmwStorage';
import { downloadJson } from '@/utils/download';
import { SNAPSHOT_FILE_NAME } from '@/demo/snapshotSchema';

/** 快照导入失败：带上可展示的原因，UI 直接 Toast 出去。 */
export class SnapshotImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SnapshotImportError';
  }
}

export interface SnapshotRestoreResult {
  rows: number;
  keys: number;
}

/** 导出：DemoState + Dexie 全量 + hmw: 前缀的 localStorage。 */
export async function exportSnapshot(): Promise<DemoSnapshot> {
  const probes = await hmwDb.probes.toArray();

  return buildSnapshot({
    demoState: readDemoState(useDemoStore.getState()),
    db: { probes: probes.map((probe) => ({ ...probe })) },
    ls: collectHmwEntries(window.localStorage),
    exportedAt: new Date().toISOString(),
  });
}

export function downloadSnapshot(snapshot: DemoSnapshot): void {
  downloadJson(SNAPSHOT_FILE_NAME, snapshot);
}

/**
 * 还原快照。
 * 顺序很重要：先写库 → 再写 localStorage → 最后覆盖 DemoState，
 * 这样 DemoProvider 的 URL 同步会在状态就位后一次性把地址栏更新成快照里的样子。
 */
export async function restoreSnapshot(snapshot: DemoSnapshot): Promise<SnapshotRestoreResult> {
  const rawProbes = snapshot.db.probes ?? [];
  const probes = rawProbes.filter(isDemoProbe);

  await writeProbes(probes);
  markDataInitialized();

  const keys = restoreHmwEntries(window.localStorage, snapshot.ls);

  useDemoStore.getState().patch({ ...snapshot.demoState, enabled: true });

  return { rows: probes.length, keys };
}

/** 读取文件并导入：文件读取/解析/版本校验失败都会抛出 SnapshotImportError。 */
export async function importSnapshotFile(file: File): Promise<SnapshotRestoreResult> {
  let parsed: unknown;

  try {
    parsed = JSON.parse(await readFileText(file));
  } catch (error) {
    throw new SnapshotImportError(
      error instanceof Error ? `快照文件不是合法 JSON：${error.message}` : '快照文件无法解析',
    );
  }

  if (!isDemoSnapshot(parsed)) {
    throw new SnapshotImportError('快照结构或版本不匹配（当前支持 version=1）');
  }

  return restoreSnapshot(parsed);
}

/**
 * 清空一切（协议 1.7 的 resetAll）：
 * 按 hmw: 前缀清理 localStorage 并清空 Dexie 表。
 */
export async function resetAll(): Promise<{ clearedKeys: number }> {
  return clearAllData();
}

/** jsdom 与旧浏览器不一定实现 Blob.text()，这里用 FileReader 兜底。 */
async function readFileText(file: File): Promise<string> {
  if (typeof file.text === 'function') {
    return file.text();
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.onerror = () => {
      reject(new Error('读取快照文件失败'));
    };
    reader.readAsText(file);
  });
}
