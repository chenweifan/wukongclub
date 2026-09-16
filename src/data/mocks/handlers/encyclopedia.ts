import { HttpResponse, http } from 'msw';

import { API_PATHS } from '@/data/apiPaths';
import {
  isChapter,
  isRarity,
  isWikiCategory,
  isWikiSort,
  WIKI_CATEGORIES,
  RARITY_LEVELS,
  CHAPTERS,
} from '@/data/contracts/encyclopedia';
import type {
  Chapter,
  Rarity,
  WikiCategory,
  WikiQuery,
  WikiSort,
} from '@/data/contracts/encyclopedia';
import {
  getWikiEntry,
  getWikiGraph,
  listWikiEntries,
  readFavoriteIds,
  toggleFavorite,
} from '@/data/db/encyclopediaData';
import { DEVICE_ID_HEADER } from '@/data/deviceId';
import { useDemoStore } from '@/demo/demoStore';
import { mockDelay, mockError, toMockResponse } from '@/data/mocks/mockControl';
import { resolveUserId } from '@/data/mocks/session';

/**
 * 影神图百科接口。
 *
 * 两个约定值得注意：
 * 1. `spoiler` 参数缺省时读演示状态（协议 6.3 允许 mocks 读 demoStore）——
 *    因此顶栏的剧透开关会真实地改变百科列表内容，而不是只改一处 UI。
 * 2. 收藏的归属者：已登录用 `user:<id>`，未登录用 `device:<id>`，
 *    两者共用一张表，登录前后不会出现两份互不相干的收藏。
 */
function readOwnerId(request: Request): string {
  const userId = resolveUserId(request);
  if (userId !== null) {
    return `user:${userId}`;
  }

  const deviceId = request.headers.get(DEVICE_ID_HEADER);
  return `device:${deviceId === null || deviceId === '' ? 'anonymous' : deviceId}`;
}

function readEnum<TValue extends string | number>(
  raw: string | null,
  parse: (value: unknown) => value is TValue,
): TValue | undefined {
  if (raw === null || raw === '') {
    return undefined;
  }

  const numeric = Number(raw);
  const candidate: unknown = Number.isNaN(numeric) ? raw : numeric;

  return parse(candidate) ? candidate : undefined;
}

function readQuery(request: Request): WikiQuery {
  const params = new URL(request.url).searchParams;
  const spoilerParam = params.get('spoiler');

  return {
    chapter: readEnum<Chapter>(params.get('chapter'), isChapter),
    category: readEnum<WikiCategory>(params.get('category'), isWikiCategory),
    rarity: readEnum<Rarity>(params.get('rarity'), isRarity),
    search: params.get('search') ?? undefined,
    includeSpoilers: spoilerParam === null ? useDemoStore.getState().spoiler : spoilerParam !== '0',
    sort: readEnum<WikiSort>(params.get('sort'), isWikiSort),
    page: Number(params.get('page') ?? '1') || 1,
  };
}

function readParam(value: string | readonly string[] | undefined): string {
  return typeof value === 'string' ? value : '';
}

export const encyclopediaHandlers = [
  http.get(API_PATHS.wiki.entries, async ({ request }) => {
    try {
      mockError();
      await mockDelay();

      return HttpResponse.json(await listWikiEntries(readQuery(request)));
    } catch (error) {
      return toMockResponse(error);
    }
  }),

  http.get(API_PATHS.wiki.entry, async ({ params }) => {
    try {
      mockError();
      await mockDelay();

      return HttpResponse.json(await getWikiEntry(readParam(params.entryId)));
    } catch (error) {
      return toMockResponse(error);
    }
  }),

  http.get(API_PATHS.wiki.graph, async ({ params }) => {
    try {
      mockError();
      await mockDelay();

      return HttpResponse.json(await getWikiGraph(readParam(params.entryId)));
    } catch (error) {
      return toMockResponse(error);
    }
  }),

  http.get(API_PATHS.wiki.favorites, async ({ request }) => {
    try {
      mockError();
      await mockDelay();

      return HttpResponse.json(await readFavoriteIds(readOwnerId(request)));
    } catch (error) {
      return toMockResponse(error);
    }
  }),

  http.post(API_PATHS.wiki.favorite, async ({ request, params }) => {
    try {
      mockError();
      await mockDelay();

      return HttpResponse.json(
        await toggleFavorite(readOwnerId(request), readParam(params.entryId)),
      );
    } catch (error) {
      return toMockResponse(error);
    }
  }),
];

/** 供单测断言筛选维度齐全（新增维度时忘记同步 handler 会被这条兜住）。 */
export const WIKI_FILTER_DIMENSIONS = {
  categories: WIKI_CATEGORIES,
  rarities: RARITY_LEVELS,
  chapters: CHAPTERS,
} as const;
