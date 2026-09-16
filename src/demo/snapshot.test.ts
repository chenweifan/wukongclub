import { beforeEach, describe, expect, it } from 'vitest';

import { clearAllData, readAllProbes, seedProbes } from '@/data/db/demoData';
import { useDemoStore } from '@/demo/demoStore';
import { restoreSnapshot, exportSnapshot, SnapshotImportError } from '@/demo/snapshot';
import {
  SNAPSHOT_APP_ID,
  SNAPSHOT_VERSION,
  buildSnapshot,
  isDemoSnapshot,
} from '@/demo/snapshotSchema';
import { DEFAULT_DEMO_STATE } from '@/demo/types';

/**
 * 快照「导出 → 清空 → 导入」全链路（协议 1.7 验收）。
 * 这里用的是真实的 Dexie + fake-indexeddb（见 test/setup.ts），
 * 不是把持久层 mock 掉 —— 否则「界面完全还原」这句验收就没有证据。
 */
describe('演示快照', () => {
  beforeEach(async () => {
    await clearAllData();
    useDemoStore.getState().reset();
  });

  it('导出包含版本、DemoState、Dexie 全量与 hmw: 存储', async () => {
    await seedProbes(4, 42);
    window.localStorage.setItem('hmw:ui', '{"state":{"sidebarCollapsed":true},"version":2}');
    window.localStorage.setItem('unrelated', 'should-not-be-exported');
    useDemoStore.getState().patch({ enabled: true, role: 'moderator', uiState: 'empty' });

    const snapshot = await exportSnapshot();

    expect(snapshot.version).toBe(SNAPSHOT_VERSION);
    expect(snapshot.app).toBe(SNAPSHOT_APP_ID);
    expect(snapshot.demoState.role).toBe('moderator');
    expect(snapshot.db.probes).toHaveLength(4);
    expect(Object.keys(snapshot.ls)).toContain('hmw:ui');
    expect(Object.keys(snapshot.ls)).not.toContain('unrelated');
  });

  it('清空 → 导入后数据与状态完全还原（含勾选这类写操作）', async () => {
    await seedProbes(5, 7);
    const before = await readAllProbes();
    const target = before[2];
    expect(target).toBeDefined();

    // 模拟用户勾选：直接改库（等价于经 PATCH handler 写入）
    const { hmwDb } = await import('@/data/db/hmwDb');
    await hmwDb.probes.put({ ...target!, collected: true });

    useDemoStore.getState().patch({ enabled: true, uiState: 'offline', spoiler: true });
    const snapshot = await exportSnapshot();

    await clearAllData();
    expect(await readAllProbes()).toHaveLength(0);

    const result = await restoreSnapshot(snapshot);
    const after = await readAllProbes();

    expect(result.rows).toBe(5);
    expect(after).toEqual(await Promise.resolve(snapshot.db.probes));
    expect(after.find((probe) => probe.id === target!.id)?.collected).toBe(true);
    expect(useDemoStore.getState().uiState).toBe('offline');
    expect(useDemoStore.getState().enabled).toBe(true);
  });

  it('清空会摘掉 hmw: 前缀的存储，但不动其他键', async () => {
    window.localStorage.setItem('hmw:theme', 'paper');
    window.localStorage.setItem('other-app', 'keep-me');

    const result = await clearAllData();

    expect(result.clearedKeys).toBeGreaterThanOrEqual(1);
    expect(window.localStorage.getItem('hmw:theme')).toBeNull();
    expect(window.localStorage.getItem('other-app')).toBe('keep-me');
  });

  it('导入非法结构时抛 SnapshotImportError，且不污染现有数据', async () => {
    await seedProbes(3, 1);

    const badFile = new File(['{"version":99}'], 'bad.json', { type: 'application/json' });
    const { importSnapshotFile } = await import('@/demo/snapshot');

    await expect(importSnapshotFile(badFile)).rejects.toBeInstanceOf(SnapshotImportError);
    expect(await readAllProbes()).toHaveLength(3);
  });

  it('导入合法文件时按契约过滤掉脏记录', async () => {
    const file = new File(
      [
        JSON.stringify({
          version: SNAPSHOT_VERSION,
          app: SNAPSHOT_APP_ID,
          exportedAt: '2026-01-01T00:00:00.000Z',
          demoState: { ...DEFAULT_DEMO_STATE, enabled: true, role: 'admin' },
          db: {
            probes: [
              {
                id: 'probe-x',
                label: '灵蕴·1号探针',
                category: 'beta',
                score: 10,
                collected: true,
                createdAt: '2026-01-01T08:00:00.000Z',
              },
              { id: 'broken' },
              'not-an-object',
            ],
          },
          ls: { 'hmw:theme': 'paper', 'evil-key': 'x' },
        }),
      ],
      'snapshot.json',
      { type: 'application/json' },
    );

    const { importSnapshotFile } = await import('@/demo/snapshot');
    const result = await importSnapshotFile(file);

    expect(result.rows).toBe(1);
    expect((await readAllProbes()).map((probe) => probe.id)).toEqual(['probe-x']);
    // 只接受 hmw: 命名空间的键，避免污染其他站点数据
    expect(window.localStorage.getItem('hmw:theme')).toBe('paper');
    expect(window.localStorage.getItem('evil-key')).toBeNull();
    expect(useDemoStore.getState().role).toBe('admin');
  });
});

describe('快照结构校验', () => {
  const base = {
    version: SNAPSHOT_VERSION,
    app: SNAPSHOT_APP_ID,
    exportedAt: '2026-01-01T00:00:00.000Z',
    demoState: DEFAULT_DEMO_STATE,
    db: { probes: [] },
    ls: {},
  };

  it('接受合法快照', () => {
    expect(isDemoSnapshot(base)).toBe(true);
  });

  it('版本不匹配 / 缺字段 / 类型错误一律拒绝', () => {
    expect(isDemoSnapshot({ ...base, version: 2 })).toBe(false);
    expect(isDemoSnapshot({ ...base, app: 'other' })).toBe(false);
    expect(isDemoSnapshot({ ...base, db: { probes: 'nope' } })).toBe(false);
    expect(isDemoSnapshot({ ...base, ls: { key: 1 } })).toBe(false);
    expect(isDemoSnapshot({ ...base, demoState: { role: 'admin' } })).toBe(false);
    expect(isDemoSnapshot(null)).toBe(false);
    expect(isDemoSnapshot([])).toBe(false);
  });

  it('buildSnapshot 写入当前版本号', () => {
    expect(
      buildSnapshot({
        demoState: DEFAULT_DEMO_STATE,
        db: {},
        ls: {},
        exportedAt: '2026-01-01T00:00:00.000Z',
      }).version,
    ).toBe(SNAPSHOT_VERSION);
  });
});
