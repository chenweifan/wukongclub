import { useCallback, useMemo, useState } from 'react';

import { StateBoundary } from '@/components/ui/StateBoundary';
import { WIKI_COMPARE_LIMIT, canAddToCompare } from '@/data/contracts/encyclopedia';
import type { WikiEntry } from '@/data/contracts/encyclopedia';
import { useDemoStore } from '@/demo/demoStore';
import {
  useFavoriteIdsQuery,
  useToggleFavoriteMutation,
  useWikiListQuery,
} from '@/entities/encyclopedia/queries';
import { WikiCardWall } from '@/features/encyclopedia/components/WikiCardWall';
import { WikiComparePanel } from '@/features/encyclopedia/components/WikiComparePanel';
import { WikiEntryDrawer } from '@/features/encyclopedia/components/WikiEntryDrawer';
import { WikiFilters } from '@/features/encyclopedia/components/WikiFilters';
import { useWikiFilters } from '@/features/encyclopedia/useWikiFilters';
import { pushToast } from '@/stores/toastStore';
import { COPY } from '@/utils/copy';
import { describeUnknownError } from '@/utils/errorMessage';

/**
 * 影神图百科页（协议阶段 2 模块二）。
 *
 * 组合关系：
 * - 筛选状态在 URL 上（useWikiFilters），因此「某一组筛选结果」可以直接分享；
 * - 列表由服务端筛选/排序/分页（Repository → MSW → Dexie），前端不做全量过滤；
 * - 卡片墙按行虚拟化；详情用抽屉（不跳页）；对比最多 3 条；
 * - 图谱按需加载（ECharts 不进首屏）。
 */
export function WikiPage() {
  const { filters, query, setFilter, reset, hasActiveFilters } = useWikiFilters();
  const listQuery = useWikiListQuery(query);
  const favoritesQuery = useFavoriteIdsQuery();
  const toggleFavorite = useToggleFavoriteMutation();
  const spoiler = useDemoStore((state) => state.spoiler);

  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [compareEntries, setCompareEntries] = useState<readonly WikiEntry[]>([]);
  const [favoritePendingId, setFavoritePendingId] = useState<string | null>(null);

  const entries = useMemo(() => listQuery.data?.items ?? [], [listQuery.data]);
  const favoriteIds = favoritesQuery.data ?? [];
  const compareIds = useMemo(() => compareEntries.map((entry) => entry.id), [compareEntries]);
  const compareFull = compareIds.length >= WIKI_COMPARE_LIMIT;

  const handleToggleFavorite = useCallback(
    (entryId: string) => {
      setFavoritePendingId(entryId);

      toggleFavorite.mutate(entryId, {
        onSuccess: (state) => {
          const name = entries.find((entry) => entry.id === entryId)?.name ?? entryId;
          pushToast(
            state.favorited ? COPY.wiki.favorite.added(name) : COPY.wiki.favorite.removed(name),
          );
        },
        onError: (error) => {
          pushToast(`${COPY.wiki.favorite.failed}：${describeUnknownError(error)}`, 'danger');
        },
        onSettled: () => {
          setFavoritePendingId(null);
        },
      });
    },
    [entries, toggleFavorite],
  );

  /**
   * 加入/移出对比。
   * 抽屉里也可能点（例如从图谱节点跳进来），此时该词条不在当前列表里，
   * 所以允许调用方直接把词条带过来。
   */
  const handleToggleCompare = useCallback(
    (entryId: string, entry?: WikiEntry) => {
      setCompareEntries((previous) => {
        const ids = previous.map((item) => item.id);

        if (ids.includes(entryId)) {
          return previous.filter((item) => item.id !== entryId);
        }

        if (!canAddToCompare(ids, entryId)) {
          pushToast(COPY.wiki.compare.full(WIKI_COMPARE_LIMIT));
          return previous;
        }

        const resolved = entry ?? entries.find((item) => item.id === entryId);
        return resolved === undefined ? previous : [...previous, resolved];
      });
    },
    [entries],
  );

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-2xl">{COPY.wiki.title}</h1>
        <p className="mt-1 text-xs text-content-muted">{COPY.wiki.description}</p>
      </header>

      <WikiFilters
        filters={filters}
        matchedCount={entries.length}
        totalCount={listQuery.data?.total ?? 0}
        spoilerVisible={spoiler}
        hasActiveFilters={hasActiveFilters}
        onChange={setFilter}
        onReset={reset}
      />

      <WikiComparePanel
        entries={compareEntries}
        onRemove={(entryId) => {
          handleToggleCompare(entryId);
        }}
        onClear={() => {
          setCompareEntries([]);
        }}
        onOpen={setActiveEntryId}
      />

      <StateBoundary
        query={listQuery}
        label={COPY.wiki.title}
        isEmpty={(data) => data.items.length === 0}
        emptyTitle={COPY.wiki.empty}
        emptyDescription={COPY.wiki.emptyHint}
        emptyAction={
          hasActiveFilters ? (
            <button
              type="button"
              onClick={reset}
              className="border-token border-line hover:text-accent mt-4 rounded-scroll border px-3 py-1.5 text-xs"
            >
              {COPY.wiki.resetFilters}
            </button>
          ) : null
        }
      >
        {(data) => (
          <WikiCardWall
            entries={data.items}
            searchTerm={filters.search}
            favoriteIds={favoriteIds}
            compareIds={compareIds}
            compareFull={compareFull}
            favoritePendingId={favoritePendingId}
            onOpen={setActiveEntryId}
            onToggleFavorite={handleToggleFavorite}
            onToggleCompare={handleToggleCompare}
          />
        )}
      </StateBoundary>

      <WikiEntryDrawer
        entryId={activeEntryId}
        favoriteIds={favoriteIds}
        compareIds={compareIds}
        compareFull={compareFull}
        onClose={() => {
          setActiveEntryId(null);
        }}
        onSelect={setActiveEntryId}
        onToggleFavorite={handleToggleFavorite}
        onToggleCompare={handleToggleCompare}
      />
    </div>
  );
}
