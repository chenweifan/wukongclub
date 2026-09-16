import { describe, expect, it } from 'vitest';

import { createNewsSeed } from '@/data/seeds/news.seed';
import type { NewsArticle } from '@/data/contracts/news';
import {
  applyNewsQuery,
  collectTagCounts,
  countMaskedArticles,
  groupNewsByDay,
  matchesNewsQuery,
  normalizeNewsSearch,
  resolveDayKind,
  resolveNewsVisibility,
  sortNewsArticles,
} from '@/utils/newsRules';

const NOW = new Date('2026-02-14T12:00:00.000Z');
const seed = createNewsSeed(NOW);

function requireArticle(id: string): NewsArticle {
  const article = seed.find((item) => item.id === id);
  if (article === undefined) {
    throw new Error(`测试前置数据缺失：${id}`);
  }
  return article;
}

describe('applyNewsQuery（筛选与排序）', () => {
  it('无条件下返回全部条目', () => {
    expect(applyNewsQuery(seed, {})).toHaveLength(seed.length);
  });

  it('置顶条目恒在最前（不参与时间排序）', () => {
    const latest = applyNewsQuery(seed, { sort: 'latest' });
    const oldest = applyNewsQuery(seed, { sort: 'oldest' });

    expect(latest[0]?.pinned).toBe(true);
    expect(oldest[0]?.pinned).toBe(true);
  });

  it('按类目筛选', () => {
    const events = applyNewsQuery(seed, { category: 'event' });
    expect(events.length).toBeGreaterThan(0);
    expect(events.every((article) => article.category === 'event')).toBe(true);
  });

  it('多标签是「同时满足」而不是并集', () => {
    const both = applyNewsQuery(seed, { tags: ['version', 'balance'] });
    expect(both.every((article) => article.tags.includes('version'))).toBe(true);
    expect(both.every((article) => article.tags.includes('balance'))).toBe(true);

    const onlyVersion = applyNewsQuery(seed, { tags: ['version'] });
    expect(onlyVersion.length).toBeGreaterThanOrEqual(both.length);
  });

  it('搜索命中标题、摘要、标签与来源名', () => {
    expect(applyNewsQuery(seed, { search: '剧透' }).length).toBeGreaterThan(0);
    expect(applyNewsQuery(seed, { search: '本站编辑部' }).length).toBeGreaterThan(0);
    expect(applyNewsQuery(seed, { search: '编辑' }).length).toBeGreaterThan(0);
  });

  it('无匹配返回空数组（边界）', () => {
    expect(applyNewsQuery(seed, { search: '不存在的关键词zzz' })).toEqual([]);
  });

  it('latest / oldest 时间序相反（置顶之外的条目）', () => {
    const latest = applyNewsQuery(seed, { sort: 'latest' }).filter((item) => !item.pinned);
    const oldest = applyNewsQuery(seed, { sort: 'oldest' }).filter((item) => !item.pinned);

    expect(latest.map((item) => item.id)).toEqual([...oldest.map((item) => item.id)].reverse());
  });

  it('不修改入参数组（纯函数）', () => {
    const before = seed.map((article) => article.id);
    sortNewsArticles(seed, 'oldest');
    expect(seed.map((article) => article.id)).toEqual(before);
  });

  it('超长搜索词不抛错（边界）', () => {
    expect(applyNewsQuery(seed, { search: 'a'.repeat(5000) })).toEqual([]);
  });
});

describe('matchesNewsQuery / normalizeNewsSearch', () => {
  it('归一化去空白并转小写', () => {
    expect(normalizeNewsSearch('  Steam  ')).toBe('steam');
    expect(normalizeNewsSearch('   ')).toBe('');
  });

  it('忽略大小写', () => {
    const article = requireArticle('news-002');
    expect(matchesNewsQuery(article, normalizeNewsSearch('STEAM'))).toBe(true);
  });

  it('空关键词视为命中', () => {
    expect(matchesNewsQuery(requireArticle('news-002'), '')).toBe(true);
  });
});

