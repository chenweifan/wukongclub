import { useCallback, useMemo } from 'react';

import { useSearchParams } from 'react-router-dom';

import { isChapter } from '@/data/contracts/encyclopedia';
import type { Chapter } from '@/data/contracts/encyclopedia';
import { isGuideDifficulty, isGuideKind, isGuideSort } from '@/data/contracts/guide';
import type { GuideDifficulty, GuideKind, GuideQuery, GuideSort } from '@/data/contracts/guide';

export const GUIDE_FILTER_PARAM_KEYS = [
  'guideKind',
  'guideDifficulty',
  'guideChapter',
  'guideSearch',
  'guideSort',
] as const;

export interface GuideFilters {
  kind?: GuideKind;
  difficulty?: GuideDifficulty;
  chapter?: Chapter;
  search: string;
  sort: GuideSort;
}

export const DEFAULT_GUIDE_SORT: GuideSort = 'latest';

export interface UseGuideFiltersResult {
  filters: GuideFilters;
  query: GuideQuery;
  setFilter: <TKey extends keyof GuideFilters>(key: TKey, value: GuideFilters[TKey]) => void;
  reset: () => void;
  hasActiveFilters: boolean;
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
 * 攻略筛选状态放 URL（与百科/资讯同一套做法）：
 * `?guideKind=boss&guideDifficulty=challenge` 可直接分享。
 */
export function useGuideFilters(): UseGuideFiltersResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<GuideFilters>(() => {
    const kind = searchParams.get('guideKind');
    const difficulty = searchParams.get('guideDifficulty');
    const sort = searchParams.get('guideSort');

    return {
      kind: isGuideKind(kind) ? kind : undefined,
      difficulty: isGuideDifficulty(difficulty) ? difficulty : undefined,
      chapter: parseNumberParam(searchParams.get('guideChapter'), isChapter),
      search: searchParams.get('guideSearch') ?? '',
      sort: isGuideSort(sort) ? sort : DEFAULT_GUIDE_SORT,
    };
  }, [searchParams]);

  const setFilter = useCallback<UseGuideFiltersResult['setFilter']>(
    (key, value) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          const paramKey = {
            kind: 'guideKind',
            difficulty: 'guideDifficulty',
            chapter: 'guideChapter',
            search: 'guideSearch',
            sort: 'guideSort',
          }[key];

          const isEmpty =
            value === undefined || value === '' || (key === 'sort' && value === DEFAULT_GUIDE_SORT);

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
        for (const key of GUIDE_FILTER_PARAM_KEYS) {
          next.delete(key);
        }
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const query = useMemo<GuideQuery>(
    () => ({
      kind: filters.kind,
      difficulty: filters.difficulty,
      chapter: filters.chapter,
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
    hasActiveFilters:
      filters.kind !== undefined ||
      filters.difficulty !== undefined ||
      filters.chapter !== undefined ||
      filters.search.trim() !== '' ||
      filters.sort !== DEFAULT_GUIDE_SORT,
  };
}
