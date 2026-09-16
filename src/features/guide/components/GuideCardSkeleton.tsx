import { COPY } from '@/utils/copy';

export interface GuideCardSkeletonProps {
  /** 骨架卡片数量，默认 6 张（两行三列）。 */
  count?: number;
}

/**
 * 攻略列表的骨架屏（协议明确要求）。
 *
 * 它作为 StateBoundary 的 `loading` slot 传入 —— 骨架不只是「转圈」的替代品：
 * 这里按卡片的真实结构（封面 + 标题 + 元信息 + 摘要 + 标签 + 操作区）搭骨架，
 * 加载完成时版面不会跳一下。
 *
 * 无障碍：容器是 role=status + aria-live，读屏会念一次「攻略加载中」；
 * 骨架块本身 aria-hidden，避免把一串无意义的方块念出来。
 */
export function GuideCardSkeleton({ count = 6 }: GuideCardSkeletonProps) {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <span className="sr-only">{COPY.guide.skeleton.title}</span>
      <p className="text-xs text-content-muted">{COPY.guide.skeleton.hint}</p>

      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: Math.max(1, Math.floor(count)) }, (_, index) => (
          <li key={index} aria-hidden="true" className="panel-scroll p-4">
            <div className="flex items-start gap-3">
              <span className="bg-surface-2 h-11 w-11 shrink-0 animate-pulse rounded-sm" />
              <div className="min-w-0 flex-1 space-y-2">
                <span className="bg-surface-2 block h-4 w-3/4 animate-pulse rounded-sm" />
                <span className="bg-surface-2 block h-3 w-1/2 animate-pulse rounded-sm" />
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <span className="bg-surface-2 block h-3 w-full animate-pulse rounded-sm" />
              <span className="bg-surface-2 block h-3 w-5/6 animate-pulse rounded-sm" />
              <span className="bg-surface-2 block h-3 w-2/3 animate-pulse rounded-sm" />
            </div>

            <div className="mt-3 flex gap-1.5">
              <span className="bg-surface-2 h-4 w-12 animate-pulse rounded-sm" />
              <span className="bg-surface-2 h-4 w-10 animate-pulse rounded-sm" />
            </div>

            <div className="border-token border-line mt-3 flex items-center gap-2 border-t pt-3">
              <span className="bg-surface-2 h-6 w-20 animate-pulse rounded-scroll" />
              <span className="bg-surface-2 ml-auto h-6 w-16 animate-pulse rounded-scroll" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
