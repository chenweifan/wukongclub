import type { ReactNode } from 'react';

import { ForbiddenPage } from '@/pages/forbidden/ForbiddenPage';
import { useDemo } from '@/demo/useDemo';
import type { DemoRole } from '@/demo/types';

export interface RequireRoleProps {
  /** 允许进入的身份白名单。 */
  allow: readonly DemoRole[];
  children: ReactNode;
}

/**
 * 身份守卫（协议第五节 阶段 0 交付物 5）。
 * 关键取舍：无权时**原地渲染 403 页，而不是重定向** ——
 * 重定向会让用户丢失当前 URL，也无法解释「为什么进不去」；
 * 渲染 Forbidden 页保留了可分享的地址与明确的原因。
 * 身份来源是 DemoProvider（阶段 1 接入演示控制台）。
 */
export function RequireRole({ allow, children }: RequireRoleProps) {
  const { role } = useDemo();

  if (!allow.includes(role)) {
    return <ForbiddenPage requiredRoles={allow} currentRole={role} />;
  }

  return <>{children}</>;
}
