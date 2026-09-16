import { beforeEach, describe, expect, it } from 'vitest';

import { clearAllData } from '@/data/db/demoData';
import { seedWikiEntries } from '@/data/db/encyclopediaData';
import { HttpError } from '@/data/HttpError';
import { authRepo, encyclopediaRepo } from '@/data/repositories';
import { useDemoStore } from '@/demo/demoStore';

/**
 * 百科 Repository 的集成测试：真实走 MSW + Dexie。
 * 重点覆盖「查询参数确实被服务端使用」与「收藏的设备/账号归属」这两件容易写错的事。
 */
describe('encyclopediaRepo', () => {
  beforeEach(async () => {
    await clearAllData();
    await seedWikiEntries();
    useDemoStore.getState().patch({ spoiler: true });
  });

  it('list 返回分页结构', async () => {
    const page = await encyclopediaRepo.list({});

    expect(page.total).toBeGreaterThan(40);
    expect(page.items.length).toBeGreaterThan(0);
    expect(page.items[0]?.name.length).toBeGreaterThan(0);
  });

  it('筛选参数经由 HTTP 传到服务端（而不是前端过滤）', async () => {
    const page = await encyclopediaRepo.list({ category: 'boss', chapter: 1, rarity: 5 });

    expect(page.items.length).toBeGreaterThan(0);
    expect(
      page.items.every(
        (entry) => entry.category === 'boss' && entry.chapter === 1 && entry.rarity === 5,
      ),
    ).toBe(true);
  });

  it('搜索参数生效：拼音首字母也能命中', async () => {
    const page = await encyclopediaRepo.list({ search: 'hfs', sort: 'relevance' });
    expect(page.items.map((entry) => entry.id)).toContain('wiki-heifengshan');
  });

  it('剧透开关关闭时，含剧透的词条不会出现在结果里', async () => {
    useDemoStore.getState().patch({ spoiler: false });

    const page = await encyclopediaRepo.list({ category: 'boss' });
    expect(page.items.every((entry) => entry.spoilerLevel === 0)).toBe(true);
  });

  it('detail 不存在时 404', async () => {
    await expect(encyclopediaRepo.detail('wiki-nope')).rejects.toMatchObject({ status: 404 });
  });

  it('graph 返回节点与连线', async () => {
    const graph = await encyclopediaRepo.graph('wiki-heixiongjing');

    expect(graph.nodes.length).toBeGreaterThan(1);
    expect(graph.links.length).toBeGreaterThan(0);
    expect(graph.nodes.filter((node) => node.isRoot)).toHaveLength(1);
  });

  it('未登录时收藏归属设备，登录后归属账号（两套列表互不干扰）', async () => {
    const asDevice = await encyclopediaRepo.toggleFavorite('wiki-heifengshan');
    expect(asDevice.favorited).toBe(true);
    expect(asDevice.ids).toContain('wiki-heifengshan');

    await authRepo.demoLogin();

    // 登录后是用户维度：还没有收藏
    expect(await encyclopediaRepo.favoriteIds()).toEqual([]);

    const asUser = await encyclopediaRepo.toggleFavorite('wiki-heixiongjing');
    expect(asUser.ids).toEqual(['wiki-heixiongjing']);
  });

  it('收藏切换是可逆的', async () => {
    await encyclopediaRepo.toggleFavorite('wiki-heifengshan');
    await encyclopediaRepo.toggleFavorite('wiki-heifengshan');

    expect(await encyclopediaRepo.favoriteIds()).toEqual([]);
  });

  it('断网态：列表与收藏都变成 HttpError(0)（界面据此展示统一断网态）', async () => {
    useDemoStore.getState().patch({ uiState: 'offline' });

    const listError = await encyclopediaRepo.list({}).catch((caught: unknown) => caught);
    expect(listError).toBeInstanceOf(HttpError);
    expect((listError as HttpError).isOffline).toBe(true);

    await expect(encyclopediaRepo.favoriteIds()).rejects.toBeInstanceOf(HttpError);
  });

  it('错误态：返回 500 与「灵蕴紊乱」', async () => {
    useDemoStore.getState().patch({ uiState: 'error' });
    await expect(encyclopediaRepo.list({})).rejects.toMatchObject({ status: 500 });
  });
});
