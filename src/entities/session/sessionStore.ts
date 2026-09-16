import { create } from 'zustand';

import type { User } from '@/data/contracts/user';

/**
 * 会话状态（客户端）。
 *
 * 这里**只**保存「当前是谁」；令牌由 data 层的 authToken 负责（请求头需要它）。
 * 不持久化本 store：刷新后靠 useSessionBootstrap 用令牌换回用户，
 * 这样服务端把用户删了（例如演示数据被重置）时，前端不会显示一个幽灵账号。
 */
export type SessionStatus = 'unknown' | 'anonymous' | 'authenticated';

export interface SessionState {
  status: SessionStatus;
  user: User | null;
  markAnonymous: () => void;
  markAuthenticated: (user: User) => void;
  /** 资料更新后局部刷新（例如拿到新徽章、发放灵蕴）。 */
  updateUser: (user: User) => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  status: 'unknown',
  user: null,
  markAnonymous: () => set({ status: 'anonymous', user: null }),
  markAuthenticated: (user) => set({ status: 'authenticated', user }),
  updateUser: (user) => set({ status: 'authenticated', user }),
}));
