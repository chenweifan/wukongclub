import type { TaskItem } from '@/data/contracts/growth';
import { cn } from '@/utils/cn';
import { COPY } from '@/utils/copy';
import { formatDeadline } from '@/utils/dateFormat';

export interface TaskRowProps {
  task: TaskItem;
  onClaim: (taskId: string) => void;
  isClaiming?: boolean;
}

/**
 * 单条任务。
 *
 * 状态用**三重**表达（进度条 / 按钮文案 / 按钮可用性），不只靠颜色：
 * 高对比主题或色觉障碍下同样能分辨「进行中 / 可领取 / 已领取」。
 */
export function TaskRow({ task, onClaim, isClaiming = false }: TaskRowProps) {
  const percent =
    task.target <= 0 ? 100 : Math.min(100, Math.round((task.progress / task.target) * 100));
  const claimable = task.status === 'claimable';
  const claimed = task.status === 'claimed';

  return (
    <li className="border-token border-line rounded-scroll border p-3">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-content">{task.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-content-muted">
            {task.kind === 'hidden' ? COPY.growth.tasks.hiddenHint : task.description}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <div
              role="progressbar"
              aria-label={task.title}
              aria-valuemin={0}
              aria-valuemax={task.target}
              aria-valuenow={task.progress}
              className="bg-surface-2 h-1.5 flex-1 overflow-hidden rounded-full"
            >
              <span className="bg-accent block h-full" style={{ width: `${percent}%` }} />
            </div>
            <span className="text-[11px] text-content-muted">
              {COPY.growth.tasks.progress(task.progress, task.target)}
            </span>
          </div>

          {task.expiresAt === null ? null : (
            <p className="mt-1 text-[11px] text-content-muted">
              {COPY.growth.tasks.expires(formatDeadline(task.expiresAt))}
            </p>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className="text-accent text-xs">{COPY.growth.tasks.reward(task.reward)}</p>
          <button
            type="button"
            disabled={!claimable || isClaiming}
            onClick={() => {
              onClaim(task.id);
            }}
            className={cn(
              'mt-2 rounded-scroll border px-3 py-1 text-xs transition-colors duration-fast',
              claimable
                ? 'border-accent bg-accent text-accent-ink font-medium'
                : 'border-line text-content-muted',
              'disabled:cursor-not-allowed disabled:opacity-70',
            )}
          >
            {claimed ? COPY.growth.tasks.claimed : COPY.growth.tasks.claim}
          </button>
        </div>
      </div>
    </li>
  );
}
