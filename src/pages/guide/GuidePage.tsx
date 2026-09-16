import { useCallback, useMemo, useState } from 'react';

import { StateBoundary } from '@/components/ui/StateBoundary';
import { useDemoStore } from '@/demo/demoStore';
import {
  useGuideKindCountsQuery,
  useGuideListQuery,
  useLikedGuideIdsQuery,
  useToggleGuideLikeMutation,
} from '@/entities/guide/queries';
import { GuideCard } from '@/features/guide/components/GuideCard';
import { GuideCardSkeleton } from '@/features/guide/components/GuideCardSkeleton';
import { GuideDetailDrawer } from '@/features/guide/components/GuideDetailDrawer';
import { GuideFilters } from '@/features/guide/components/GuideFilters';
import { useGuideFilters } from '@/features/guide/useGuideFilters';
import { pushToast } from '@/stores/toastStore';
import { COPY } from '@/utils/copy';
import { describeUnknownError } from '@/utils/errorMessage';
import { countGuidesByKind } from '@/utils/guideRules';
import type { SpoilerContext } from '@/utils/spoiler';

/**
 * 攻略库页（协议阶段 2 模块四）。
 *
 * 组合关系：
 * - 筛选（分类 / 难度 / 章节 / 搜索 / 排序）在 URL 上，可分享；
 * - 列表由服务端筛选排序分页；
 * - 加载态用**骨架屏**（StateBoundary 的 loading slot），而不是转圈；
 * - 剧透是逐步遮蔽的：攻略卡片提示「N 步含剧透」，详情里只遮那几步；
 * - 关联词条一键跳到影神图详情（`/wiki?wikiEntry=<id>`）。
 */
export function GuidePage() {
  const { filters, query, setFilter, reset, hasActiveFilters } = useGuideFilters();
  const listQuery = useGuideListQuery(query);
  const countsQuery = useGuideKindCountsQuery();
  const likedQuery = useLikedGuideIdsQuery();
  const likeMutation = useToggleGuideLikeMutation();
  const spoilerVisible = useDemoStore((state) => state.spoiler);

  const [activeGuideId, setActiveGuideId] = useState<string | null>(null);
  const [revealedStepIds, setRevealedStepIds] = useState<readonly string[]>([]);
  const [likePendingId, setLikePendingId] = useState<string | null>(null);

  const guides = useMemo(() => listQuery.data?.items ?? [], [listQuery.data]);
  const likedIds = likedQuery.data ?? [];
  // 角标用全量统计；统计接口还没回来时先按当前列表分布显示，避免角标闪成 0
  const kindCounts = countsQuery.data ?? countGuidesByKind(guides);

  const spoilerContext: SpoilerContext = useMemo(
    () => ({ spoilerVisible, revealedIds: revealedStepIds }),
    [spoilerVisible, revealedStepIds],
  );

  const activeGuide = useMemo(
    () => guides.find((guide) => guide.id === activeGuideId) ?? null,
    [activeGuideId, guides],
  );

  const handleToggleLike = useCallback(
    (guideId: string) => {
      setLikePendingId(guideId);

      likeMutation.mutate(guideId, {
        onError: (error) => {
          pushToast(`${COPY.guide.like.failed}：${describeUnknownError(error)}`, 'danger');
        },
        onSettled: () => {
          setLikePendingId(null);
        },
      });
    },
    [likeMutation],
  );

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-2xl">{COPY.guide.title}</h1>
        <p className="mt-1 text-xs text-content-muted">{COPY.guide.description}</p>
        {/* 攻略最容易被当成官方资料：这里明确说明来源与校验状态 */}
        <p className="stamp mt-2 inline-block">{COPY.guide.demoNotice}</p>
      </header>

      <GuideFilters
        filters={filters}
        kindCounts={kindCounts}
        matchedCount={guides.length}
        totalCount={listQuery.data?.total ?? 0}
        hasActiveFilters={hasActiveFilters}
        onChange={setFilter}
        onReset={reset}
      />

      <StateBoundary
        query={listQuery}
        label={COPY.guide.title}
        loading={<GuideCardSkeleton />}
        isEmpty={(data) => data.items.length === 0}
        emptyTitle={COPY.guide.empty}
        emptyDescription={COPY.guide.emptyHint}
        emptyAction={
          hasActiveFilters ? (
            <button
              type="button"
              onClick={reset}
              className="border-token border-line hover:text-accent mt-4 rounded-scroll border px-3 py-1.5 text-xs"
            >
              {COPY.guide.resetFilters}
            </button>
          ) : null
        }
      >
        {(data) => (
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.items.map((guide) => (
              <li key={guide.id}>
                <GuideCard
                  guide={guide}
                  liked={likedIds.includes(guide.id)}
                  likePending={likePendingId === guide.id}
                  spoilerContext={spoilerContext}
                  onOpen={setActiveGuideId}
                  onToggleLike={handleToggleLike}
                />
              </li>
            ))}
          </ul>
        )}
      </StateBoundary>

      <GuideDetailDrawer
        guide={activeGuide}
        likedIds={likedIds}
        likePending={likePendingId === activeGuide?.id}
        spoilerRevealedIds={revealedStepIds}
        onClose={() => {
          setActiveGuideId(null);
        }}
        onRevealStep={(stepId) => {
          setRevealedStepIds((previous) =>
            previous.includes(stepId) ? previous : [...previous, stepId],
          );
        }}
        onToggleLike={handleToggleLike}
      />
    </div>
  );
}
