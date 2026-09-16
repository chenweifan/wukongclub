import { useThemeControl } from '@/app/useThemeControl';
import { THEMES } from '@/app/theme';
import { cn } from '@/utils/cn';
import { COPY } from '@/utils/copy';

/**
 * 主题切换控件（阶段 0 验收用：需要肉眼验证三套主题配色差异明显）。
 * 阶段 1 起，主题同样会出现在 DemoConsole 里；届时本控件保留在头部作为常驻入口，
 * 两者共用 ThemeContext 这一唯一状态源，不会产生双真相。
 * 无障碍：使用 role=group + aria-pressed 表达选中态，键盘 Tab/Enter 天然可达。
 */
export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeControl();

  return (
    <div
      role="group"
      aria-label={COPY.layout.themeLabel}
      className="border-token border-line bg-surface inline-flex items-center gap-1 rounded-scroll p-1"
    >
      {THEMES.map((candidate) => {
        const selected = candidate === theme;

        return (
          <button
            key={candidate}
            type="button"
            aria-pressed={selected}
            onClick={() => setTheme(candidate)}
            className={cn(
              'rounded-sm px-2 py-1 text-xs transition-colors duration-fast',
              selected
                ? 'bg-accent text-accent-ink font-medium'
                : 'text-content-muted hover:text-content',
            )}
          >
            {COPY.theme[candidate]}
          </button>
        );
      })}
    </div>
  );
}
