import { useEffect } from 'react';

import type { ReactNode } from 'react';

import { applyThemeAttribute, writeStoredTheme } from '@/app/theme';
import { useDemoStore } from '@/demo/demoStore';

export interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * 主题副作用宿主。
 *
 * 阶段 1 起，主题的**唯一状态源**是 demoStore.theme（协议把 theme 归入 DemoState）：
 * 顶栏切换器与控制台主题分区都写同一个字段，本组件只负责把它同步到
 * <html data-theme> 与 localStorage（hmw:theme）。
 * 这样就不会出现「控制台改了主题、顶栏没跟着变」这类双真相问题。
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useDemoStore((state) => state.theme);

  useEffect(() => {
    applyThemeAttribute(theme);
    writeStoredTheme(theme);
  }, [theme]);

  return <>{children}</>;
}
