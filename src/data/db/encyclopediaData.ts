import { toPaginated } from '@/data/contracts/common';
import type { Paginated } from '@/data/contracts/common';
import type {
  WikiEntry,
  WikiGraph,
  WikiGraphLink,
  WikiGraphNode,
  WikiQuery,
  WikiSort,
} from '@/data/contracts/encyclopedia';
import { hmwDb } from '@/data/db/hmwDb';
import type { FavoriteRecord } from '@/data/db/records';
import { HttpError } from '@/data/HttpError';
import { createWikiSeed } from '@/data/seeds/encyclopedia.seed';
import { matchesEntry, normalizeSearchTerm, scoreEntry } from '@/utils/wikiSearch';

/**
 * 影神图百科的数据操作（mock 后端的「百科服务」）。
 *
 * 筛选、排序、分页都在这一侧完成 —— 与真实后端一致：前端只发查询参数，
 * 而不是把全量词条拉到浏览器里再过滤。搜索排序与高亮共用 utils/wikiSearch 的纯函数，
 * 因此「列表里排在前面的」和「文本里高亮的」永远是同一套匹配规则。
 */

export const WIKI_PAGE_SIZE = 24;
export const WIKI_DEFAULT_RARITY_ORDER: readonly number[] = [5, 4, 3, 2, 1];

export async function readAllWikiEntries(): Promise<WikiEntry[]> {
  return hmwDb.wikiEntries.toArray();
}

/** 关键词为空时保持原顺序（按 id，即种子顺序 = 章节顺序）。 */
export function sortWikiEntries(
  entries: readonly WikiEntry[],
  sort: WikiSort,
  term: string,
): WikiEntry[] {
  const copy = [...entries];

  switch (sort) {
    case 'rarity':
      copy.sort(
        (left, right) =>
          right.rarity - left.rarity || left.chapter - right.chapter || compareName(left, right),
      );
      break;
    case 'chapter':
      copy.sort(
        (left, right) =>
          left.chapter - right.chapter || right.rarity - left.rarity || compareName(left, right),
      );
      break;
    case 'name':
      copy.sort(compareName);
      break;
    case 'relevance':
    default:
      if (term === '') {
        copy.sort((left, right) => left.chapter - right.chapter || right.rarity - left.rarity);
        break;
      }
      copy.sort(
        (left, right) =>
          scoreEntry(right, term) - scoreEntry(left, term) ||
          right.rarity - left.rarity ||
          compareName(left, right),
      );
      break;
  }

  return copy;
}

function compareName(left: WikiEntry, right: WikiEntry): number {
  return left.name.localeCompare(right.name, 'zh-Hans-CN');
}

/**
 * 纯函数：按查询条件筛选 + 排序。
 * `includeSpoilers` 默认 false —— 默认不剧透是本站的既定立场，
 * 调用方（演示状态）显式传 true 才会带上剧透词条。
 */
export function applyWikiQuery(entries: readonly WikiEntry[], query: WikiQuery): WikiEntry[] {
  const term = normalizeSearchTerm(query.search ?? '');

  const filtered = entries.filter((entry) => {
    if (query.chapter !== undefined && entry.chapter !== query.chapter) {
      return false;
    }
    if (query.category !== undefined && entry.category !== query.category) {
      return false;
    }
    if (query.rarity !== undefined && entry.rarity !== query.rarity) {
      return false;
    }
    if (query.includeSpoilers !== true && entry.spoilerLevel > 0) {
      return false;
    }
    return matchesEntry(entry, term);
  });

  return sortWikiEntries(filtered, query.sort ?? 'relevance', term);
}

export async function listWikiEntries(query: WikiQuery): Promise<Paginated<WikiEntry>> {
  const entries = await readAllWikiEntries();
  const matched = applyWikiQuery(entries, query);

  return toPaginated(matched, query.page ?? 1, query.pageSize ?? WIKI_PAGE_SIZE);
}

export async function getWikiEntry(id: string): Promise<WikiEntry> {
  const entry = await hmwDb.wikiEntries.get(id);

  if (entry === undefined) {
    throw new HttpError(404, '词条不存在', { code: 'WIKI_ENTRY_NOT_FOUND' });
  }

  return entry;
}

