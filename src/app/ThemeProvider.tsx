import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ReactNode } from 'react';

import { ThemeContext } from '@/app/themeContext';
import type { ThemeContextValue } from '@/app/themeContext';
import { applyThemeAttribute, readStoredTheme, writeStoredTheme } from '@/app/theme';

export interface ThemeProviderProps {
  children: ReactNode;
  /** 便于测试注入初始主题；不传则读取 localStorage。 */
  initialTheme?: ThemeContextValue['theme'];
}

/**
 * 主题 Provider：状态源是 <html data-theme>（协议第七节），
 * React 侧只保存一份镜像以保证控件选中态同步。
 */
export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeContextValue['theme']>(
    () => initialTheme ?? readStoredTheme(),
  );

  useEffect(() => {
    applyThemeAttribute(theme);
    writeStoredTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next: ThemeContextValue['theme']) => {
    setThemeState(next);
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
