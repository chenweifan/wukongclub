import { API_PATHS, fillPath } from '@/data/apiPaths';
import { isPaginatedOf } from '@/data/contracts/common';
import type { Paginated } from '@/data/contracts/common';
import {
  isFavoriteIdList,
  isFavoriteState,
  isWikiEntry,
  isWikiGraph,
} from '@/data/contracts/encyclopedia';
import type {
  FavoriteState,
  WikiEntry,
  WikiGraph,
  WikiQuery,
  WikiSort,
} from '@/data/contracts/encyclopedia';
import { HttpError } from '@/data/HttpError';
import { requestJson } from '@/data/httpClient';

/**
 * 影神图 Repository：列表（筛选/排序/分页）、详情、关联图谱、收藏。
 * 查询条件作为参数发给服务端，而不是在前端过滤 —— 与真实后端同构。
 */
export interface EncyclopediaRepository {
  list(query: WikiQuery): Promise<Paginated<WikiEntry>>;
  detail(entryId: string): Promise<WikiEntry>;
  graph(entryId: string): Promise<WikiGraph>;
  favoriteIds(): Promise<readonly string[]>;
  toggleFavorite(entryId: string): Promise<FavoriteState>;
}

const DEFAULT_SORT: WikiSort = 'relevance';

function buildListUrl(query: WikiQuery): string {
  const params = new URLSearchParams();

  if (query.chapter !== undefined) {
    params.set('chapter', String(query.chapter));
  }
  if (query.category !== undefined) {
    params.set('category', query.category);
  }
  if (query.rarity !== undefined) {
    params.set('rarity', String(query.rarity));
  }
  if (query.search !== undefined && query.search.trim() !== '') {
    params.set('search', query.search.trim());
  }
  if (query.includeSpoilers !== undefined) {
    params.set('spoiler', query.includeSpoilers ? '1' : '0');
  }
  params.set('sort', query.sort ?? DEFAULT_SORT);
  params.set('page', String(query.page ?? 1));

  const search = params.toString();
  return search === '' ? API_PATHS.wiki.entries : `${API_PATHS.wiki.entries}?${search}`;
}

function contractMismatch(what: string): HttpError {
  return new HttpError(500, `${what}响应不符合契约`, { code: 'CONTRACT_MISMATCH' });
}

export const encyclopediaRepo: EncyclopediaRepository = {
  async list(query) {
    const payload = await requestJson(buildListUrl(query));

    if (!isPaginatedOf(payload, isWikiEntry)) {
      throw contractMismatch('影神图列表');
    }

    return payload;
  },

  async detail(entryId) {
    const payload = await requestJson(fillPath(API_PATHS.wiki.entry, { entryId }));

    if (!isWikiEntry(payload)) {
      throw contractMismatch('词条详情');
    }

    return payload;
  },

  async graph(entryId) {
    const payload = await requestJson(fillPath(API_PATHS.wiki.graph, { entryId }));

    if (!isWikiGraph(payload)) {
      throw contractMismatch('关联图谱');
    }

    return payload;
  },

  async favoriteIds() {
    const payload = await requestJson(API_PATHS.wiki.favorites);

    if (!isFavoriteIdList(payload)) {
      throw contractMismatch('收藏列表');
    }

    return payload;
  },

  async toggleFavorite(entryId) {
    const payload = await requestJson(fillPath(API_PATHS.wiki.favorite, { entryId }), {
      method: 'POST',
    });

    if (!isFavoriteState(payload)) {
      throw contractMismatch('收藏');
    }

    return payload;
  },
};
