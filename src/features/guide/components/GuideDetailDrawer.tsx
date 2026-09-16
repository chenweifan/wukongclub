import { useState } from 'react';

import * as Dialog from '@radix-ui/react-dialog';
import { Link } from 'react-router-dom';

import { CHAPTER_NAMES } from '@/data/contracts/encyclopedia';
import type { GuideArticle } from '@/data/contracts/guide';
import { GuideStepTimeline } from '@/features/guide/components/GuideStepTimeline';
import { cn } from '@/utils/cn';
import { COPY } from '@/utils/copy';
import { formatDate } from '@/utils/dateFormat';
import { countMaskedSteps, sumStepMinutes } from '@/utils/guideRules';
import type { SpoilerContext } from '@/utils/spoiler';

export interface GuideDetailDrawerProps {
  guide: GuideArticle | null;
  likedIds: readonly string[];
  likePending?: boolean;
  spoilerRevealedIds: readonly string[];
  onClose: () => void;
  onRevealStep: (stepId: string) => void;
  onToggleLike: (guideId: string) => void;
}

/**
 * 攻略详情抽屉（Radix Dialog，右侧滑出，不跳页）。
 *
 * 关联词条跳转到 `/wiki?wikiEntry=<id>` —— 影神图支持从 URL 打开指定词条，
 * 因此「攻略里提到的妖王」可以一键跳到它的词条详情，而不是丢一个 id 给用户看。
 */
export function GuideDetailDrawer({
  guide,
  likedIds,
  likePending = false,
  spoilerRevealedIds,
  onClose,
  onRevealStep,
  onToggleLike,
}: GuideDetailDrawerProps) {
  const [internalRevealed, setInternalRevealed] = useState<readonly string[]>([]);
  const revealedIds = [...spoilerRevealedIds, ...internalRevealed];

  const spoilerContext: SpoilerContext = { spoilerVisible: false, revealedIds };
  const open = guide !== null;

  const handleRevealStep = (stepId: string) => {
    setInternalRevealed((previous) =>
      previous.includes(stepId) ? previous : [...previous, stepId],
    );
    onRevealStep(stepId);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="bg-overlay fixed inset-0 z-[var(--hmw-z-modal)]" />
        <Dialog.Content
          className={cn(
            'border-token border-line bg-surface fixed right-0 top-0 z-[var(--hmw-z-modal)]',
            'h-full w-[min(40rem,100vw)] overflow-y-auto border-l p-6',
          )}
        >
          {guide === null ? null : (
            <>
              <div className="flex items-start justify-between gap-3">
                <Dialog.Title className="font-display text-xl text-content">
                  {guide.title}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    aria-label={COPY.guide.detail.close}
                    className="border-token border-line text-content-muted hover:text-content shrink-0 rounded-scroll border px-2 py-1 text-xs"
                  >
                    ✕
                  </button>
                </Dialog.Close>
              </div>

              <Dialog.Description className="mt-2 text-xs leading-relaxed text-content-muted">
                {guide.summary}
              </Dialog.Description>

              <dl className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <Meta label={COPY.guide.filterKind} value={COPY.guide.kind[guide.kind]} />
                <Meta
                  label={COPY.guide.filterDifficulty}
                  value={COPY.guide.difficulty[guide.difficulty]}
                />
                <Meta
                  label={COPY.guide.filterChapter}
                  value={COPY.guide.chapterLabel(guide.chapter, CHAPTER_NAMES[guide.chapter])}
                />
                <Meta label={COPY.guide.sortLabel} value={formatDate(guide.updatedAt)} />
              </dl>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  aria-pressed={likedIds.includes(guide.id)}
                  disabled={likePending}
                  onClick={() => {
                    onToggleLike(guide.id);
                  }}
                  className={cn(
                    'border-token rounded-scroll border px-3 py-1.5 text-xs disabled:opacity-60',
                    likedIds.includes(guide.id)
                      ? 'border-accent text-accent'
                      : 'border-line text-content-muted hover:text-content',
                  )}
                >
                  <span aria-hidden="true">{likedIds.includes(guide.id) ? '★' : '☆'}</span>{' '}
                  {COPY.guide.like.liked(guide.likes)}
                </button>

                <p className="text-[11px] text-content-muted">
                  {COPY.guide.card.author(guide.author)}
                  {' · '}
                  {COPY.guide.card.views(guide.views)}
                </p>
              </div>

              <section aria-label={COPY.guide.detail.stepsTitle} className="mt-6">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-sm text-content">{COPY.guide.detail.stepsTitle}</h3>
                  <span className="text-[11px] text-content-muted">
                    {COPY.guide.detail.sumMinutes(sumStepMinutes(guide.steps))}
                  </span>
                  {(() => {
                    const masked = countMaskedSteps(guide.steps, spoilerContext);
                    return masked === 0 ? null : (
                      <span className="text-cinnabar text-[11px]">
                        {COPY.guide.detail.maskedNotice(masked)}
                      </span>
                    );
                  })()}
                </div>

                <div className="mt-4">
                  <GuideStepTimeline
                    steps={guide.steps}
                    spoilerContext={spoilerContext}
                    onRevealStep={handleRevealStep}
                  />
                </div>
              </section>

              <section aria-label={COPY.guide.detail.relatedTitle} className="mt-6">
                <h3 className="text-sm text-content">{COPY.guide.detail.relatedTitle}</h3>
                {guide.relatedEntries.length === 0 ? (
                  <p className="mt-2 text-xs text-content-muted">
                    {COPY.guide.detail.relatedEmpty}
                  </p>
                ) : (
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {guide.relatedEntries.map((entry) => (
                      <li key={entry.id}>
                        <Link
                          to={`/wiki?wikiEntry=${encodeURIComponent(entry.id)}`}
                          className="border-token border-line hover:border-accent hover:text-accent rounded-scroll border px-2 py-1 text-xs text-content-muted"
                          title={COPY.guide.detail.openEntry}
                        >
                          {entry.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-token border-line rounded-scroll border px-2 py-1.5">
      <dt className="text-[11px] text-content-muted">{label}</dt>
      <dd className="mt-0.5 text-content">{value}</dd>
    </div>
  );
}
