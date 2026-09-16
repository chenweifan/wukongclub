import { useEffect, useState } from 'react';

import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { NEWS_CATEGORIES, NEWS_SORT_OPTIONS } from '@/data/contracts/news';
import type { NewsCategory, NewsSort, NewsTag, NewsTagCount } from '@/data/contracts/news';
import type { NewsFilters as NewsFiltersValue } from '@/features/news/useNewsFilters';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { cn } from '@/utils/cn';
import { COPY } from '@/utils/copy';

export interface NewsFiltersProps {
  filters: NewsFiltersValue;
  tagCounts: readonly NewsTagCount[];
  matchedCount: number;
  totalCount: number;
  maskedCount: number;
  spoilerVisible: boolean;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: NewsCategory | undefined) => void;
  onSortChange: (value: NewsSort) => void;
  onToggleTag: (tag: NewsTag) => void;
  onReset: () => void;
}

const CATEGORY_OPTIONS: readonly { value: NewsCategory | 'all'; label: string }[] = [
  { value: 'all', label: COPY.news.all },
  ...NEWS_CATEGORIES.map((category) => ({ value: category, label: COPY.news.category[category] })),
];

/**
 * 资讯筛选条：搜索（防抖写 URL）+ 类目 + 排序 + 标签。
 *
 * 标签用带角标的 chip 而不是下拉：标签是「多选且要看得出有没有内容」的维度，
 * 角标让用户在点击前就知道哪几个标签是空的（0 条的标签直接不渲染）。
 */
export function NewsFilters({
  filters,
  tagCounts,
  matchedCount,
  totalCount,
  maskedCount,
  spoilerVisible,
  hasActiveFilters,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onToggleTag,
  onReset,
}: NewsFiltersProps) {
  const [searchText, setSearchText] = useState(filters.search);
  const debouncedSearch = useDebouncedValue(searchText, 250);

  useEffect(() => {
    setSearchText(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onSearchChange(debouncedSearch);
    }
  }, [debouncedSearch, filters.search, onSearchChange]);

  return (
    <section aria-label={COPY.news.title} className="panel-scroll space-y-3 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-56 flex-1">
          <label htmlFor="news-search" className="sr-only">
            {COPY.news.searchLabel}
          </label>
          <input
            id="news-search"
            type="search"
            value={searchText}
            placeholder={COPY.news.searchPlaceholder}
            onChange={(event) => {
              setSearchText(event.target.value);
            }}
            className="border-token border-line bg-surface-2 placeholder:text-content-muted focus:border-accent w-full rounded-scroll border px-3 py-2 text-sm text-content"
          />
        </div>

        <label className="flex items-center gap-2 text-xs text-content-muted">
          {COPY.news.sortLabel}
          <select
            value={filters.sort}
            onChange={(event) => {
              onSortChange(event.target.value as NewsSort);
            }}
            className="border-token border-line bg-surface-2 rounded-scroll border px-2 py-1.5 text-xs text-content"
          >
            {NEWS_SORT_OPTIONS.map((sort) => (
              <option key={sort} value={sort}>
                {COPY.news.sort[sort]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          label={COPY.news.filterCategory}
          value={filters.category ?? 'all'}
          options={CATEGORY_OPTIONS}
          onChange={(next) => {
            onCategoryChange(next === 'all' ? undefined : next);
          }}
        />
      </div>

      {tagCounts.length === 0 ? null : (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-content-muted">{COPY.news.filterTag}</span>
          {tagCounts.map((entry) => {
            const selected = filters.tags.includes(entry.tag);

            return (
              <button
                key={entry.tag}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  onToggleTag(entry.tag);
                }}
                className={cn(
                  'border-token rounded-scroll border px-2 py-0.5 text-[11px] transition-colors duration-fast',
                  selected
                    ? 'border-accent bg-accent text-accent-ink font-medium'
                    : 'border-line text-content-muted hover:text-content',
                )}
              >
                {COPY.news.tag[entry.tag]}
                <span className="ml-1 opacity-70">{entry.count}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <p className="text-xs text-content-muted" aria-live="polite">
          {hasActiveFilters
            ? COPY.news.resultCountFiltered(matchedCount, totalCount)
            : COPY.news.resultCount(totalCount)}
        </p>

        {maskedCount === 0 ? null : (
          <p className="text-cinnabar text-[11px]">{COPY.news.maskedNotice(maskedCount)}</p>
        )}

        <p className="text-[11px] text-content-muted">
          {spoilerVisible ? COPY.spoiler.onNotice : COPY.spoiler.offNotice}
        </p>

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onReset}
            className="border-token border-line hover:text-accent rounded-scroll border px-2 py-1 text-xs"
          >
            {COPY.news.resetFilters}
          </button>
        ) : null}
      </div>
    </section>
  );
}
