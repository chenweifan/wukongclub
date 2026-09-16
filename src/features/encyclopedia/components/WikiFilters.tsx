import { useEffect, useState } from 'react';

import { SegmentedControl } from '@/components/ui/SegmentedControl';
import {
  CHAPTERS,
  CHAPTER_NAMES,
  RARITY_LEVELS,
  WIKI_CATEGORIES,
  WIKI_SORT_OPTIONS,
} from '@/data/contracts/encyclopedia';
import type { Chapter, Rarity, WikiCategory, WikiSort } from '@/data/contracts/encyclopedia';
import type { WikiFilters as WikiFiltersValue } from '@/features/encyclopedia/useWikiFilters';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { COPY } from '@/utils/copy';

export interface WikiFiltersProps {
  filters: WikiFiltersValue;
  matchedCount: number;
  totalCount: number;
  spoilerVisible: boolean;
  hasActiveFilters: boolean;
  onChange: <TKey extends keyof WikiFiltersValue>(key: TKey, value: WikiFiltersValue[TKey]) => void;
  onReset: () => void;
}

const CATEGORY_OPTIONS: readonly { value: WikiCategory | 'all'; label: string }[] = [
  { value: 'all', label: COPY.wiki.all },
  ...WIKI_CATEGORIES.map((category) => ({ value: category, label: COPY.wiki.category[category] })),
];

const SORT_OPTIONS: readonly { value: WikiSort; label: string }[] = WIKI_SORT_OPTIONS.map(
  (sort) => ({ value: sort, label: COPY.wiki.sort[sort] }),
);

/**
 * 筛选条：搜索 + 章节 / 类型 / 稀有度 + 排序。
 *
 * 搜索框用本地状态 + 防抖写 URL：输入不卡手，地址栏也不会每个字符抖一次。
 * 三个下拉用原生 `<select>`：在移动端与键盘操作上，原生控件的体验优于自绘下拉，
 * 且无障碍语义（combobox）是白送的。
 */
export function WikiFilters({
  filters,
  matchedCount,
  totalCount,
  spoilerVisible,
  hasActiveFilters,
  onChange,
  onReset,
}: WikiFiltersProps) {
  const [searchText, setSearchText] = useState(filters.search);
  const debouncedSearch = useDebouncedValue(searchText, 250);

  // 外部的筛选变化（例如点「清空筛选」或后退）要能反向同步到输入框
  useEffect(() => {
    setSearchText(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onChange('search', debouncedSearch);
    }
  }, [debouncedSearch, filters.search, onChange]);

  return (
    <section aria-label={COPY.wiki.title} className="panel-scroll space-y-3 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-56 flex-1">
          <label htmlFor="wiki-search" className="sr-only">
            {COPY.wiki.searchLabel}
          </label>
          <input
            id="wiki-search"
            type="search"
            value={searchText}
            placeholder={COPY.wiki.searchPlaceholder}
            onChange={(event) => {
              setSearchText(event.target.value);
            }}
            className="border-token border-line bg-surface-2 placeholder:text-content-muted focus:border-accent w-full rounded-scroll border px-3 py-2 text-sm text-content"
          />
        </div>

        <label className="flex items-center gap-2 text-xs text-content-muted">
          {COPY.wiki.sortLabel}
          <select
            value={filters.sort}
            onChange={(event) => {
              onChange('sort', event.target.value as WikiSort);
            }}
            className="border-token border-line bg-surface-2 rounded-scroll border px-2 py-1.5 text-xs text-content"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-xs text-content-muted">
          {COPY.wiki.filterChapter}
          <select
            value={filters.chapter === undefined ? 'all' : String(filters.chapter)}
            onChange={(event) => {
              const { value } = event.target;
              onChange('chapter', value === 'all' ? undefined : (Number(value) as Chapter));
            }}
            className="border-token border-line bg-surface-2 rounded-scroll border px-2 py-1.5 text-xs text-content"
          >
            <option value="all">{COPY.wiki.all}</option>
            {CHAPTERS.map((chapter) => (
              <option key={chapter} value={chapter}>
                {COPY.wiki.chapterLabel(chapter, CHAPTER_NAMES[chapter])}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-xs text-content-muted">
          {COPY.wiki.filterRarity}
          <select
            value={filters.rarity === undefined ? 'all' : String(filters.rarity)}
            onChange={(event) => {
              const { value } = event.target;
              onChange('rarity', value === 'all' ? undefined : (Number(value) as Rarity));
            }}
            className="border-token border-line bg-surface-2 rounded-scroll border px-2 py-1.5 text-xs text-content"
          >
            <option value="all">{COPY.wiki.all}</option>
            {[...RARITY_LEVELS].reverse().map((rarity) => (
              <option key={rarity} value={rarity}>
                {COPY.wiki.rarityLabel(rarity)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          label={COPY.wiki.filterCategory}
          value={filters.category ?? 'all'}
          options={CATEGORY_OPTIONS}
          onChange={(next) => {
            onChange('category', next === 'all' ? undefined : next);
          }}
        />

        <p className="text-xs text-content-muted" aria-live="polite">
          {hasActiveFilters
            ? COPY.wiki.resultCountFiltered(matchedCount, totalCount)
            : COPY.wiki.resultCount(totalCount)}
        </p>

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onReset}
            className="border-token border-line hover:text-accent rounded-scroll border px-2 py-1 text-xs"
          >
            {COPY.wiki.resetFilters}
          </button>
        ) : null}

        <p className="text-[11px] text-content-muted">
          {spoilerVisible ? COPY.wiki.spoilerVisible : COPY.wiki.spoilerHidden}
        </p>
      </div>
    </section>
  );
}
