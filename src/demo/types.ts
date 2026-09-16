/**
 * 演示系统类型契约。
 * 阶段 0 只落地身份（role）这一最小切片 —— <RequireRole> 守卫需要它；
 * 完整的 DemoState（uiState / theme / spoiler / seed / frozenTime / tour / clean / grid）
 * 按协议在阶段 1 补齐到本文件。
 */

/** 六种演示身份（协议第五节 阶段 1.1）。 */
export const DEMO_ROLES = ['guest', 'newbie', 'active', 'moderator', 'admin', 'banned'] as const;

export type DemoRole = (typeof DEMO_ROLES)[number];

export const DEFAULT_DEMO_ROLE: DemoRole = 'guest';

/** 类型守卫：URL / localStorage 拿到的都是 unknown，先收敛再使用（铁律 9）。 */
export function isDemoRole(value: unknown): value is DemoRole {
  return typeof value === 'string' && (DEMO_ROLES as readonly string[]).includes(value);
}

/** DemoProvider 暴露给 UI 的能力（阶段 1 会扩展为完整 DemoState 读写）。 */
export interface DemoContextValue {
  /** 是否处于演示模式。阶段 0 恒为 false；阶段 1 由 URL query `demo=1` 驱动。 */
  enabled: boolean;
  role: DemoRole;
  setRole: (role: DemoRole) => void;
}
