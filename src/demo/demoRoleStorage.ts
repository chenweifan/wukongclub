import { DEFAULT_DEMO_ROLE, isDemoRole } from '@/demo/types';
import type { DemoRole } from '@/demo/types';

/**
 * ⚠️ 阶段 0 临时脚手架，阶段 1 会整体删除本文件。
 *
 * 为什么需要它：阶段 0 的 DemoProvider 是空实现（协议第五节明确要求），
 * 但 <RequireRole> 守卫与后台布局必须可被验证（至少能看到 /admin 放行后的样子）。
 * 阶段 1 引入 DemoConsole 后，身份的唯一起源将是 URL query + DemoState，
 * 这层 localStorage 兜底必须移除，避免出现第二个真相来源。
 */
export const DEMO_ROLE_STORAGE_KEY = 'hmw:demo-role';

export function readStoredDemoRole(): DemoRole {
  if (typeof window === 'undefined') {
    return DEFAULT_DEMO_ROLE;
  }

  try {
    const raw = window.localStorage.getItem(DEMO_ROLE_STORAGE_KEY);
    return isDemoRole(raw) ? raw : DEFAULT_DEMO_ROLE;
  } catch {
    return DEFAULT_DEMO_ROLE;
  }
}

export function writeStoredDemoRole(role: DemoRole): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(DEMO_ROLE_STORAGE_KEY, role);
  } catch {
    // 持久化失败不影响本次会话
  }
}
