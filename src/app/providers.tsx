import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import type { ReactNode } from 'react';

import { ThemeProvider } from '@/app/ThemeProvider';
import { DemoProvider } from '@/demo/DemoProvider';

/**
 * QueryClient 是模块级单例：
 * 放进组件里会造成每次渲染新建缓存（等价于关掉缓存），
 * 而 HMR 场景下的模块级单例已足够，无需额外挂到 window 上。
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 协议指定：60s 内视为新鲜数据
      retry: 1, // 协议指定：只重试 1 次，避免演示时错误态被重试掩盖
      refetchOnWindowFocus: false,
      gcTime: 5 * 60_000,
    },
    mutations: {
      retry: 0,
    },
  },
});

export interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Provider 组合顺序：主题（最外层，决定视觉）→ 演示状态（决定数据形态）→ 服务端状态。
 * 组合顺序在此固定，页面与布局不再自行包 Provider。
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <DemoProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </DemoProvider>
    </ThemeProvider>
  );
}
