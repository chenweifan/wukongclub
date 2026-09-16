import type { NewsArticle } from '@/data/contracts/news';
import { NewsCard } from '@/features/news/components/NewsCard';
import { COPY } from '@/utils/copy';
import type { NewsDayGroup, SpoilerContext } from '@/utils/newsRules';
import { resolveDayKind, resolveNewsVisibility } from '@/utils/newsRules';

export interface NewsTimelineProps {
  groups: readonly NewsDayGroup[];
  spoilerContext: SpoilerContext;
  expandedIds: readonly string[];
  now?: Date;
  onToggleExpand: (articleId: string) => void;
  onReveal: (articleId: string) => void;
  onOpenSource: (article: NewsArticle) => void;
}

/**
 * 时间线：按天分组，组标题用「今天 / 昨天 / 具体日期」。
 *
 * 为什么按天分组而不是纯列表：资讯是**带时间语境**的内容，
 * 「今天发生了什么」比「第 7 条是什么」更接近读者的提问方式。
 */
export function NewsTimeline({
  groups,
  spoilerContext,
  expandedIds,
  now = new Date(),
  onToggleExpand,
  onReveal,
  onOpenSource,
}: NewsTimelineProps) {
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.dateKey} aria-label={group.dateKey}>
          <h2 className="border-token border-line mb-3 flex items-center gap-2 border-b pb-2 text-xs text-content-muted">
            <span className="text-accent" aria-hidden="true">
              ●
            </span>
            {formatDayLabel(group.dateKey, now)}
            <span className="ml-auto">{COPY.news.resultCount(group.articles.length)}</span>
          </h2>

          <ul className="space-y-3">
            {group.articles.map((article) => (
              <li key={article.id}>
                <NewsCard
                  article={article}
                  visibility={resolveNewsVisibility(article, spoilerContext)}
                  expanded={expandedIds.includes(article.id)}
                  now={now}
                  onToggleExpand={onToggleExpand}
                  onReveal={onReveal}
                  onOpenSource={onOpenSource}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function formatDayLabel(dateKey: string, now: Date): string {
  const kind = resolveDayKind(dateKey, now);

  if (kind === 'today') {
    return COPY.news.timelineToday;
  }
  if (kind === 'yesterday') {
    return COPY.news.timelineYesterday;
  }

  return dateKey;
}
