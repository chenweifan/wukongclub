import { useEffect, useState } from 'react';

import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { CHAPTERS, CHAPTER_NAMES } from '@/data/contracts/encyclopedia';
import type { Chapter } from '@/data/contracts/encyclopedia';
import { GUIDE_DIFFICULTIES, GUIDE_KINDS, GUIDE_SORTS } from '@/data/contracts/guide';
import type {
  GuideDifficulty,
  GuideKind,
  GuideKindCounts,
  GuideSort,
} from '@/data/contracts/guide';
import type { GuideFilters as GuideFiltersValue } from '@/features/guide/useGuideFilters';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { COPY } from '@/utils/copy';

export interface GuideFiltersProps {
  filters: GuideFiltersValue;
  kindCounts: GuideKindCounts;
  matchedCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onChange: <TKey extends keyof GuideFiltersValue>(
    key: TKey,
    value: GuideFiltersValue[TKey],
  ) => void;
  onReset: () => void;
}

const KIND_OPTIONS: readonly { value: GuideKind | 'all'; label: string }[] = [
  { value: 'all', label: COPY.guide.all },
  ...GUIDE_KINDS.map((kind) => ({ value: kind, label: COPY.guide.kind[kind] })),
];

/**
 * 攻略筛选条：分类（带篇数）+ 难度 + 章节 + 搜索 + 排序。
 * 搜索用防抖写 URL，和百科/资讯保持一致的交互手感。
 */
export function GuideFilters({
  filters,
  kindCounts,
  matchedCount,
  totalCount,
  hasActiveFilters,
  onChange,
  onReset,
}: GuideFiltersProps) {
  const [searchText, setSearchText] = useState(filters.search);
  const debouncedSearch = useDebouncedValue(searchText, 250);

  useEffect(() => {
    setSearchText(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onChange('search', debouncedSearch);
    }
  }, [debouncedSearch, filters.search, onChange]);

  return (
    <section aria-label={COPY.guide.title} className="panel-scroll space-y-3 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-56 flex-1">
          <label htmlFor="guide-search" className="sr-only">
            {COPY.guide.searchLabel}
          </label>
          <input
            id="guide-search"
            type="search"
            value={searchText}
            placeholder={COPY.guide.searchPlaceholder}
            onChange={(event) => {
              setSearchText(event.target.value);
            }}
            className="border-token border-line bg-surface-2 placeholder:text-content-muted focus:border-accent w-full rounded-scroll border px-3 py-2 text-sm text-content"
          />
        </div>

        <label className="flex items-center gap-2 text-xs text-content-muted">
          {COPY.guide.filterDifficulty}
          <select
            value={filters.difficulty ?? 'all'}
            onChange={(event) => {
              const { value } = event.target;
              onChange('difficulty', value === 'all' ? undefined : (value as GuideDifficulty));
            }}
            className="border-token border-line bg-surface-2 rounded-scroll border px-2 py-1.5 text-xs text-content"
          >
            <option value="all">{COPY.guide.all}</option>
            {GUIDE_DIFFICULTIES.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {COPY.guide.difficulty[difficulty]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-xs text-content-muted">
          {COPY.guide.filterChapter}
          <select
            value={filters.chapter === undefined ? 'all' : String(filters.chapter)}
            onChange={(event) => {
              const { value } = event.target;
              onChange('chapter', value === 'all' ? undefined : (Number(value) as Chapter));
            }}
            className="border-token border-line bg-surface-2 rounded-scroll border px-2 py-1.5 text-xs text-content"
          >
            <option value="all">{COPY.guide.all}</option>
            {CHAPTERS.map((chapter) => (
              <option key={chapter} value={chapter}>
                {COPY.guide.chapterLabel(chapter, CHAPTER_NAMES[chapter])}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-xs text-content-muted">
          {COPY.guide.sortLabel}
          <select
            value={filters.sort}
            onChange={(event) => {
              onChange('sort', event.target.value as GuideSort);
            }}
            className="border-token border-line bg-surface-2 rounded-scroll border px-2 py-1.5 text-xs text-content"
          >
            {GUIDE_SORTS.map((sort) => (
              <option key={sort} value={sort}>
                {COPY.guide.sort[sort]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          label={COPY.guide.filterKind}
          value={filters.kind ?? 'all'}
          options={KIND_OPTIONS.map((option) => ({
            ...option,
            label:
              option.value === 'all'
                ? option.label
                : `${option.label} · ${kindCounts[option.value]}`,
          }))}
          onChange={(next) => {
            onChange('kind', next === 'all' ? undefined : next);
          }}
        />

        <p className="text-xs text-content-muted" aria-live="polite">
          {hasActiveFilters
            ? COPY.guide.resultCountFiltered(matchedCount, totalCount)
            : COPY.guide.resultCount(totalCount)}
        </p>

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onReset}
            className="border-token border-line hover:text-accent rounded-scroll border px-2 py-1 text-xs"
          >
            {COPY.guide.resetFilters}
          </button>
        ) : null}
      </div>
    </section>
  );
}
