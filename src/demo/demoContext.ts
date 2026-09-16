import { createContext, useContext } from 'react';

import type { DemoContextValue } from '@/demo/types';

/** Context 与 Provider 分文件：Provider 文件只导出组件，保证 react-refresh 可用。 */
export const DemoContext = createContext<DemoContextValue | null>(null);

/** 读取演示状态；脱离 Provider 使用时直接报错，避免身份判断静默失效。 */
export function useDemo(): DemoContextValue {
  const context = useContext(DemoContext);

  if (context === null) {
    throw new Error('useDemo 必须在 <DemoProvider> 内部使用');
  }

  return context;
}
