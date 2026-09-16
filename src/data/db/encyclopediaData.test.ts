import { beforeEach, describe, expect, it } from 'vitest';

import { clearAllData } from '@/data/db/demoData';
import {
  applyWikiQuery,
  getWikiEntry,
  getWikiGraph,
  listWikiEntries,
  readAllWikiEntries,
  readFavoriteIds,
  seedWikiEntries,
  sortWikiEntries,
  toggleFavorite,
} from '@/data/db/encyclopediaData';
import { HttpError } from '@/data/HttpError';
import { normalizeSearchTerm } from '@/utils/wikiSearch';

/**
 * 百科「服务端」行为测试：筛选、排序、图谱、收藏。
 * 断言的是纯函数与服务语义，不经过 HTTP —— HTTP 那一层由 repository 测试覆盖。
 */
describe('applyWikiQuery（筛选与排序）', () => {
  let entries: Awaited<ReturnType<typeof readAllWikiEntries>>;

  beforeEach(async () => {
    await clearAllData();
    await seedWikiEntries();
    entries = await readAllWikiEntries();
  });

  it('默认过滤掉含剧透的词条（本站的既定立场）', () => {
    const visible = applyWikiQuery(entries, {});
    expect(visible.length).toBeGreaterThan(0);
    expect(visible.every((entry) => entry.spoilerLevel === 0)).toBe(true);
  });

  it('includeSpoilers=true 时包含剧透词条', () => {
    const withSpoilers = applyWikiQuery(entries, { includeSpoilers: true });
    expect(withSpoilers.length).toBeGreaterThan(applyWikiQuery(entries, {}).length);
    expect(withSpoilers.some((entry) => entry.spoilerLevel > 0)).toBe(true);
  });

  it('按分类筛选', () => {
    const bosses = applyWikiQuery(entries, { category: 'boss', includeSpoilers: true });
    expect(bosses.length).toBeGreaterThan(0);
    expect(bosses.every((entry) => entry.category === 'boss')).toBe(true);
  });

  it('按章节与稀有度筛选', () => {
    const chapter1 = applyWikiQuery(entries, { chapter: 1, includeSpoilers: true });
    expect(chapter1.every((entry) => entry.chapter === 1)).toBe(true);

    const fiveStars = applyWikiQuery(entries, { rarity: 5, includeSpoilers: true });
    expect(fiveStars.every((entry) => entry.rarity === 5)).toBe(true);
    expect(fiveStars.length).toBeGreaterThan(0);
  });

  it('组合筛选取交集', () => {
    const result = applyWikiQuery(entries, {
      chapter: 1,
      category: 'boss',
      includeSpoilers: true,
    });

    expect(result.every((entry) => entry.chapter === 1 && entry.category === 'boss')).toBe(true);
  });

  it('搜索命中名称与拼音首字母', () => {
    const byName = applyWikiQuery(entries, { search: '黑风山', includeSpoilers: true });
    expect(byName.map((entry) => entry.id)).toContain('wiki-heifengshan');

    const byInitials = applyWikiQuery(entries, { search: 'hfs', includeSpoilers: true });
    expect(byInitials.map((entry) => entry.id)).toContain('wiki-heifengshan');
  });

  it('无匹配时返回空数组（边界）', () => {
    expect(applyWikiQuery(entries, { search: '不存在的词条xyz', includeSpoilers: true })).toEqual(
      [],
    );
  });

  it('相关度排序把最贴切的排在最前', () => {
    const result = applyWikiQuery(entries, { search: '黑风山', includeSpoilers: true });
    expect(result[0]?.id).toBe('wiki-heifengshan');
  });

  it('稀有度排序：从高到低', () => {
    const sorted = sortWikiEntries(entries, 'rarity', '');
    for (let index = 1; index < sorted.length; index += 1) {
      const previous = sorted[index - 1];
      const current = sorted[index];
      expect(previous?.rarity ?? 0).toBeGreaterThanOrEqual(current?.rarity ?? 0);
    }
  });

  it('章节排序：从小到大，同章内高稀有度在前', () => {
    const sorted = sortWikiEntries(entries, 'chapter', '');

    for (let index = 1; index < sorted.length; index += 1) {
      const previous = sorted[index - 1];
      const current = sorted[index];
      expect(previous?.chapter ?? 0).toBeLessThanOrEqual(current?.chapter ?? 0);

      if (previous?.chapter === current?.chapter) {
        expect(previous?.rarity ?? 0).toBeGreaterThanOrEqual(current?.rarity ?? 0);
      }
    }
  });

  it('名称排序按中文拼音序（localeCompare zh）', () => {
    const sorted = sortWikiEntries(entries, 'name', '');
    const names = sorted.map((entry) => entry.name);
    const expected = [...names].sort((left, right) => left.localeCompare(right, 'zh-Hans-CN'));
    expect(names).toEqual(expected);
  });

  it('排序不修改入参数组（纯函数）', () => {
    const before = entries.map((entry) => entry.id);
    sortWikiEntries(entries, 'rarity', '');
    expect(entries.map((entry) => entry.id)).toEqual(before);
  });

  it('空关键词的相关度排序退回章节序（结果稳定）', () => {
    const first = sortWikiEntries(entries, 'relevance', normalizeSearchTerm(''));
    const second = sortWikiEntries(entries, 'relevance', '');
    expect(first.map((entry) => entry.id)).toEqual(second.map((entry) => entry.id));
  });
});

