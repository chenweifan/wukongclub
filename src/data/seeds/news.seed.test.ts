import { describe, expect, it } from 'vitest';

import { NEWS_SEED_COUNT, NEWS_SEED_INPUTS, createNewsSeed } from '@/data/seeds/news.seed';
import { NEWS_CATEGORIES, NEWS_TAGS } from '@/data/contracts/news';

/**
 * 资讯种子完整性。
 * 最容易出的问题：标签写成契约外的值、来源类型与 url 不一致（编辑内容却带外链）、
 * 剧透级别越界、置顶过多。这些在运行时只会表现为「筛选少了几个结果」，很难察觉。
 */
describe('资讯种子', () => {
  const now = new Date('2026-02-14T12:00:00.000Z');
  const articles = createNewsSeed(now);

  it('数量与输入表一致，规模足够演示时间线', () => {
    expect(articles).toHaveLength(NEWS_SEED_COUNT);
    expect(articles.length).toBeGreaterThanOrEqual(24);
    expect(NEWS_SEED_INPUTS).toHaveLength(NEWS_SEED_COUNT);
  });

  it('id 唯一', () => {
    const ids = articles.map((article) => article.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('类目与标签都在契约范围内', () => {
    for (const article of articles) {
      expect(NEWS_CATEGORIES).toContain(article.category);
      expect(article.tags.length).toBeGreaterThan(0);
      for (const tag of article.tags) {
        expect(NEWS_TAGS).toContain(tag);
      }
    }
  });

  it('标题、摘要、正文都不为空；正文段落无空串', () => {
    for (const article of articles) {
      expect(article.title.trim().length).toBeGreaterThan(4);
      expect(article.summary.length).toBeGreaterThan(10);
      expect(article.body.length).toBeGreaterThan(0);
      expect(article.body.every((paragraph) => paragraph.trim().length > 0)).toBe(true);
    }
  });

  it('来源类型与 url 一致：本站编辑内容不得带外链', () => {
    for (const article of articles) {
      if (article.source.kind === 'editorial') {
        expect(article.source.url, `${article.id} 是编辑内容却带外链`).toBeNull();
      } else {
        expect(article.source.url, `${article.id} 是外部渠道却没有链接`).not.toBeNull();
      }
    }
  });

  it('站外来源都是 http(s) 链接（避免 javascript: 之类的地址）', () => {
    for (const article of articles) {
      if (article.source.url === null) {
        continue;
      }
      expect(article.source.url.startsWith('https://')).toBe(true);
    }
  });

  it('发布时间都在过去且不晚于当前时刻（相对种子时间）', () => {
    for (const article of articles) {
      expect(Date.parse(article.publishedAt)).toBeLessThanOrEqual(now.getTime());
    }
  });

  it('剧透级别覆盖 0 / 1 / 2 三档（否则遮罩逻辑没被真实数据覆盖）', () => {
    const levels = new Set(articles.map((article) => article.spoilerLevel));
    expect([...levels].sort()).toEqual([0, 1, 2]);
  });

  it('置顶条数克制（2 条），否则置顶就失去意义', () => {
    expect(articles.filter((article) => article.pinned)).toHaveLength(2);
  });

  it('封面是内联 SVG（不引入二进制素材）', () => {
    for (const article of articles) {
      expect(article.coverUrl.startsWith('data:image/svg+xml,')).toBe(true);
    }
  });

  it('同一时刻重复生成结果一致（确定性）', () => {
    expect(createNewsSeed(now).map((article) => article.id)).toEqual(
      articles.map((article) => article.id),
    );
  });

  it('不同种子时间会平移发布时间（时间线不会永远是同一批日期）', () => {
    const later = createNewsSeed(new Date(now.getTime() + 86_400_000));
    expect(later[1]?.publishedAt).not.toBe(articles[1]?.publishedAt);
  });
});
