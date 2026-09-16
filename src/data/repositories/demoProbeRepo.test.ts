import { beforeEach, describe, expect, it } from 'vitest';

import { clearAllData, seedProbes } from '@/data/db/demoData';
import { HttpError } from '@/data/HttpError';
import { demoProbeRepo } from '@/data/repositories';
import { useDemoStore } from '@/demo/demoStore';

/**
 * Repository → MSW → Dexie 全链路测试。
 * 断言的是真实行为：handler 里的 mockDelay/mockError 真的生效、
 * 写操作真的落到 IndexedDB（fake-indexeddb），而不是被 mock 掉的假链路。
 */
describe('demoProbeRepo', () => {
  beforeEach(async () => {
    await clearAllData();
    useDemoStore.getState().reset();
  });

  it('list 返回分页结构与库中数据一致', async () => {
    await seedProbes(5, 42);

    const page = await demoProbeRepo.list();

    expect(page.total).toBe(5);
    expect(page.items).toHaveLength(5);
    expect(page.items[0]?.id).toBe('probe-42-000');
  });

  it('空库返回空列表（供空态使用），而不是报错', async () => {
    const page = await demoProbeRepo.list();

    expect(page.total).toBe(0);
    expect(page.items).toEqual([]);
  });

  it('toggleCollected 会真正写库：再查一次能看到新状态', async () => {
    await seedProbes(3, 7);
    const before = await demoProbeRepo.list();
    const target = before.items[1];
    expect(target).toBeDefined();

    const updated = await demoProbeRepo.toggleCollected(target!.id);
    expect(updated.collected).toBe(!target!.collected);

    const after = await demoProbeRepo.list();
    expect(after.items.find((probe) => probe.id === target!.id)?.collected).toBe(updated.collected);
  });

  it('勾选不存在的探针返回 404 并收敛成 HttpError', async () => {
    await expect(demoProbeRepo.toggleCollected('probe-does-not-exist')).rejects.toMatchObject({
      status: 404,
    });
  });

  it('界面状态 offline：请求立即失败，并被收敛成 HttpError(0)', async () => {
    await seedProbes(2, 1);
    useDemoStore.getState().patch({ uiState: 'offline' });

    const error = await demoProbeRepo.list().catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(HttpError);
    expect((error as HttpError).status).toBe(0);
    expect((error as HttpError).isOffline).toBe(true);
  });

  it('界面状态 error：抛出服务端给的 500 与文案「灵蕴紊乱」', async () => {
    useDemoStore.getState().patch({ uiState: 'error' });

    const error = await demoProbeRepo.list().catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(HttpError);
    expect((error as HttpError).status).toBe(500);
    expect((error as HttpError).message).toBe('灵蕴紊乱');
  });

  it('恢复正常后请求又能成功（错误态是可逆的）', async () => {
    await seedProbes(2, 1);
    useDemoStore.getState().patch({ uiState: 'error' });
    await expect(demoProbeRepo.list()).rejects.toBeInstanceOf(HttpError);

    useDemoStore.getState().patch({ uiState: 'normal' });
    await expect(demoProbeRepo.list()).resolves.toMatchObject({ total: 2 });
  });
});
