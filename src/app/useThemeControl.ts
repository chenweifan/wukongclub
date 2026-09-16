import { useCallback } from 'react';

import type { Theme } from '@/app/theme';
import { useDemoStore } from '@/demo/demoStore';

export interface ThemeControl {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

/**
 * 主题读写入口（供顶栏切换器等 UI 使用）。
 * 它只是 demoStore.theme 的一层薄适配：状态源仍然是 DemoState，
 * 因此 URL 上的 theme 参数、控制台与顶栏三处永远一致。
 */
export function useThemeControl(): ThemeControl {
  const theme = useDemoStore((state) => state.theme);
  const patch = useDemoStore((state) => state.patch);

  const setTheme = useCallback(
    (next: Theme) => {
      patch({ theme: next });
    },
    [patch],
  );

  return { theme, setTheme };
}
