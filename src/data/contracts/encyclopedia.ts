import { isRecord, isSpoilerLevel } from '@/data/contracts/common';
import type { SpoilerLevel } from '@/data/contracts/common';

/**
 * 影神图百科契约（协议 6.1 给出的形状，逐字段落地）。
 *
 * 三点说明：
 * 1. `imageUrl` 保留在契约里，但种子生成的是**内联 SVG 数据 URI**（印章式首字），
 *    项目不引入任何二进制素材 —— 契约完整，仓库依然轻。
 * 2. 契约之外补了 `pinyin` / `aliasPinyin`：协议要求「拼音首字母高亮」，
 *    而中文转拼音需要额外依赖（不在技术栈清单内），因此拼音随词条一起入库。
 *    `aliasPinyin` 与 `alias` 按索引对齐。
 * 3. 文案均为本项目原创概述（非官方设定文本），章节名取自游戏内真实地名。
 */
export const WIKI_CATEGORIES = ['yaoguai', 'npc', 'boss', 'location'] as const;

export type WikiCategory = (typeof WIKI_CATEGORIES)[number];

export const RARITY_LEVELS = [1, 2, 3, 4, 5] as const;

export type Rarity = (typeof RARITY_LEVELS)[number];

export const CHAPTERS = [1, 2, 3, 4, 5, 6] as const;

export type Chapter = (typeof CHAPTERS)[number];

export const CHAPTER_NAMES: Record<Chapter, string> = {
  1: '黑风山',
  2: '黄风岭',
  3: '小西天',
  4: '盘丝岭',
  5: '火焰山',
  6: '花果山',
};

/** 剧透级别见 common.ts（站级立场，多个域共用）。这里 re-export 保持既有导入路径不变。 */
export { SPOILER_LEVELS, isSpoilerLevel } from '@/data/contracts/common';
export type { SpoilerLevel } from '@/data/contracts/common';

export interface WikiEntry {
  id: string;
  name: string;
  alias?: readonly string[];
  category: WikiCategory;
  chapter: Chapter;
  rarity: Rarity;
  description: string;
  drops: readonly string[];
  relatedIds: readonly string[];
  spoilerLevel: SpoilerLevel;
  imageUrl: string;
  /** 名称的全拼（小写、音节以空格分隔），用于拼音搜索与首字母高亮。 */
  pinyin: string;
  /** 别名的全拼，与 alias 按索引对齐。 */
  aliasPinyin?: readonly string[];
}

export function isWikiCategory(value: unknown): value is WikiCategory {
  return typeof value === 'string' && (WIKI_CATEGORIES as readonly string[]).includes(value);
}

export function isRarity(value: unknown): value is Rarity {
  return typeof value === 'number' && (RARITY_LEVELS as readonly number[]).includes(value);
}

export function isChapter(value: unknown): value is Chapter {
  return typeof value === 'number' && (CHAPTERS as readonly number[]).includes(value);
}

export function isWikiEntry(value: unknown): value is WikiEntry {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    (value.alias === undefined ||
      (Array.isArray(value.alias) && value.alias.every((item) => typeof item === 'string'))) &&
    isWikiCategory(value.category) &&
    isChapter(value.chapter) &&
    isRarity(value.rarity) &&
    typeof value.description === 'string' &&
    Array.isArray(value.drops) &&
    value.drops.every((item) => typeof item === 'string') &&
    Array.isArray(value.relatedIds) &&
    value.relatedIds.every((item) => typeof item === 'string') &&
    isSpoilerLevel(value.spoilerLevel) &&
    typeof value.imageUrl === 'string' &&
    typeof value.pinyin === 'string'
  );
}

/* ── 查询与排序契约 ───────────────────────────────────────────────── */

export const WIKI_SORT_OPTIONS = ['relevance', 'rarity', 'chapter', 'name'] as const;

export type WikiSort = (typeof WIKI_SORT_OPTIONS)[number];

export interface WikiQuery {
  chapter?: Chapter;
  category?: WikiCategory;
  rarity?: Rarity;
  /** 关键词：匹配名称、别名、描述与拼音首字母。 */
  search?: string;
  /** 是否显示含剧透的词条（false 时过滤掉 spoilerLevel > 0）。 */
  includeSpoilers?: boolean;
  sort?: WikiSort;
  page?: number;
  pageSize?: number;
}

export function isWikiSort(value: unknown): value is WikiSort {
  return typeof value === 'string' && (WIKI_SORT_OPTIONS as readonly string[]).includes(value);
}

/** 对比上限：协议规定最多 3 个词条。 */
export const WIKI_COMPARE_LIMIT = 3;

export function canAddToCompare(currentIds: readonly string[], id: string): boolean {
  if (currentIds.includes(id)) {
    return false;
  }
  return currentIds.length < WIKI_COMPARE_LIMIT;
}

/* ── 关联图谱（ECharts Graph 的数据契约） ─────────────────────────── */

export interface WikiGraphNode {
  id: string;
  name: string;
  category: WikiCategory;
  rarity: Rarity;
  /** 是否为当前查看的中心词条（决定节点大小与配色）。 */
  isRoot: boolean;
}

export interface WikiGraphLink {
  source: string;
  target: string;
}

export interface WikiGraph {
  nodes: readonly WikiGraphNode[];
  links: readonly WikiGraphLink[];
}

export function isWikiGraph(value: unknown): value is WikiGraph {
  if (!isRecord(value)) {
    return false;
  }

  const { nodes, links } = value;

  return (
    Array.isArray(nodes) &&
    nodes.every(
      (node) =>
        isRecord(node) &&
        typeof node.id === 'string' &&
        typeof node.name === 'string' &&
        isWikiCategory(node.category) &&
        isRarity(node.rarity) &&
        typeof node.isRoot === 'boolean',
    ) &&
    Array.isArray(links) &&
    links.every(
      (link) =>
        isRecord(link) && typeof link.source === 'string' && typeof link.target === 'string',
    )
  );
}

/* ── 收藏 ─────────────────────────────────────────────────────────── */

export interface FavoriteState {
  entryId: string;
  favorited: boolean;
  /** 当前归属者（账号或设备）的完整收藏列表，便于前端一次同步。 */
  ids: readonly string[];
}

export function isFavoriteState(value: unknown): value is FavoriteState {
  return (
    isRecord(value) &&
    typeof value.entryId === 'string' &&
    typeof value.favorited === 'boolean' &&
    Array.isArray(value.ids) &&
    value.ids.every((id) => typeof id === 'string')
  );
}

export function isFavoriteIdList(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((id) => typeof id === 'string');
}
