import { useCallback, useMemo } from 'react';

import { useSearchParams } from 'react-router-dom';

import { isChapter, isRarity, isWikiCategory, isWikiSort } from '@/data/contracts/encyclopedia';
import type {
  Chapter,
  Rarity,
  WikiCategory,
  WikiQuery,
  WikiSort,
} from '@/data/contracts/encyclopedia';

export const WIKI_FILTER_PARAM_KEYS = [
  'wikiChapter',
  'wikiCategory',
  'wikiRarity',
  'wikiSearch',
  'wikiSort',
] as const;

/**
 * 详情抽屉参数。**故意不在** `WIKI_FILTER_PARAM_KEYS` 里：
 * 点「清空筛选」时不该把用户正在看的词条一起关掉。
 */
export const WIKI_ENTRY_PARAM_KEY = 'wikiEntry';

export interface WikiFilters {
  chapter?: Chapter;
  category?: WikiCategory;
  rarity?: Rarity;
  search: string;
  sort: WikiSort;
}

export const DEFAULT_WIKI_SORT: WikiSort = 'relevance';

export interface UseWikiFiltersResult {
  filters: WikiFilters;
  query: WikiQuery;
  setFilter: <TKey extends keyof WikiFilters>(key: TKey, value: WikiFilters[TKey]) => void;
  reset: () => void;
  hasActiveFilters: boolean;
  /**
   * 当前打开的详情抽屉词条 id（`?wikiEntry=...`）。
   * 它不是筛选条件，而是视图状态 —— 但同样放 URL 上：
   * 攻略里的「关联词条」要能一键跳到影神图详情，分享出去的链接也该带着它。
   */
  selectedEntryId: string | null;
  setSelectedEntryId: (entryId: string | null) => void;
}

function parseNumberParam<TValue extends number>(
  raw: string | null,
  guard: (value: unknown) => value is TValue,
): TValue | undefined {
  if (raw === null || raw === '') {
    return undefined;
  }

  const numeric = Number(raw);
  return guard(numeric) ? numeric : undefined;
}

/**
 * 筛选状态**放在 URL 上**（`?wikiChapter=2&wikiSearch=hfs`）。
 *
 * 理由与演示系统一致：筛选后的视图应该可分享、可刷新、可后退。
 * 参数名统一加 `wiki` 前缀，与演示参数互不干扰；
 * DemoProvider 回写 URL 时会保留它不认识的参数，因此两者能共存。
 * 写入用 replace，避免每敲一个字就多一条历史记录。
 */
export function useWikiFilters(): UseWikiFiltersResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<WikiFilters>(() => {
    const category = searchParams.get('wikiCategory');
    const sort = searchParams.get('wikiSort');

    return {
      chapter: parseNumberParam(searchParams.get('wikiChapter'), isChapter),
      category: isWikiCategory(category) ? category : undefined,
      rarity: parseNumberParam(searchParams.get('wikiRarity'), isRarity),
      search: searchParams.get('wikiSearch') ?? '',
      sort: isWikiSort(sort) ? sort : DEFAULT_WIKI_SORT,
    };
  }, [searchParams]);

  const setFilter = useCallback<UseWikiFiltersResult['setFilter']>(
    (key, value) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          const paramKey = {
            chapter: 'wikiChapter',
            category: 'wikiCategory',
            rarity: 'wikiRarity',
            search: 'wikiSearch',
            sort: 'wikiSort',
          }[key];

          const isEmpty =
            value === undefined || value === '' || (key === 'sort' && value === DEFAULT_WIKI_SORT);

          if (isEmpty) {
            next.delete(paramKey);
          } else {
            next.set(paramKey, String(value));
          }

          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const reset = useCallback(() => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        for (const key of WIKI_FILTER_PARAM_KEYS) {
          next.delete(key);
        }
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const selectedEntryId = useMemo(() => {
    const raw = searchParams.get(WIKI_ENTRY_PARAM_KEY);
    return raw === null || raw.trim() === '' ? null : raw;
  }, [searchParams]);

  const setSelectedEntryId = useCallback(
    (entryId: string | null) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);

          if (entryId === null || entryId.trim() === '') {
            next.delete(WIKI_ENTRY_PARAM_KEY);
          } else {
            next.set(WIKI_ENTRY_PARAM_KEY, entryId);
          }

          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const query = useMemo<WikiQuery>(
    () => ({
      chapter: filters.chapter,
      category: filters.category,
      rarity: filters.rarity,
      search: filters.search,
      sort: filters.sort,
    }),
    [filters],
  );

  return {
    filters,
    query,
    setFilter,
    reset,
    selectedEntryId,
    setSelectedEntryId,
    hasActiveFilters:
      filters.chapter !== undefined ||
      filters.category !== undefined ||
      filters.rarity !== undefined ||
      filters.search.trim() !== '' ||
      filters.sort !== DEFAULT_WIKI_SORT,
  };
}
