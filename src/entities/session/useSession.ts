import { useCallback, useEffect, useRef, useState } from 'react';

import { readAuthToken } from '@/data/authToken';
import { authRepo } from '@/data/repositories';
import type { LoginInput, RegisterInput, User } from '@/data/contracts/user';
import { useDemoStore } from '@/demo/demoStore';
import { useSessionStore } from '@/entities/session/sessionStore';
import type { SessionStatus } from '@/entities/session/sessionStore';
import { describeUnknownError } from '@/utils/errorMessage';

export interface SessionValue {
  status: SessionStatus;
  user: User | null;
  isAuthenticated: boolean;
  /** 会话还在确认中（首屏用），用于避免「先显示未登录再闪成已登录」。 */
  isResolving: boolean;
}

export function useSession(): SessionValue {
  const status = useSessionStore((state) => state.status);
  const user = useSessionStore((state) => state.user);

  return {
    status,
    user,
    isAuthenticated: status === 'authenticated',
    isResolving: status === 'unknown',
  };
}

export interface SessionActions {
  login: (input: LoginInput) => Promise<User | null>;
  register: (input: RegisterInput) => Promise<User | null>;
  loginAsDemo: () => Promise<User | null>;
  logout: () => Promise<void>;
  isPending: boolean;
  /** 已本地化的失败原因，null 表示当前没有错误。 */
  error: string | null;
  clearError: () => void;
}

/**
 * 会话动作（登录/注册/登出）。
 *
 * 刻意不用 React Query 的 mutation：这三个动作改变的是「我是谁」，
 * 属于命令而不是缓存数据，用本地 pending/error 更直白，
 * 也避免把用户资料同时放进 Query 缓存与会话 store（双真相）。
 */
export function useSessionActions(): SessionActions {
  const [isPending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (task: () => Promise<User>): Promise<User | null> => {
    setPending(true);
    setError(null);

    try {
      const user = await task();
      useSessionStore.getState().markAuthenticated(user);
      return user;
    } catch (caught) {
      setError(describeUnknownError(caught));
      return null;
    } finally {
      setPending(false);
    }
  }, []);

  const login = useCallback(
    (input: LoginInput) => run(() => authRepo.login(input).then((result) => result.user)),
    [run],
  );

  const register = useCallback(
    (input: RegisterInput) => run(() => authRepo.register(input).then((result) => result.user)),
    [run],
  );

  const loginAsDemo = useCallback(
    () => run(() => authRepo.demoLogin().then((result) => result.user)),
    [run],
  );

  const logout = useCallback(async () => {
    setPending(true);
    setError(null);

    try {
      await authRepo.logout();
      useSessionStore.getState().markAnonymous();
    } catch (caught) {
      setError(describeUnknownError(caught));
      // authRepo.logout 内部已清掉本地令牌：即便服务端失败也按已登出处理
      useSessionStore.getState().markAnonymous();
    } finally {
      setPending(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { login, register, loginAsDemo, logout, isPending, error, clearError };
}

/**
 * 首屏恢复会话：有令牌就用它换回用户，401 则视为未登录。
 * 只在状态仍是 unknown 时执行一次。
 */
function useSessionBootstrap(): void {
  const status = useSessionStore((state) => state.status);

  useEffect(() => {
    if (status !== 'unknown') {
      return;
    }

    if (readAuthToken() === null) {
      useSessionStore.getState().markAnonymous();
      return;
    }

    let cancelled = false;

    void authRepo.me().then(
      (user) => {
        if (!cancelled) {
          useSessionStore.getState().markAuthenticated(user);
        }
      },
      () => {
        if (!cancelled) {
          useSessionStore.getState().markAnonymous();
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [status]);
}

/**
 * 演示身份 ↔ 登录态的联动。
 *
 * 为什么需要它：演示站要让「一条 URL 复现任意状态」对成长中心也成立 ——
 * `?demo=1&role=active` 打开就该是已登录。身份与登录态本是两件事
 * （前者是权限档位，后者是账号），这里只做**单向联动**，且只在演示模式开启时生效，
 * 这样普通浏览（无 demo 参数）永远不会把已登录用户踢下线。
 */
function useDemoRoleSessionSync(): void {
  const enabled = useDemoStore((state) => state.enabled);
  const role = useDemoStore((state) => state.role);
  const status = useSessionStore((state) => state.status);
  const inFlight = useRef(false);

  useEffect(() => {
    if (!enabled || status === 'unknown' || inFlight.current) {
      return;
    }

    const shouldBeLoggedIn =
      role === 'newbie' || role === 'active' || role === 'moderator' || role === 'admin';

    if (shouldBeLoggedIn && status === 'anonymous') {
      inFlight.current = true;
      void authRepo
        .demoLogin()
        .then((result) => {
          useSessionStore.getState().markAuthenticated(result.user);
        })
        .catch(() => {
          // 登录失败（例如断网态）保持未登录，界面会给出统一错误态
        })
        .finally(() => {
          inFlight.current = false;
        });
      return;
    }

    if (!shouldBeLoggedIn && status === 'authenticated') {
      inFlight.current = true;
      void authRepo
        .logout()
        .then(() => {
          useSessionStore.getState().markAnonymous();
        })
        .catch(() => {
          // authRepo.logout 已在 finally 里清掉本地令牌，这里只需兜住 Promise，
          // 避免出现未处理的 rejection（演示断网态下必现）
          useSessionStore.getState().markAnonymous();
        })
        .finally(() => {
          inFlight.current = false;
        });
    }
  }, [enabled, role, status]);
}

/** 在应用外壳挂一次即可（见 src/app/RootShell.tsx）。 */
export function useSessionLifecycle(): void {
  useSessionBootstrap();
  useDemoRoleSessionSync();
}
