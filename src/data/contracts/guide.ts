import { SPOILER_LEVELS, isRecord, isSpoilerLevel } from '@/data/contracts/common';
import type { SpoilerLevel } from '@/data/contracts/common';
import { CHAPTERS, isChapter } from '@/data/contracts/encyclopedia';
import type { Chapter } from '@/data/contracts/encyclopedia';

/**
 * 攻略库契约（协议阶段 2「攻略」模块：BOSS / 配装 / 结局分类、难度标签、步骤时间轴）。
 *
 * 两点设计说明：
 * 1. `chapter` 是必填的 —— 这个游戏的内容天然按章节组织，连「配装思路」也有
 *    最适用的章节；允许为空会让章节筛选出现「筛不到又不算漏」的灰色地带。
 * 2. **剧透级别下沉到步骤**：一条 BOSS 攻略整体可以标「含剧情」，
 *    但真正涉及结局的那一步单独标 2 级 —— 步骤级遮罩正是为此存在的。
 */

export const GUIDE_KINDS = ['boss', 'build', 'ending'] as const;

export type GuideKind = (typeof GUIDE_KINDS)[number];

export const GUIDE_DIFFICULTIES = ['story', 'normal', 'hard', 'challenge'] as const;

export type GuideDifficulty = (typeof GUIDE_DIFFICULTIES)[number];

/**
 * 攻略标签（自由筛选维度）。
 * 注意 `challenge` 既是难度档位也是标签：难度说的是「这仗多难」，
 * 标签说的是「这篇内容是挑战向打法」，两者并不等价。
 */
export const GUIDE_TAGS = [
  'beginner',
  'no-hit',
  'speedrun',
  'collect',
  'ending',
  'build',
  'story',
  'secret',
  'challenge',
] as const;

export type GuideTag = (typeof GUIDE_TAGS)[number];

export interface GuideStep {
  id: string;
  title: string;
  detail: string;
  /** 关键提示：写手最想让你记住的一句话。 */
  tip?: string;
  /** 预估耗时（分钟），时间轴上的合计由纯函数算。 */
  minutes?: number;
  spoilerLevel: SpoilerLevel;
}

/**
 * 关联影神图词条。
 * 这里**刻意冗余了 name**：攻略列表渲染关联 chip 时不该为了一个名字再发一次请求，
 * 而词条改名属于低频事件（改了重新播种即可）。id 仍保留，用于跳转到影神图详情。
 */
export interface GuideRelatedEntry {
  id: string;
  name: string;
}

export interface GuideArticle {
  id: string;
  title: string;
  summary: string;
  kind: GuideKind;
  difficulty: GuideDifficulty;
  chapter: Chapter;
  /** 适用版本（演示数据）。 */
  version: string;
  author: string;
  updatedAt: string;
  /** 作者预估的总耗时（分钟）。 */
  durationMinutes: number;
  spoilerLevel: SpoilerLevel;
  tags: readonly GuideTag[];
  steps: readonly GuideStep[];
  /** 关联影神图词条：攻略 → 百科的深链接。 */
  relatedEntries: readonly GuideRelatedEntry[];
  coverUrl: string;
  views: number;
  likes: number;
}

export function isGuideKind(value: unknown): value is GuideKind {
  return typeof value === 'string' && (GUIDE_KINDS as readonly string[]).includes(value);
}

export function isGuideDifficulty(value: unknown): value is GuideDifficulty {
  return typeof value === 'string' && (GUIDE_DIFFICULTIES as readonly string[]).includes(value);
}

export function isGuideTag(value: unknown): value is GuideTag {
  return typeof value === 'string' && (GUIDE_TAGS as readonly string[]).includes(value);
}

export function isGuideStep(value: unknown): value is GuideStep {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.detail === 'string' &&
    (value.tip === undefined || typeof value.tip === 'string') &&
    (value.minutes === undefined || typeof value.minutes === 'number') &&
    isSpoilerLevel(value.spoilerLevel)
  );
}

export function isGuideRelatedEntry(value: unknown): value is GuideRelatedEntry {
  return isRecord(value) && typeof value.id === 'string' && typeof value.name === 'string';
}

export function isGuideArticle(value: unknown): value is GuideArticle {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.summary === 'string' &&
    isGuideKind(value.kind) &&
    isGuideDifficulty(value.difficulty) &&
    isChapter(value.chapter) &&
    typeof value.version === 'string' &&
    typeof value.author === 'string' &&
    typeof value.updatedAt === 'string' &&
    typeof value.durationMinutes === 'number' &&
    isSpoilerLevel(value.spoilerLevel) &&
    Array.isArray(value.tags) &&
    value.tags.every((tag) => isGuideTag(tag)) &&
    Array.isArray(value.steps) &&
    value.steps.length > 0 &&
    value.steps.every((step) => isGuideStep(step)) &&
    Array.isArray(value.relatedEntries) &&
    value.relatedEntries.every((entry) => isGuideRelatedEntry(entry)) &&
    typeof value.coverUrl === 'string' &&
    typeof value.views === 'number' &&
    typeof value.likes === 'number'
  );
}

/* ── 查询契约 ─────────────────────────────────────────────────────── */

export const GUIDE_SORTS = ['latest', 'popular', 'difficulty'] as const;

export type GuideSort = (typeof GUIDE_SORTS)[number];

export interface GuideQuery {
  kind?: GuideKind;
  difficulty?: GuideDifficulty;
  chapter?: Chapter;
  search?: string;
  sort?: GuideSort;
  page?: number;
  pageSize?: number;
}

export function isGuideSort(value: unknown): value is GuideSort {
  return typeof value === 'string' && (GUIDE_SORTS as readonly string[]).includes(value);
}

/* ── 点赞（写操作，按 ownerId 归属：账号或设备） ───────────────────── */

export interface GuideLikeState {
  guideId: string;
  liked: boolean;
  /** 该条的点赞总数（服务端算好的权威值）。 */
  likes: number;
  /** 当前归属者点过赞的全部攻略 id，便于前端一次同步。 */
  ids: readonly string[];
}

export function isGuideLikeState(value: unknown): value is GuideLikeState {
  return (
    isRecord(value) &&
    typeof value.guideId === 'string' &&
    typeof value.liked === 'boolean' &&
    typeof value.likes === 'number' &&
    Array.isArray(value.ids) &&
    value.ids.every((id) => typeof id === 'string')
  );
}

export function isGuideLikeIdList(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((id) => typeof id === 'string');
}

/** 供筛选条使用：三类攻略的条数。 */
export type GuideKindCounts = Record<GuideKind, number>;

export const GUIDE_CHAPTERS = CHAPTERS;
export const GUIDE_SPOILER_LEVELS = SPOILER_LEVELS;