/**
 * 关联图谱：中心词条 + 一跳邻居，以及它们之间的连线。
 * 只取一跳是刻意的 —— 六章全图会让节点数爆炸，而详情抽屉要的是「这东西和谁有关」。
 */
export async function getWikiGraph(rootId: string): Promise<WikiGraph> {
  const root = await getWikiEntry(rootId);
  const all = await readAllWikiEntries();
  const byId = new Map(all.map((entry) => [entry.id, entry]));

  const neighborIds = new Set<string>();
  for (const relatedId of root.relatedIds) {
    if (byId.has(relatedId)) {
      neighborIds.add(relatedId);
    }
  }

  // 反向邻居：只被中心词条单向引用的情况也要连上
  for (const entry of all) {
    if (entry.relatedIds.includes(root.id)) {
      neighborIds.add(entry.id);
    }
  }

  const nodes: WikiGraphNode[] = [
    toGraphNode(root, true),
    ...[...neighborIds]
      .map((id) => byId.get(id))
      .filter((entry): entry is WikiEntry => entry !== undefined)
      .map((entry) => toGraphNode(entry, false)),
  ];

  const visible = new Set(nodes.map((node) => node.id));
  const linkKeys = new Set<string>();
  const links: WikiGraphLink[] = [];

  const pushLink = (source: string, target: string) => {
    if (source === target || !visible.has(source) || !visible.has(target)) {
      return;
    }
    const key = [source, target].sort().join('→');
    if (linkKeys.has(key)) {
      return;
    }
    linkKeys.add(key);
    links.push({ source, target });
  };

  for (const relatedId of root.relatedIds) {
    pushLink(root.id, relatedId);
  }

  for (const entry of all) {
    if (visible.has(entry.id)) {
      for (const relatedId of entry.relatedIds) {
        pushLink(entry.id, relatedId);
      }
    }
  }

  return { nodes, links };
}

function toGraphNode(entry: WikiEntry, isRoot: boolean): WikiGraphNode {
  return {
    id: entry.id,
    name: entry.name,
    category: entry.category,
    rarity: entry.rarity,
    isRoot,
  };
}

/* ── 收藏 ─────────────────────────────────────────────────────────── */

function toFavoriteId(ownerId: string, entryId: string): string {
  return `${ownerId}:${entryId}`;
}

export async function readFavoriteIds(ownerId: string): Promise<string[]> {
  const records = await hmwDb.favorites.where('ownerId').equals(ownerId).toArray();

  return records
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
    .map((record) => record.entryId);
}

export interface FavoriteToggleResult {
  entryId: string;
  favorited: boolean;
  ids: string[];
}

export async function toggleFavorite(
  ownerId: string,
  entryId: string,
): Promise<FavoriteToggleResult> {
  // 先确认词条存在：收藏一个不存在的 id 只会在未来变成幽灵数据
  await getWikiEntry(entryId);

  const id = toFavoriteId(ownerId, entryId);
  const existing = await hmwDb.favorites.get(id);

  if (existing === undefined) {
    const record: FavoriteRecord = {
      id,
      ownerId,
      entryId,
      createdAt: new Date().toISOString(),
    };
    await hmwDb.favorites.put(record);
  } else {
    await hmwDb.favorites.delete(id);
  }

  const ids = await readFavoriteIds(ownerId);

  return { entryId, favorited: existing === undefined, ids };
}

/* ── 播种与清理 ───────────────────────────────────────────────────── */

/** 幂等写入词条（清表后写入整份种子）。 */
export async function seedWikiEntries(): Promise<number> {
  const entries = createWikiSeed();

  await hmwDb.transaction('rw', hmwDb.wikiEntries, async () => {
    await hmwDb.wikiEntries.clear();
    await hmwDb.wikiEntries.bulkPut(entries);
  });

  return entries.length;
}

export async function countWikiEntries(): Promise<number> {
  return hmwDb.wikiEntries.count();
}

export async function clearWikiTables(): Promise<void> {
  await hmwDb.wikiEntries.clear();
  await hmwDb.favorites.clear();
}
