import { Link, useRouteError } from 'react-router-dom';

import { describeUnknownError, readErrorStatus } from '@/utils/errorMessage';
import { COPY } from '@/utils/copy';

/**
 * Data Router 的 errorElement。
 * useRouteError() 返回 unknown，必须经类型守卫收敛（铁律 9），
 * 这里刻意不在生产环境暴露原始堆栈，只展示收敛后的 message 与状态码。
 */
export function RouteErrorPage() {
  const error = useRouteError();
  const status = readErrorStatus(error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-6 text-content">
      <section role="alert" className="panel-scroll texture-grain w-full max-w-lg p-8 text-center">
        <p className="stamp inline-block">{status === null ? 'ERROR' : status}</p>
        <h1 className="mt-4 text-2xl">{COPY.error.routeTitle}</h1>
        <p className="mt-3 text-sm text-content-muted">{COPY.error.routeHint}</p>
        <p className="mt-4 break-words text-xs text-danger">{describeUnknownError(error)}</p>
        <Link
          to="/"
          className="border-token border-line mt-6 inline-block rounded-scroll border px-4 py-2 text-sm text-accent"
        >
          {COPY.common.backHome}
        </Link>
      </section>
    </div>
  );
}
