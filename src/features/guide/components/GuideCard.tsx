import { CHAPTER_NAMES } from '@/data/contracts/encyclopedia';
import type { GuideArticle } from '@/data/contracts/guide';
import { cn } from '@/utils/cn';
import { COPY } from '@/utils/copy';
import { formatDate } from '@/utils/dateFormat';
import { countMaskedSteps, peakSpoilerLevel } from '@/utils/guideRules';
import type { SpoilerContext } from '@/utils/spoiler';

export interface GuideCardProps {
  guide: GuideArticle;
  liked: boolean;
  likePending?: boolean;
  spoilerContext: SpoilerContext;
  onOpen: (guideId: string) => void;
  onToggleLike: (guideId: string) => void;
}

/**
 * 攻略卡片。
 *
 * 剧透标记用 `peakSpoilerLevel`（攻略与步骤里的最高级别）：
 * 用户应该在列表上就知道「点进去会不会被剧透」，而不是点开才发现。
 */
export function GuideCard({
  guide,
  liked,
  likePending = false,
  spoilerContext,
  onOpen,
  onToggleLike,
}: GuideCardProps) {
  const maskedSteps = countMaskedSteps(guide.steps, spoilerContext);
  const peakLevel = peakSpoilerLevel(guide);

  return (
    <article className="panel-scroll hover:border-line-strong flex h-full flex-col p-4">
      <div className="flex items-start gap-3">
        <img
          src={guide.coverUrl}
          alt=""
          aria-hidden="true"
          width={44}
          height={44}
          loading="lazy"
          className="border-token border-line h-11 w-11 shrink-0 rounded-sm border"
        />

        <div className="min-w-0 flex-1">
          <h3 className="text-sm leading-snug">
            <button
              type="button"
              onClick={() => {
                onOpen(guide.id);
              }}
              className="hover:text-accent text-left transition-colors duration-fast"
            >
              {guide.title}
            </button>
          </h3>

          <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-content-muted">
            <span className="stamp">{COPY.guide.kind[guide.kind]}</span>
            <span className="stamp">{COPY.guide.difficulty[guide.difficulty]}</span>
            <span>{COPY.guide.chapterLabel(guide.chapter, CHAPTER_NAMES[guide.chapter])}</span>
            <span aria-hidden="true">·</span>
            <span>{COPY.guide.card.minutes(guide.durationMinutes)}</span>
            {peakLevel === 0 ? null : (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-cinnabar">{COPY.spoiler.levels[peakLevel as 0 | 1 | 2]}</span>
              </>
            )}
          </p>
        </div>
      </div>

      <p className="mt-3 line-clamp-3 flex-1 text-xs leading-relaxed text-content-muted">
        {guide.summary}
      </p>

      <ul className="mt-3 flex flex-wrap gap-1.5">
        {guide.tags.map((tag) => (
          <li key={tag} className="stamp">
            {COPY.guide.tag[tag]}
          </li>
        ))}
      </ul>

      <p className="mt-2 text-[11px] text-content-muted">
        {COPY.guide.card.steps(guide.steps.length)}
        {maskedSteps === 0 ? '' : ` · ${COPY.guide.card.maskedSteps(maskedSteps)}`}
        {' · '}
        {COPY.guide.card.updated(formatDate(guide.updatedAt))}
        {' · '}
        {COPY.guide.card.author(guide.author)}
      </p>

      <div className="border-token border-line mt-3 flex items-center gap-2 border-t pt-3">
        <button
          type="button"
          aria-pressed={liked}
          disabled={likePending}
          onClick={() => {
            onToggleLike(guide.id);
          }}
          className={cn(
            'border-token rounded-scroll border px-2 py-1 text-xs transition-colors duration-fast disabled:opacity-60',
            liked
              ? 'border-accent text-accent'
              : 'border-line text-content-muted hover:text-content',
          )}
        >
          <span aria-hidden="true">{liked ? '★' : '☆'}</span> {COPY.guide.like.liked(guide.likes)}
        </button>

        <button
          type="button"
          onClick={() => {
            onOpen(guide.id);
          }}
          className="border-token border-line hover:text-accent ml-auto rounded-scroll border px-2 py-1 text-xs"
        >
          {COPY.guide.detail.open}
        </button>
      </div>
    </article>
  );
}
