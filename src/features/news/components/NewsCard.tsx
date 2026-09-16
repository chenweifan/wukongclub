import type { NewsArticle } from '@/data/contracts/news';
import { SpoilerMask } from '@/components/ui/SpoilerMask';
import { cn } from '@/utils/cn';
import { COPY } from '@/utils/copy';
import { formatRelativeTime } from '@/utils/dateFormat';
import type { NewsVisibility } from '@/utils/newsRules';

export interface NewsCardProps {
  article: NewsArticle;
  visibility: NewsVisibility;
  expanded: boolean;
  now?: Date;
  onToggleExpand: (articleId: string) => void;
  onReveal: (articleId: string) => void;
  onOpenSource: (article: NewsArticle) => void;
}

/**
 * 单条资讯。
 *
 * 结构：封面 + 标题 + 元信息（类目/来源/时间/标签）+ 摘要 + 可选正文 + 操作区。
 * 摘要与正文共用同一份可见性判定：要么都遮罩，要么都展开，
 * 否则会出现「摘要遮着、正文露着」这种最糟糕的状态。
 */
export function NewsCard({
  article,
  visibility,
  expanded,
  now,
  onToggleExpand,
  onReveal,
  onOpenSource,
}: NewsCardProps) {
  const masked = visibility === 'masked';
  const fromEditorial = article.source.url === null;

  return (
    <article
      className={cn(
        'panel-scroll p-4',
        article.pinned ? 'border-accent' : 'hover:border-line-strong',
      )}
    >
      <div className="flex items-start gap-3">
        <img
          src={article.coverUrl}
          alt=""
          aria-hidden="true"
          width={44}
          height={44}
          loading="lazy"
          className="border-token border-line h-11 w-11 shrink-0 rounded-sm border"
        />

        <div className="min-w-0 flex-1">
          <h3 className="flex flex-wrap items-center gap-2 text-sm leading-snug text-content">
            {article.pinned ? <span className="stamp">{COPY.news.pinned}</span> : null}
            {article.title}
          </h3>

          <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-content-muted">
            <span className="stamp">{COPY.news.category[article.category]}</span>
            <span title={COPY.news.sourceKind[article.source.kind]}>{article.source.name}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={article.publishedAt}>
              {formatRelativeTime(article.publishedAt, now)}
            </time>
            {article.spoilerLevel === 0 ? null : (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-cinnabar">{COPY.spoiler.levels[article.spoilerLevel]}</span>
              </>
            )}
          </p>

          {article.tags.length === 0 ? null : (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {article.tags.map((tag) => (
                <li key={tag} className="stamp">
                  {COPY.news.tag[tag]}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-3">
        {masked ? (
          <SpoilerMask level={article.spoilerLevel} onReveal={() => onReveal(article.id)}>
            <p className="text-xs leading-relaxed text-content-muted">{article.summary}</p>
          </SpoilerMask>
        ) : (
          <p className="text-xs leading-relaxed text-content-muted">{article.summary}</p>
        )}
      </div>

      {expanded && !masked ? (
        <div className="border-token border-line mt-3 space-y-2 border-t pt-3">
          {article.body.map((paragraph, index) => (
            <p key={index} className="text-xs leading-relaxed text-content">
              {paragraph}
            </p>
          ))}
        </div>
      ) : null}

      <div className="border-token border-line mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
        <button
          type="button"
          aria-expanded={expanded}
          disabled={masked}
          onClick={() => {
            onToggleExpand(article.id);
          }}
          className="border-token border-line hover:text-accent rounded-scroll border px-2 py-1 text-xs disabled:opacity-50"
        >
          {expanded ? COPY.news.collapse : COPY.news.expand}
        </button>

        {fromEditorial ? (
          <button
            type="button"
            onClick={() => {
              onOpenSource(article);
            }}
            className="border-token border-line text-content-muted hover:text-content rounded-scroll border px-2 py-1 text-xs"
          >
            {COPY.news.openSource}
          </button>
        ) : (
          // 真外链：演示模式下会被阶段 1 的外链拦截拦下并提示，退出演示模式即可跳转
          <a
            href={article.source.url ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="border-token border-line hover:text-accent rounded-scroll border px-2 py-1 text-xs"
          >
            {COPY.news.openSource}
          </a>
        )}

        <span className="ml-auto text-[11px] text-content-muted">
          {COPY.news.sourceKind[article.source.kind]}
        </span>
      </div>
    </article>
  );
}
