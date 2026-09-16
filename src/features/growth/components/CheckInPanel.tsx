import { StateBoundary } from '@/components/ui/StateBoundary';
import { useCheckInStateQuery } from '@/entities/growth/queries';
import { CheckInCalendar } from '@/features/growth/components/CheckInCalendar';
import { useCheckInMutation } from '@/features/growth/mutations';
import { buildCalendar } from '@/utils/checkInRules';
import { COPY } from '@/utils/copy';

export interface CheckInPanelProps {
  /** 便于 story 与单测注入固定「今天」，默认取当前时间。 */
  now?: Date;
}

/**
 * 土地庙上香（协议阶段 2「用户成长」）。
 *
 * 「今天是否已上香」由服务端根据日期键判定，前端的按钮禁用只是体验优化 ——
 * 重复点击时后端仍会返回 409，因此不会出现刷新后多算一天的情况。
 */
export function CheckInPanel({ now = new Date() }: CheckInPanelProps) {
  const query = useCheckInStateQuery();
  const mutation = useCheckInMutation();

  return (
    <section aria-labelledby="growth-checkin" className="panel-scroll p-6">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="border-token border-line font-display text-accent flex h-8 w-8 items-center justify-center rounded-sm text-sm"
        >
          庙
        </span>
        <h2 id="growth-checkin" className="text-lg">
          {COPY.growth.checkIn.title}
        </h2>
      </div>

      <div className="mt-4">
        <StateBoundary query={query} label={COPY.growth.checkIn.title}>
          {(state) => (
            <div className="space-y-4">
              <dl className="grid grid-cols-3 gap-3 text-center">
                <div className="border-token border-line rounded-scroll border px-3 py-2">
                  <dt className="text-[11px] text-content-muted">{COPY.growth.stats.streak}</dt>
                  <dd className="font-display mt-1 text-base text-content">
                    {COPY.growth.stats.days(state.streak)}
                  </dd>
                </div>
                <div className="border-token border-line rounded-scroll border px-3 py-2">
                  <dt className="text-[11px] text-content-muted">
                    {COPY.growth.checkIn.calendarTitle}
                  </dt>
                  <dd className="font-display mt-1 text-base text-content">
                    {COPY.growth.stats.days(state.totalDays)}
                  </dd>
                </div>
                <div className="border-token border-line rounded-scroll border px-3 py-2">
                  <dt className="text-[11px] text-content-muted">
                    {COPY.growth.stats.spiritPoints}
                  </dt>
                  <dd className="font-display text-accent mt-1 text-base">
                    {COPY.growth.checkIn.rewardPreview(state.nextReward)}
                  </dd>
                </div>
              </dl>

              <CheckInCalendar cells={buildCalendar(state.records, now)} />

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={state.todayChecked || mutation.isPending}
                  onClick={() => {
                    mutation.mutate();
                  }}
                  className="bg-accent text-accent-ink rounded-scroll px-4 py-2 text-sm font-medium disabled:opacity-60"
                >
                  {state.todayChecked
                    ? COPY.growth.checkIn.done
                    : mutation.isPending
                      ? COPY.growth.checkIn.submitting
                      : COPY.growth.checkIn.action}
                </button>

                <span className="text-xs text-content-muted">
                  {COPY.growth.checkIn.rewardPreview(state.nextReward)}
                </span>
              </div>
            </div>
          )}
        </StateBoundary>
      </div>
    </section>
  );
}
