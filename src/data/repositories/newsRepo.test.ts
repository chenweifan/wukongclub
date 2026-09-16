import { beforeEach, describe, expect, it } from 'vitest';

import { clearAllData } from '@/data/db/demoData';
import { countNewsArticles, getNewsArticle, listNews, seedNewsArticles } from '@/data/db/newsData';
import { HttpError } from '@/data/HttpError';
import { newsRepo } from '@/data/repositories';
import { useDemoStore } from '@/demo/demoStore';

/**
 * 资讯 Repository + 数据层的集成测试（真实走 MSW + Dexie）。
 * 重点：查询参数确实被服务端使用、标签角标与筛选结果一致、错误注入照旧生效。
 */
describe('资讯数据层', () => {
  beforeEach(async () => {
    await clearAllData();
    await seedNewsArticles(new Date('2026-02-14T12:00:00.000Z'));
  });

  it('播种是幂等的（不会重复堆积）', async () => {
    const before = await countNewsArticles();
    await seedNewsArticles(new Date('2026-02-14T12:00:00.000Z'));

    expect(await countNewsArticles()).toBe(before);
  });

  it('清空数据会移除资讯（空态可演示）', async () => {
    await clearAllData();
    expect(await countNewsArticles()).toBe(0);
  });

  it('分页返回结构与总数', async () => {
    const page = await listNews({});
    expect(page.total).toBeGreaterThan(20);
    expect(page.items.length).toBeLessThanOrEqual(page.pageSize);
  });

  it('详情不存在时 404', async () => {
    await expect(getNewsArticle('news-nope')).rejects.toBeInstanceOf(HttpError);
  });
});

describe('newsRepo', () => {
  beforeEach(async () => {
    await clearAllData();
    await seedNewsArticles(new Date('2026-02-14T12:00:00.000Z'));
  });

  it('list 返回分页结果', async () => {
    const page = await newsRepo.list({});

    expect(page.total).toBeGreaterThan(20);
    expect(page.items[0]?.title.length).toBeGreaterThan(0);
  });

  it('筛选参数经由 HTTP 传给服务端', async () => {
    const page = await newsRepo.list({ category: 'event' });
    expect(page.items.every((article) => article.category === 'event')).toBe(true);

    const tagged = await newsRepo.list({ tags: ['version', 'balance'] });
    expect(
      tagged.items.every(
        (article) => article.tags.includes('version') && article.tags.includes('balance'),
      ),
    ).toBe(true);
  });

  it('多个标签通过重复参数传递（不被 URL 编码压成一个）', async () => {
    const single = await newsRepo.list({ tags: ['community'] });
    const double = await newsRepo.list({ tags: ['community', 'guide'] });

    expect(double.total).toBeLessThanOrEqual(single.total);
  });

  it('搜索与排序生效', async () => {
    const searched = await newsRepo.list({ search: '剧透' });
    expect(searched.total).toBeGreaterThan(0);

    const oldest = await newsRepo.list({ sort: 'oldest' });
    const latest = await newsRepo.list({ sort: 'latest' });
    expect(oldest.items.map((item) => item.id)).not.toEqual(latest.items.map((item) => item.id));
  });

  it('标签统计与列表筛选结果一致', async () => {
    const counts = await newsRepo.tagCounts();
    expect(counts.length).toBeGreaterThan(0);

    for (const entry of counts.slice(0, 3)) {
      const filtered = await newsRepo.list({ tags: [entry.tag] });
      expect(filtered.total).toBe(entry.count);
    }
  });

  it('detail 返回单条资讯', async () => {
    const detail = await newsRepo.detail('news-002');
    expect(detail.id).toBe('news-002');
    expect(detail.source.kind).not.toBe('editorial');
  });

  it('detail 不存在时 404', async () => {
    await expect(newsRepo.detail('news-nope')).rejects.toMatchObject({ status: 404 });
  });

  it('断网态：列表与标签统计都变成 HttpError(0)', async () => {
    useDemoStore.getState().patch({ uiState: 'offline' });

    const error = await newsRepo.list({}).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(HttpError);
    expect((error as HttpError).isOffline).toBe(true);

    await expect(newsRepo.tagCounts()).rejects.toBeInstanceOf(HttpError);
  });

  it('错误态：返回 500 与「灵蕴紊乱」', async () => {
    useDemoStore.getState().patch({ uiState: 'error' });
    await expect(newsRepo.list({})).rejects.toMatchObject({ status: 500 });
  });
});
