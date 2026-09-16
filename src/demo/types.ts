import { DEFAULT_THEME, isTheme } from '@/app/theme';
import type { Theme } from '@/app/theme';

/**
 * 演示系统类型契约（协议第五节 阶段 1.1）。
 *
 * 注意：协议在 1.1 的类型契约里列出 6 个 uiState，但控制台一节写的是「7 态」。
 * 本轮以**类型契约**为准（它才是代码契约），差异已在交付报告里显式记录。
 */

/** 六种演示身份。 */
export const DEMO_ROLES = ['guest', 'newbie', 'active', 'moderator', 'admin', 'banned'] as const;

export type DemoRole = (typeof DEMO_ROLES)[number];

export const DEFAULT_DEMO_ROLE: DemoRole = 'guest';

/** 类型守卫：URL / localStorage 拿到的都是 unknown，先收敛再使用（协议铁律 9）。 */
export function isDemoRole(value: unknown): value is DemoRole {
  return typeof value === 'string' && (DEMO_ROLES as readonly string[]).includes(value);
}

/** 界面状态：驱动 <StateBoundary> 覆盖真实异步状态。 */
export const DEMO_UI_STATES = ['normal', 'empty', 'loading', 'error', 'slow', 'offline'] as const;

export type DemoUiState = (typeof DEMO_UI_STATES)[number];

export const DEFAULT_DEMO_UI_STATE: DemoUiState = 'normal';

export function isDemoUiState(value: unknown): value is DemoUiState {
  return typeof value === 'string' && (DEMO_UI_STATES as readonly string[]).includes(value);
}

/** 完整演示状态。它是「一条 URL 复现任意界面」的唯一数据源。 */
export interface DemoState {
  enabled: boolean;
  role: DemoRole;
  uiState: DemoUiState;
  theme: Theme;
  spoiler: boolean;
  seed: number;
  /** 冻结时间（ISO 字符串）：让演示数据的时间戳可复现。 */
  frozenTime: string | null;
  /** 待启动的引导剧本 id；启动后由 TourRunner 置回 null。 */
  tour: string | null;
  /** 截图模式：隐藏控制台与顶部提示条。 */
  clean: boolean;
  /** 布局栅格。 */
  grid: boolean;
}

export const DEFAULT_DEMO_STATE: DemoState = {
  enabled: false,
  role: DEFAULT_DEMO_ROLE,
  uiState: DEFAULT_DEMO_UI_STATE,
  theme: DEFAULT_THEME,
  spoiler: false,
  seed: 42,
  frozenTime: null,
  tour: null,
  clean: false,
  grid: false,
};

/** 字段清单：URL 序列化与快照校验都以此为准，避免新增字段时漏改。 */
export const DEMO_STATE_KEYS = [
  'enabled',
  'role',
  'uiState',
  'theme',
  'spoiler',
  'seed',
  'frozenTime',
  'tour',
  'clean',
  'grid',
] as const satisfies readonly (keyof DemoState)[];

export const DEMO_SEED_MIN = 0;
export const DEMO_SEED_MAX = 999_999;

/** 演示状态快照校验：用于导入快照与 URL 解析后的兜底。 */
export function isDemoState(value: unknown): value is DemoState {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.enabled === 'boolean' &&
    isDemoRole(candidate.role) &&
    isDemoUiState(candidate.uiState) &&
    isTheme(candidate.theme) &&
    typeof candidate.spoiler === 'boolean' &&
    typeof candidate.seed === 'number' &&
    Number.isInteger(candidate.seed) &&
    (candidate.frozenTime === null || typeof candidate.frozenTime === 'string') &&
    (candidate.tour === null || typeof candidate.tour === 'string') &&
    typeof candidate.clean === 'boolean' &&
    typeof candidate.grid === 'boolean'
  );
}
