import { useCallback, useMemo, useState } from 'react';

import type { ReactNode } from 'react';

import { DemoContext } from '@/demo/demoContext';
import { readStoredDemoRole, writeStoredDemoRole } from '@/demo/demoRoleStorage';
import type { DemoContextValue, DemoRole } from '@/demo/types';

export interface DemoProviderProps {
  children: ReactNode;
  /** 便于测试注入初始身份。 */
  initialRole?: DemoRole;
}

/**
 * 演示系统 Provider —— 阶段 0 空实现（协议第五节 阶段 0 交付物 4）。
 *
 * TODO(阶段 1)：本文件将被重写为「URL query ↔ DemoState」双向同步的完整实现，
 * 届时 `enabled` 由 `?demo=1` 决定，role 由 `?role=` 决定，并补齐
 * uiState / theme / spoiler / seed / frozenTime / tour / clean / grid 与写回逻辑。
 * 现在保留 role 是为了让 <RequireRole> 有可验证的状态源。
 */
export function DemoProvider({ children, initialRole }: DemoProviderProps) {
  const [role, setRoleState] = useState<DemoRole>(() => initialRole ?? readStoredDemoRole());

  const setRole = useCallback((next: DemoRole) => {
    setRoleState(next);
    writeStoredDemoRole(next);
  }, []);

  const value = useMemo<DemoContextValue>(
    () => ({ enabled: false, role, setRole }),
    [role, setRole],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}
