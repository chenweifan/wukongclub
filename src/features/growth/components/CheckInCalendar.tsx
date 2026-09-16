import { cn } from '@/utils/cn';
import { COPY } from '@/utils/copy';
import type { CheckInCell } from '@/utils/checkInRules';

export interface CheckInCalendarProps {
  cells: readonly CheckInCell[];
}

/**
 * 近 30 天签到日历（10 列滚动窗口，不是自然月）。
 *
 * 无障碍：每个格子都有 sr-only 的完整描述（日期 + 是否上香 + 是否今天），
 * 视觉上则只显示日号，避免 30 个「已上香」字样把版面撑爆。
 */
export function CheckInCalendar({ cells }: CheckInCalendarProps) {
  return (
    <ul
      aria-label={COPY.growth.checkIn.calendarTitle}
      className="grid grid-cols-10 gap-1 sm:grid-cols-[repeat(15,minmax(0,1fr))]"
    >
      {cells.map((cell) => (
        <li key={cell.date}>
          <span
            className={cn(
              'flex h-7 items-center justify-center rounded-sm border-token border text-[10px]',
              cell.checked
                ? 'border-accent bg-accent text-accent-ink'
                : 'border-line text-content-muted',
              cell.isToday && 'outline outline-1 outline-offset-1 outline-accent',
            )}
          >
            <span aria-hidden="true">{cell.dayOfMonth}</span>
            <span className="sr-only">
              {`${cell.date} · ${
                cell.checked ? COPY.growth.checkIn.checkedHint : COPY.growth.checkIn.uncheckedHint
              }${cell.isToday ? ` · ${COPY.growth.checkIn.todayHint}` : ''}`}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
