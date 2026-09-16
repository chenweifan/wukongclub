import { COPY } from '@/utils/copy';

/**
 * 路由级加载态。
 * 阶段 0 用作 Data Router 的 fallbackElement；阶段 1 起由 <StateBoundary> 统一接管
 * 页面内的 loading/empty/error（协议铁律 4），本组件只保留「路由切换」这一层语义。
 */
export function RouteFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-nav items-center justify-center gap-3 p-8 text-sm text-content-muted"
    >
      <span aria-hidden="true" className="h-3 w-3 animate-pulse rounded-sm bg-accent" />
      <span>{COPY.common.loading}</span>
    </div>
  );
}
