import { useCallback, useMemo, useState } from 'react';

import { StateBoundary } from '@/components/ui/StateBoundary';
import type { NewsArticle } from '@/data/contracts/news';
import { useDemoStore } from '@/demo/demoStore';
import { useNewsListQuery, useNewsTagCountsQuery } from '@/entities/news/queries';
import { NewsFilters } from '@/features/news/components/NewsFilters';
import { NewsTimeline } from '@/features/news/components/NewsTimeline';
import { useNewsFilters } from '@/features/news/useNewsFilters';
import { pushToast } from '@/stores/toastStore';
import { COPY } from '@/utils/copy';
import { countMaskedArticles, groupNewsByDay } from '@/utils/newsRules';
import type { SpoilerContext } from '@/utils/newsRules';

/**
 * 资讯页（协议阶段 2 模块三）。
 *
 * 组合关系：
 * - 筛选（类目 / 标签 / 搜索 / 排序）在 URL 上，可分享；
 * - 列表由服务端筛选排序分页，前端只渲染；
 * - 剧透是**遮罩**而不是隐藏：全站开关 + 单条揭开两种粒度；
 * - 来源按钮：外链在演示模式下会被阶段 1 的拦截器拦下并提示，站内编辑内容则给出说明。
 */
export function NewsPage() {
  const { filters, query, setSearch, setCategory, setSort, toggleTag, reset, hasActiveFilters } =
    useNewsFilters();
  const listQuery = useNewsListQuery(query);
  const tagCountsQuery = useNewsTagCountsQuery();
  const spoilerVisible = useDemoStore((state) => state.spoiler);

  const [revealedIds, setRevealedIds] = useState<readonly string[]>([]);
  const [expandedIds, setExpandedIds] = useState<readonly string[]>([]);

  const articles = useMemo(() => listQuery.data?.items ?? [], [listQuery.data]);
  const spoilerContext: SpoilerContext = useMemo(
    () => ({ spoilerVisible, revealedIds }),
    [spoilerVisible, revealedIds],
  );

  const groups = useMemo(() => groupNewsByDay(articles), [articles]);
  const maskedCount = countMaskedArticles(articles, spoilerContext);
  const tagCounts = tagCountsQuery.data ?? [];

  const handleReveal = useCallback((articleId: string) => {
    setRevealedIds((previous) =>
      previous.includes(articleId) ? previous : [...previous, articleId],
    );
    pushToast(COPY.spoiler.revealed);
  }, []);

  const handleToggleExpand = useCallback((articleId: string) => {
    setExpandedIds((previous) =>
      previous.includes(articleId)
        ? previous.filter((id) => id !== articleId)
        : [...previous, articleId],
    );
  }, []);

  const handleOpenSource = useCallback((article: NewsArticle) => {
    pushToast(article.source.url === null ? COPY.news.noSource : COPY.news.openSource);
  }, []);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-2xl">{COPY.news.title}</h1>
        <p className="mt-1 text-xs text-content-muted">{COPY.news.description}</p>
        {/* 站级合规提示：资讯页尤其需要说清「这里不是官方公告」 */}
        <p className="stamp mt-2 inline-block">{COPY.news.demoNotice}</p>
      </header>

      <NewsFilters
        filters={filters}
        tagCounts={tagCounts}
        matchedCount={articles.length}
        totalCount={listQuery.data?.total ?? 0}
        maskedCount={maskedCount}
        spoilerVisible={spoilerVisible}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onSortChange={setSort}
        onToggleTag={toggleTag}
        onReset={reset}
      />

      <StateBoundary
        query={listQuery}
        label={COPY.news.title}
        isEmpty={(data) => data.items.length === 0}
        emptyTitle={COPY.news.empty}
        emptyDescription={COPY.news.emptyHint}
        emptyAction={
          hasActiveFilters ? (
            <button
              type="button"
              onClick={reset}
              className="border-token border-line hover:text-accent mt-4 rounded-scroll border px-3 py-1.5 text-xs"
            >
              {COPY.news.resetFilters}
            </button>
          ) : null
        }
      >
        {() => (
          <NewsTimeline
            groups={groups}
            spoilerContext={spoilerContext}
            expandedIds={expandedIds}
            onToggleExpand={handleToggleExpand}
            onReveal={handleReveal}
            onOpenSource={handleOpenSource}
          />
        )}
      </StateBoundary>
    </div>
  );
}
