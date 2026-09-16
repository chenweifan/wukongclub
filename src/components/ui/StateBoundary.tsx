import type { ReactNode } from 'react';

import { resolveBoundaryView } from '@/components/ui/boundaryView';
import { useDemoStore } from '@/demo/demoStore';
import { cn } from '@/utils/cn';
import { COPY } from '@/utils/copy';
import { describeUnknownError } from '@/utils/errorMessage';

/**
 * StateBoundary 只依赖它真正用到的这五个字段，而不是整个 UseQueryResult。
 * 好处有二：
 * 1. 接口隔离 —— 组件不会被 React Query 的类型演进牵连；
 * 2. 测试里可以直接构造这五个字段，不需要任何类型断言（协议铁律 9）。
 * useQuery 的返回值在结构上天然满足本接口。
 */
export interface BoundaryQuery<TData> {
  status: 'pending' | 'error' | 'success';
  data: TData | undefined;
  error: Error | null;
  isFetching: boolean;
  refetch: () => unknown;
}

export interface StateBoundaryProps<TData> {
  /** 直接把 useQuery 的结果传进来即可。 */
  query: BoundaryQuery<TData>;
  /** 判定「成功但为空」，例如 items.length === 0。 */
  isEmpty?: (data: TData) => boolean;
  /** 正常态渲染；data 一定存在。 */
  children: (data: TData) => ReactNode;
  loading?: ReactNode;
  empty?: ReactNode;
  error?: ReactNode;
  offline?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  /** 用于 aria-label，说明这块区域在加载什么。 */
  label?: string;
}

/**
 * 统一异步边界（协议架构铁律 4：异步 UI 一律用它包裹，禁止页面里散写 if (loading)）。
 * 它优先服从演示控制台选定的界面状态，normal/slow 时回落到真实的查询状态。
 */
export function StateBoundary<TData>({
  query,
  isEmpty,
  children,
  loading,
  empty,
  error,
  offline,
  emptyTitle,
  emptyDescription,
  emptyAction,
  label,
}: StateBoundaryProps<TData>) {
  const demoUiState = useDemoStore((state) => state.uiState);

  const data = query.status === 'success' ? query.data : undefined;
  const isEmptyResult = data !== undefined && (isEmpty?.(data) ?? false);
  const view = resolveBoundaryView({
    demoUiState,
    queryStatus: query.status,
    isEmpty: isEmptyResult,
  });

  const retry = () => {
    void query.refetch();
  };

  if (view === 'loading') {
    return <>{loading ?? <BoundaryLoading label={label} />}</>;
  }

  if (view === 'error') {
    return (
      <>
        {error ?? (
          <BoundaryPanel
            tone="danger"
            title={COPY.boundary.errorTitle}
            description={describeUnknownError(query.error)}
            onRetry={retry}
          />
        )}
      </>
    );
  }

  if (view === 'offline') {
    return (
      <>
        {offline ?? (
          <BoundaryPanel
            tone="danger"
            title={COPY.boundary.offlineTitle}
            description={COPY.boundary.offlineDescription}
            onRetry={retry}
          />
        )}
      </>
    );
  }

  if (view === 'empty') {
    return (
      <>
        {empty ?? (
          <BoundaryPanel
            tone="muted"
            title={emptyTitle ?? COPY.boundary.emptyTitle}
            description={emptyDescription ?? COPY.boundary.emptyDescription}
            action={emptyAction}
          />
        )}
      </>
    );
  }

  if (data === undefined) {
    // 逻辑上不可达：resolveBoundaryView 只在 success 时返回 ready。
    // 保留这层防御，是为了将来改动决策函数时不至于静默渲染 undefined。
    return <BoundaryLoading label={label} />;
  }

  return <>{children(data)}</>;
}

interface BoundaryPanelProps {
  tone: 'danger' | 'muted';
  title: string;
  description?: string;
  action?: ReactNode;
  onRetry?: () => void;
}

function BoundaryPanel({ tone, title, description, action, onRetry }: BoundaryPanelProps) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn(
        'rounded-scroll border-token border p-6 text-center',
        tone === 'danger' ? 'border-danger bg-surface' : 'border-line bg-surface',
      )}
    >
      <p className={cn('text-sm', tone === 'danger' ? 'text-danger' : 'text-content')}>{title}</p>
      {description === undefined ? null : (
        <p className="mt-2 text-xs text-content-muted">{description}</p>
      )}

      {action ?? null}

      {onRetry === undefined ? null : (
        <button
          type="button"
          onClick={onRetry}
          className="border-token border-line hover:text-accent mt-4 rounded-scroll border px-3 py-1.5 text-xs"
        >
          {COPY.common.retry}
        </button>
      )}
    </div>
  );
}

function BoundaryLoading({ label }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" aria-label={label} className="space-y-2">
      <span className="sr-only">{COPY.common.loading}</span>
      {[0, 1, 2].map((row) => (
        <span
          key={row}
          aria-hidden="true"
          className="block h-10 animate-pulse rounded-scroll bg-surface-2"
        />
      ))}
    </div>
  );
}