describe('listWikiEntries（分页）', () => {
  beforeEach(async () => {
    await clearAllData();
    await seedWikiEntries();
  });

  it('默认分页返回第一页与总数', async () => {
    const page = await listWikiEntries({ includeSpoilers: true });

    expect(page.page).toBe(1);
    expect(page.total).toBeGreaterThan(0);
    expect(page.items.length).toBeLessThanOrEqual(page.pageSize);
  });

  it('分页参数生效且不重叠', async () => {
    const first = await listWikiEntries({ includeSpoilers: true, page: 1 });
    const filtered = await listWikiEntries({
      includeSpoilers: true,
      pageSize: first.items.length,
      page: 2,
    });

    const firstIds = new Set(first.items.map((entry) => entry.id));
    expect(filtered.items.some((entry) => firstIds.has(entry.id))).toBe(false);
  });
});

describe('getWikiEntry / getWikiGraph', () => {
  beforeEach(async () => {
    await clearAllData();
    await seedWikiEntries();
  });

  it('详情按 id 取到词条', async () => {
    const entry = await getWikiEntry('wiki-heifengshan');
    expect(entry.name).toBe('黑风山');
  });

  it('详情不存在时 404', async () => {
    await expect(getWikiEntry('wiki-nope')).rejects.toBeInstanceOf(HttpError);
    await expect(getWikiEntry('wiki-nope')).rejects.toMatchObject({ status: 404 });
  });

  it('图谱包含中心节点与其一跳邻居，且连线两端都在节点集合里', async () => {
    const graph = await getWikiGraph('wiki-heifengshan');

    expect(graph.nodes[0]?.isRoot).toBe(true);
    expect(graph.nodes.length).toBeGreaterThan(1);

    const ids = new Set(graph.nodes.map((node) => node.id));
    for (const link of graph.links) {
      expect(ids.has(link.source)).toBe(true);
      expect(ids.has(link.target)).toBe(true);
    }
  });

  it('反向邻居也会被连上（有向关联同样能成图）', async () => {
    // 广智单向关联黑风山：以黑风山为中心时，广智仍应出现在图谱里
    const graph = await getWikiGraph('wiki-heifengshan');
    expect(graph.nodes.map((node) => node.id)).toContain('wiki-guangzhi');
  });

  it('连线不重复且无自环', async () => {
    const graph = await getWikiGraph('wiki-heixiongjing');
    const keys = graph.links.map((link) => [link.source, link.target].sort().join('→'));

    expect(new Set(keys).size).toBe(keys.length);
    expect(graph.links.every((link) => link.source !== link.target)).toBe(true);
  });

  it('图谱对不存在的词条 404', async () => {
    await expect(getWikiGraph('wiki-nope')).rejects.toMatchObject({ status: 404 });
  });
});

describe('收藏', () => {
  beforeEach(async () => {
    await clearAllData();
    await seedWikiEntries();
  });

  it('切换收藏返回最新列表；再切一次回到原状（幂等）', async () => {
    const first = await toggleFavorite('device:test', 'wiki-heifengshan');
    expect(first.favorited).toBe(true);
    expect(first.ids).toEqual(['wiki-heifengshan']);

    const second = await toggleFavorite('device:test', 'wiki-heifengshan');
    expect(second.favorited).toBe(false);
    expect(second.ids).toEqual([]);
  });

  it('不同归属者的收藏互不影响（账号 vs 设备）', async () => {
    await toggleFavorite('device:test', 'wiki-heifengshan');
    await toggleFavorite('user:u1', 'wiki-heixiongjing');

    expect(await readFavoriteIds('device:test')).toEqual(['wiki-heifengshan']);
    expect(await readFavoriteIds('user:u1')).toEqual(['wiki-heixiongjing']);
  });

  it('收藏不存在的词条返回 404，且不写库', async () => {
    await expect(toggleFavorite('device:test', 'wiki-nope')).rejects.toMatchObject({ status: 404 });
    expect(await readFavoriteIds('device:test')).toEqual([]);
  });

  it('收藏顺序按加入时间（后加的排在后面）', async () => {
    await toggleFavorite('device:test', 'wiki-heifengshan');
    await toggleFavorite('device:test', 'wiki-heixiongjing');

    expect(await readFavoriteIds('device:test')).toEqual(['wiki-heifengshan', 'wiki-heixiongjing']);
  });

  it('清空数据会一并清掉收藏（否则会留下指向不存在词条的幽灵收藏）', async () => {
    await toggleFavorite('device:test', 'wiki-heifengshan');
    await clearAllData();

    expect(await readFavoriteIds('device:test')).toEqual([]);
  });
});
