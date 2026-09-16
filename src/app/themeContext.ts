import { createContext, useContext } from 'react';

import type { Theme } from '@/app/theme';

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

/**
 * Context 与 Provider 拆到两个文件：Provider 文件只导出组件，
 * 以满足 react-refresh 的 only-export-components 约束（热更新不丢状态）。
 */
export const ThemeContext = createContext<ThemeContextValue | null>(null);

/** 读取主题控制权；脱离 Provider 使用时直接报错，避免静默失效。 */
export function useThemeControl(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new Error('useThemeControl 必须在 <ThemeProvider> 内部使用');
  }

  return context;
}
