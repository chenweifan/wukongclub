/** 三套主题（协议第五节 阶段 0 交付物 3）。 */
export const THEMES = ['ink', 'paper', 'contrast'] as const;

export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = 'ink';

/**
 * 主题持久化键。
 * 命名空间前缀 `hmw:` 是协议硬约束（第六节 / 第九节）。
 * 注意：index.html 的防闪烁内联脚本硬编码了同一个键名，改动需同步。
 */
export const THEME_STORAGE_KEY = 'hmw:theme';

/** 类型守卫：localStorage / URL query 拿到的都是 unknown，必须先收敛再使用。 */
export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}

/** 读取已持久化主题；隐私模式或非法值一律回落到默认主题，绝不抛错。 */
export function readStoredTheme(): Theme {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME;
  }

  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(raw) ? raw : DEFAULT_THEME;
  } catch {
    // Safari 隐私模式下 localStorage 会直接抛错，主题不该因此崩掉
    return DEFAULT_THEME;
  }
}

/** 写入持久化主题；写失败（配额/隐私模式）不影响本次会话的显示效果。 */
export function writeStoredTheme(theme: Theme): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // 忽略：持久化失败只是下次打开回到默认主题，不阻断交互
  }
}

/** 把主题写到 <html data-theme>，tokens.css 的三套主题据此生效。 */
export function applyThemeAttribute(theme: Theme, root: HTMLElement | null = null): void {
  const target = root ?? (typeof document === 'undefined' ? null : document.documentElement);
  if (target === null) {
    return;
  }
  target.setAttribute('data-theme', theme);
}
