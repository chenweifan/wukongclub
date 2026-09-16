import { useCallback, useMemo } from 'react';

import { useSearchParams } from 'react-router-dom';

import { isNewsCategory, isNewsSort, isNewsTag } from '@/data/contracts/news';
import type { NewsCategory, NewsQuery, NewsSort, NewsTag } from '@/data/contracts/news';

export const NEWS_FILTER_PARAM_KEYS = [
  'newsCategory',
  'newsTags',
  'newsSearch',
  'newsSort',
] as const;

export interface NewsFilters {
  category?: NewsCategory;
  tags: readonly NewsTag[];
  search: string;
  sort: NewsSort;
}

export const DEFAULT_NEWS_SORT: NewsSort = 'latest';

export interface UseNewsFiltersResult {
  filters: NewsFilters;
  query: NewsQuery;
  setSearch: (value: string) => void;
  setCategory: (value: NewsCategory | undefined) => void;
  setSort: (value: NewsSort) => void;
  toggleTag: (tag: NewsTag) => void;
  reset: () => void;
  hasActiveFilters: boolean;
}

/**
 * 资讯筛选状态放 URL（与影神图同一套做法）：
 * `?newsTags=version&newsTags=balance` 可直接分享，刷新与后退都保持视图。
 * 标签用重复参数表达「同时满足」语义，与 handler 的解析约定一致。
 */
export function useNewsFilters(): UseNewsFiltersResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<NewsFilters>(() => {
    const category = searchParams.get('newsCategory');
    const sort = searchParams.get('newsSort');
    const tags = searchParams.getAll('newsTags').filter((raw): raw is NewsTag => isNewsTag(raw));

    return {
      category: isNewsCategory(category) ? category : undefined,
      tags,
      search: searchParams.get('newsSearch') ?? '',
      sort: isNewsSort(sort) ? sort : DEFAULT_NEWS_SORT,
    };
  }, [searchParams]);

  const mutate = useCallback(
    (update: (params: URLSearchParams) => void) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          update(next);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setSearch = useCallback(
    (value: string) => {
      mutate((params) => {
        if (value.trim() === '') {
          params.delete('newsSearch');
        } else {
          params.set('newsSearch', value);
        }
      });
    },
    [mutate],
  );

  const setCategory = useCallback(
    (value: NewsCategory | undefined) => {
      mutate((params) => {
        if (value === undefined) {
          params.delete('newsCategory');
        } else {
          params.set('newsCategory', value);
        }
      });
    },
    [mutate],
  );

  const setSort = useCallback(
    (value: NewsSort) => {
      mutate((params) => {
        if (value === DEFAULT_NEWS_SORT) {
          params.delete('newsSort');
        } else {
          params.set('newsSort', value);
        }
      });
    },
    [mutate],
  );

  const toggleTag = useCallback(
    (tag: NewsTag) => {
      mutate((params) => {
        const current = params.getAll('newsTags');
        params.delete('newsTags');

        const next = current.includes(tag)
          ? current.filter((item) => item !== tag)
          : [...current, tag];

        for (const item of next) {
          params.append('newsTags', item);
        }
      });
    },
    [mutate],
  );

  const reset = useCallback(() => {
    mutate((params) => {
      for (const key of NEWS_FILTER_PARAM_KEYS) {
        params.delete(key);
      }
    });
  }, [mutate]);

  const query = useMemo<NewsQuery>(
    () => ({
      category: filters.category,
      tags: filters.tags,
      search: filters.search,
      sort: filters.sort,
    }),
    [filters],
  );

  return {
    filters,
    query,
    setSearch,
    setCategory,
    setSort,
    toggleTag,
    reset,
    hasActiveFilters:
      filters.category !== undefined ||
      filters.tags.length > 0 ||
      filters.search.trim() !== '' ||
      filters.sort !== DEFAULT_NEWS_SORT,
  };
}