describe('collectTagCounts（标签统计）', () => {
  it('统计出现过的标签，按条数降序', () => {
    const counts = collectTagCounts(seed);

    expect(counts.length).toBeGreaterThan(0);
    for (let index = 1; index < counts.length; index += 1) {
      expect(counts[index - 1]?.count ?? 0).toBeGreaterThanOrEqual(counts[index]?.count ?? 0);
    }
  });

  it('计数与筛选结果一致（角标不会骗人）', () => {
    for (const entry of collectTagCounts(seed)) {
      expect(applyNewsQuery(seed, { tags: [entry.tag] })).toHaveLength(entry.count);
    }
  });

  it('空数组返回空统计（边界）', () => {
    expect(collectTagCounts([])).toEqual([]);
  });
});

describe('groupNewsByDay（时间线分组）', () => {
  it('按本地日期分组，组间倒序', () => {
    const groups = groupNewsByDay(seed);
    const keys = groups.map((group) => group.dateKey);

    expect(keys).toEqual([...keys].sort().reverse());
    expect(groups.reduce((total, group) => total + group.articles.length, 0)).toBe(seed.length);
  });

  it('组内保持传入顺序（排序结果不被分组打乱）', () => {
    const sorted = applyNewsQuery(seed, { sort: 'latest' });
    const groups = groupNewsByDay(sorted);

    const flattened = groups.flatMap((group) => group.articles.map((article) => article.id));
    expect(flattened).toEqual(sorted.map((article) => article.id));
  });

  it('空数组返回空分组（边界）', () => {
    expect(groupNewsByDay([])).toEqual([]);
  });

  it('时间非法时归入兜底分组，而不是丢弃', () => {
    const broken: NewsArticle = { ...requireArticle('news-002'), publishedAt: 'not-a-date' };
    const groups = groupNewsByDay([broken]);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.dateKey).toBe('0000-00-00');
  });
});

describe('resolveDayKind（今天 / 昨天 / 具体日期）', () => {
  it('识别今天与昨天（按本地时区）', () => {
    const now = new Date(2026, 1, 14, 12, 0, 0);

    expect(resolveDayKind('2026-02-14', now)).toBe('today');
    expect(resolveDayKind('2026-02-13', now)).toBe('yesterday');
    expect(resolveDayKind('2026-02-12', now)).toBe('dated');
  });

  it('跨月边界正确', () => {
    const now = new Date(2026, 2, 1, 9, 0, 0);
    expect(resolveDayKind('2026-02-28', now)).toBe('yesterday');
  });
});

describe('剧透可见性', () => {
  const context = { spoilerVisible: false, revealedIds: [] as readonly string[] };

  it('无剧透条目始终可见', () => {
    const article = seed.find((item) => item.spoilerLevel === 0);
    expect(resolveNewsVisibility(requireArticle(article?.id ?? ''), context)).toBe('full');
  });

  it('含剧透条目在保护开启时被遮罩', () => {
    expect(resolveNewsVisibility(requireArticle('news-009'), context)).toBe('masked');
  });

  it('全局开关打开后全部可见', () => {
    expect(
      resolveNewsVisibility(requireArticle('news-009'), { ...context, spoilerVisible: true }),
    ).toBe('full');
  });

  it('单条揭开只影响这一条', () => {
    const revealed = { ...context, revealedIds: ['news-009'] };

    expect(resolveNewsVisibility(requireArticle('news-009'), revealed)).toBe('full');
    expect(resolveNewsVisibility(requireArticle('news-019'), revealed)).toBe('masked');
  });

  it('countMaskedArticles 与逐条判定一致', () => {
    const count = countMaskedArticles(seed, context);
    const manual = seed.filter(
      (article) => resolveNewsVisibility(article, context) === 'masked',
    ).length;

    expect(count).toBe(manual);
    expect(count).toBeGreaterThan(0);
  });

  it('空数组计数为 0（边界）', () => {
    expect(countMaskedArticles([], context)).toBe(0);
  });
});
