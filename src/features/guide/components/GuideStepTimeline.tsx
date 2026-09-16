import { SpoilerMask } from '@/components/ui/SpoilerMask';
import type { GuideStep } from '@/data/contracts/guide';
import { cn } from '@/utils/cn';
import { COPY } from '@/utils/copy';
import { resolveVisibleSteps } from '@/utils/guideRules';
import type { SpoilerContext } from '@/utils/spoiler';

export interface GuideStepTimelineProps {
  steps: readonly GuideStep[];
  spoilerContext: SpoilerContext;
  onRevealStep: (stepId: string) => void;
}

/**
 * 步骤时间轴（协议明确要求）。
 *
 * 用有序列表 `<ol>` 而不是一堆 div：步骤天然有先后，ol 让读屏能念出「第 3 项，共 5 项」。
 * 剧透是**逐步**判定的：整体安全的攻略里若某一步含结局信息，只遮那一步 ——
 * 把整篇挡住会让用户以为这篇写得不全。
 */
export function GuideStepTimeline({ steps, spoilerContext, onRevealStep }: GuideStepTimelineProps) {
  const visible = resolveVisibleSteps(steps, spoilerContext);

  return (
    <ol className="border-token border-line relative space-y-4 border-l pl-6">
      {visible.map(({ step, visibility }, index) => (
        <li key={step.id} className="relative">
          <span
            aria-hidden="true"
            className={cn(
              'border-token bg-surface font-display absolute -left-[1.85rem] flex h-6 w-6 items-center justify-center rounded-full border text-[11px]',
              visibility === 'masked'
                ? 'border-line text-content-muted'
                : 'border-accent text-accent',
            )}
          >
            {index + 1}
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm text-content">
              <span className="sr-only">{COPY.guide.detail.stepLabel(index + 1)}：</span>
              {step.title}
            </h4>
            {step.minutes === undefined ? null : (
              <span className="stamp">{COPY.guide.detail.stepMinutes(step.minutes)}</span>
            )}
            {step.spoilerLevel === 0 ? null : (
              <span className="text-cinnabar text-[11px]">
                {COPY.spoiler.levels[step.spoilerLevel]}
              </span>
            )}
          </div>

          <div className="mt-2">
            {visibility === 'masked' ? (
              <SpoilerMask level={step.spoilerLevel} onReveal={() => onRevealStep(step.id)}>
                <p className="text-xs leading-relaxed text-content">{step.detail}</p>
              </SpoilerMask>
            ) : (
              <>
                <p className="text-xs leading-relaxed text-content">{step.detail}</p>
                {step.tip === undefined ? null : (
                  <p className="border-token border-line bg-surface-2 mt-2 rounded-scroll border-l-2 px-3 py-2 text-[11px] leading-relaxed text-content-muted">
                    <span className="text-accent">{COPY.guide.detail.tip}：</span>
                    {step.tip}
                  </p>
                )}
              </>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
