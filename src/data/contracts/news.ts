import { isRecord, isSpoilerLevel } from '@/data/contracts/common';
import type { SpoilerLevel } from '@/data/contracts/common';

/**
 * 资讯域契约（协议阶段 2「资讯」模块）。
 *
 * 版权与口径：本站是**非官方粉丝站**，因此这里的内容是「粉丝站编辑内容 + 官方渠道聚合位」，
 * 而不是伪造的官方公告。每一条都带 `source`，站外来源在演示模式下会被拦截并提示
 * （见阶段 1 的外链拦截），站内来源则没有 url。
 */
export const NEWS_CATEGORIES = ['official', 'update', 'event', 'media', 'community'] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export const NEWS_SOURCE_KINDS = ['official', 'media', 'community', 'editorial'] as const;

export type NewsSourceKind = (typeof NEWS_SOURCE_KINDS)[number];

export interface NewsSource {
  name: string;
  /** 站外链接；null 表示站内编辑内容（没有可跳转的来源）。 */
  url: string | null;
  kind: NewsSourceKind;
}

/** 标签是固定集合：自由字符串会让筛选条无法穷举，也会让统计失去意义。 */
export const NEWS_TAGS = [
  'version',
  'balance',
  'dlc',
  'art',
  'music',
  'interview',
  'esports',
  'merch',
  'guide',
  'community',
] as const;

export type NewsTag = (typeof NEWS_TAGS)[number];

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  /** 正文段落；展开卡片时展示，剧透遮罩同样作用于它。 */
  body: readonly string[];
  category: NewsCategory;
  tags: readonly NewsTag[];
  source: NewsSource;
  publishedAt: string;
  spoilerLevel: SpoilerLevel;
  /** 置顶（重要动态排在最前，不受排序影响）。 */
  pinned: boolean;
  /** 封面：内联 SVG 印章，与影神图词条同一套做法，不引入二进制素材。 */
  coverUrl: string;
}

export function isNewsCategory(value: unknown): value is NewsCategory {
  return typeof value === 'string' && (NEWS_CATEGORIES as readonly string[]).includes(value);
}

export function isNewsTag(value: unknown): value is NewsTag {
  return typeof value === 'string' && (NEWS_TAGS as readonly string[]).includes(value);
}

export function isNewsSourceKind(value: unknown): value is NewsSourceKind {
  return typeof value === 'string' && (NEWS_SOURCE_KINDS as readonly string[]).includes(value);
}

export function isNewsSource(value: unknown): value is NewsSource {
  return (
    isRecord(value) &&
    typeof value.name === 'string' &&
    (value.url === null || typeof value.url === 'string') &&
    isNewsSourceKind(value.kind)
  );
}

export function isNewsArticle(value: unknown): value is NewsArticle {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.summary === 'string' &&
    Array.isArray(value.body) &&
    value.body.every((paragraph) => typeof paragraph === 'string') &&
    isNewsCategory(value.category) &&
    Array.isArray(value.tags) &&
    value.tags.every((tag) => isNewsTag(tag)) &&
    isNewsSource(value.source) &&
    typeof value.publishedAt === 'string' &&
    isSpoilerLevel(value.spoilerLevel) &&
    typeof value.pinned === 'boolean' &&
    typeof value.coverUrl === 'string'
  );
}

/* ── 查询契约 ─────────────────────────────────────────────────────── */

export const NEWS_SORT_OPTIONS = ['latest', 'oldest'] as const;

export type NewsSort = (typeof NEWS_SORT_OPTIONS)[number];

export interface NewsQuery {
  category?: NewsCategory;
  /** 标签交集：选中多个时要求同时含全部标签（更符合「缩小范围」的直觉）。 */
  tags?: readonly NewsTag[];
  search?: string;
  sort?: NewsSort;
  page?: number;
  pageSize?: number;
}

export function isNewsSort(value: unknown): value is NewsSort {
  return typeof value === 'string' && (NEWS_SORT_OPTIONS as readonly string[]).includes(value);
}

/** 标签及其条数（筛选条上的角标）。 */
export interface NewsTagCount {
  tag: NewsTag;
  count: number;
}

export function isNewsTagCount(value: unknown): value is NewsTagCount {
  return isRecord(value) && isNewsTag(value.tag) && typeof value.count === 'number';
}

export function isNewsTagCountList(value: unknown): value is readonly NewsTagCount[] {
  return Array.isArray(value) && value.every((item) => isNewsTagCount(item));
}
