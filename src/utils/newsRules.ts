import type { NewsArticle, NewsQuery, NewsTag, NewsTagCount } from '@/data/contracts/news';
import { countMaskedSubjects, resolveSpoilerVisibility } from '@/utils/spoiler';
import type { SpoilerContext } from '@/utils/spoiler';

/**
 * 资讯域的纯逻辑：查询、排序、标签统计、时间线分组、剧透可见性。
 *
 * 放在 utils（跨层纯函数）：mock 后端的列表接口与前端组件都要用同一套规则，
 * 否则会出现「筛出来的条目和标签角标对不上」这类不一致。
 */

export function normalizeNewsSearch(term: string): string {
  return term.trim().toLowerCase();
}

/** 匹配标题、摘要、标签与来源名（新闻的检索面比词条窄，正文不参与，避免噪音）。 */
export function matchesNewsQuery(article: NewsArticle, normalizedTerm: string): boolean {
  if (normalizedTerm === '') {
    return true;
  }

  const haystacks = [article.title, article.summary, article.source.name, ...article.tags];

  return haystacks.some((text) => text.toLowerCase().includes(normalizedTerm));
}

/**
 * 筛选 + 排序（置顶恒在最前）。
 * 置顶不参与排序：重要动态被时间序压倒就失去置顶的意义。
 */
export function applyNewsQuery(articles: readonly NewsArticle[], query: NewsQuery): NewsArticle[] {
  const term = normalizeNewsSearch(query.search ?? '');
  const requiredTags = query.tags ?? [];

  const filtered = articles.filter((article) => {
    if (query.category !== undefined && article.category !== query.category) {
      return false;
    }
    if (requiredTags.length > 0 && !requiredTags.every((tag) => article.tags.includes(tag))) {
      return false;
    }
    return matchesNewsQuery(article, term);
  });

  return sortNewsArticles(filtered, query.sort ?? 'latest');
}

export function sortNewsArticles(
  articles: readonly NewsArticle[],
  sort: NonNullable<NewsQuery['sort']>,
): NewsArticle[] {
  const direction = sort === 'oldest' ? 1 : -1;

  return [...articles].sort((left, right) => {
    if (left.pinned !== right.pinned) {
      return left.pinned ? -1 : 1;
    }
    return direction * left.publishedAt.localeCompare(right.publishedAt);
  });
}

/** 标签统计：只统计出现过的标签，按条数降序（筛选条角标用）。 */
export function collectTagCounts(articles: readonly NewsArticle[]): NewsTagCount[] {
  const counts = new Map<NewsTag, number>();

  for (const article of articles) {
    for (const tag of article.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((left, right) => right.count - left.count || left.tag.localeCompare(right.tag));
}

export interface NewsDayGroup {
  /** YYYY-MM-DD（本地时区）。 */
  dateKey: string;
  articles: NewsArticle[];
}

/** 按天分组（用于时间线），组内保持传入顺序，组间按日期倒序。 */
export function groupNewsByDay(articles: readonly NewsArticle[]): NewsDayGroup[] {
  const groups = new Map<string, NewsArticle[]>();

  for (const article of articles) {
    const dateKey = toLocalDateKey(article.publishedAt);
    const bucket = groups.get(dateKey);

    if (bucket === undefined) {
      groups.set(dateKey, [article]);
    } else {
      bucket.push(article);
    }
  }

  return [...groups.entries()]
    .map(([dateKey, items]) => ({ dateKey, articles: items }))
    .sort((left, right) => right.dateKey.localeCompare(left.dateKey));
}

function toLocalDateKey(iso: string): string {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) {
    return '0000-00-00';
  }

  const date = new Date(time);
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** 日期键 → 今天/昨天/具体日期，交给组件用 COPY 的文案渲染。 */
export type NewsDayKind = 'today' | 'yesterday' | 'dated';

export function resolveDayKind(dateKey: string, now: Date = new Date()): NewsDayKind {
  const todayKey = toLocalDateKey(now.toISOString());
  if (dateKey === todayKey) {
    return 'today';
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  return dateKey === toLocalDateKey(yesterday.toISOString()) ? 'yesterday' : 'dated';
}

/* ── 剧透遮罩（委托给站级原语 utils/spoiler） ─────────────────────── */

export type { SpoilerContext, SpoilerVisibility as NewsVisibility } from '@/utils/spoiler';

/**
 * 单条资讯的可见性。
 * 规则本身在 utils/spoiler（资讯 / 攻略 / 论坛共用），这里只保留资讯侧的语义化入口。
 */
export function resolveNewsVisibility(article: NewsArticle, context: SpoilerContext) {
  return resolveSpoilerVisibility(article, context);
}

/** 需要遮罩的条数（给筛选条上的提示用）。 */
export function countMaskedArticles(
  articles: readonly NewsArticle[],
  context: SpoilerContext,
): number {
  return countMaskedSubjects(articles, context);
}
