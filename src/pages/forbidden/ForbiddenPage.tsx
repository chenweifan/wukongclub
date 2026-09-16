import { Link } from 'react-router-dom';

import type { DemoRole } from '@/demo/types';
import { COPY } from '@/utils/copy';

export interface ForbiddenPageProps {
  /** 该区域要求的身份；由 <RequireRole> 传入，缺省时不展示该行。 */
  requiredRoles?: readonly DemoRole[];
  currentRole?: DemoRole;
}

/**
 * 403 页：原地渲染而非重定向（取舍见 src/app/RequireRole.tsx 注释）。
 * 自带满屏容器：它替换的是整个布局，必须是完整页面。
 */
export function ForbiddenPage({ requiredRoles, currentRole }: ForbiddenPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-6 text-content">
      <section className="panel-scroll texture-grain w-full max-w-lg p-8 text-center">
        <p className="stamp inline-block">403</p>
        <h1 className="mt-4 text-2xl">{COPY.forbidden.title}</h1>
        <p className="mt-3 text-sm text-content-muted">{COPY.forbidden.hint}</p>

        {currentRole === undefined ? null : (
          <p className="mt-4 text-xs text-content-muted">
            {COPY.forbidden.currentRole}：<span className="text-accent">{currentRole}</span>
            {requiredRoles === undefined || requiredRoles.length === 0
              ? null
              : ` · 需要：${requiredRoles.join(' / ')}`}
          </p>
        )}

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
