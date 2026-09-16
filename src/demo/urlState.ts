import { isTheme } from '@/app/theme';
import { DEMO_SEED_MAX, DEMO_SEED_MIN, isDemoRole, isDemoUiState } from '@/demo/types';
import type { DemoState } from '@/demo/types';

/**
 * DemoState ↔ URL query 的双向映射（协议 1.2）。
 *
 * 设计要点：
 * 1.解析与序列化都是**纯函数**，因此可以用单测钉死「幂等」这条验收标准；
 * 2.序列化只增删自己认识的参数，`?wikiEntry=...` / `?guideKind=...` 这类业务参数原样保留；
 * 3.演示模式开启时把全部字段显式写进 URL —— 链接才是自描述的，换台机器打开也完全一致。
 */

/** query 参数名 → DemoState 字段。 */
export const DEMO_QUERY_KEYS = {
  demo: 'enabled',
  role: 'role',
  ui: 'uiState',
  theme: 'theme',
  spoiler: 'spoiler',
  seed: 'seed',
  time: 'frozenTime',
  tour: 'tour',
  clean: 'clean',
  grid: 'grid',
} as const;

/** 已知的演示参数名（写回时需要先清掉它们，避免残留旧值）。 */
export const DEMO_QUERY_PARAM_NAMES = Object.keys(DEMO_QUERY_KEYS);

/** 布尔参数解析：只认这几个明确写法，其余一律视为 false，不做「任意非空即真」的猜测。 */
export function parseDemoBoolean(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}

function parseSeed(value: string): number | null {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < DEMO_SEED_MIN || parsed > DEMO_SEED_MAX) {
    return null;
  }
  return parsed;
}

function parseFrozenTime(value: string): string | null {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
}

/**
 * 解析 URL query → DemoState 片段。
 * 非法值一律忽略（保留当前状态），不抛错：演示链接被手改坏时页面仍要能打开。
 */
export function parseDemoQuery(search: string): Partial<DemoState> {
  const params = new URLSearchParams(search);
  const patch: Partial<DemoState> = {};

  const demo = params.get('demo');
  const role = params.get('role');
  const ui = params.get('ui');
  const theme = params.get('theme');
  const spoiler = params.get('spoiler');
  const seed = params.get('seed');
  const time = params.get('time');
  const tour = params.get('tour');
  const clean = params.get('clean');
  const grid = params.get('grid');

  if (isDemoRole(role)) {
    patch.role = role;
  }
  if (isDemoUiState(ui)) {
    patch.uiState = ui;
  }
  if (isTheme(theme)) {
    patch.theme = theme;
  }
  if (spoiler !== null) {
    patch.spoiler = parseDemoBoolean(spoiler);
  }
  if (seed !== null) {
    const parsedSeed = parseSeed(seed);
    if (parsedSeed !== null) {
      patch.seed = parsedSeed;
    }
  }
  if (time !== null) {
    const parsedTime = parseFrozenTime(time);
    if (parsedTime !== null) {
      patch.frozenTime = parsedTime;
    }
  }
  if (tour !== null && tour.trim() !== '') {
    patch.tour = tour;
  }
  if (clean !== null) {
    patch.clean = parseDemoBoolean(clean);
  }
  if (grid !== null) {
    patch.grid = parseDemoBoolean(grid);
  }

  if (demo !== null) {
    patch.enabled = parseDemoBoolean(demo);
  } else if (hasDemoQuery(search)) {
    // 只写了 role=admin 这类参数时，视为「意图进入演示模式」，
    // 否则参数生效却看不到控制台，会让人以为是 bug。
    patch.enabled = true;
  }

  return patch;
}

/** URL 是否携带了任意一个演示参数。 */
export function hasDemoQuery(search: string): boolean {
  const params = new URLSearchParams(search);
  return DEMO_QUERY_PARAM_NAMES.some((name) => params.has(name));
}

/**
 * 把 DemoState 写回 query（纯函数）。
 * 返回带 `?` 的完整 search；演示关闭时返回空串（即把演示参数全部摘掉）。
 */
export function writeDemoStateToUrl(search: string, state: DemoState): string {
  const params = new URLSearchParams(search);

  for (const name of DEMO_QUERY_PARAM_NAMES) {
    params.delete(name);
  }

  if (state.enabled) {
    params.set('demo', '1');
    params.set('role', state.role);
    params.set('ui', state.uiState);
    params.set('theme', state.theme);
    params.set('spoiler', state.spoiler ? '1' : '0');
    params.set('seed', String(state.seed));
    params.set('clean', state.clean ? '1' : '0');
    params.set('grid', state.grid ? '1' : '0');
    if (state.frozenTime !== null) {
      params.set('time', state.frozenTime);
    }
    if (state.tour !== null) {
      params.set('tour', state.tour);
    }
  }

  const serialized = params.toString();
  return serialized === '' ? '' : `?${serialized}`;
}

/** 单测与调试用：URL → 状态（默认值兜底），语义与 DemoProvider 初始化一致。 */
export function readDemoStateFromUrl(search: string, fallback: DemoState): DemoState {
  return { ...fallback, ...parseDemoQuery(search) };
}
