import { create } from 'zustand';

/**
 * 轻量 Toast（演示模式拦截外链、数据操作回执都靠它反馈）。
 * 为什么不用第三方库：协议锁定的依赖里没有 toast 库，且这里只需要「排队 + 自动消失」。
 */

export type ToastTone = 'info' | 'success' | 'danger';

export interface ToastItem {
  id: string;
  message: string;
  tone: ToastTone;
}

export interface ToastState {
  items: readonly ToastItem[];
  push: (message: string, tone?: ToastTone) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

export const TOAST_DURATION_MS = 3800;
export const TOAST_VISIBLE_LIMIT = 4;

/** 自增序号而非随机 id：确定性更好，测试里可以断言。 */
let toastSequence = 0;

function nextToastId(): string {
  toastSequence += 1;
  return `toast-${toastSequence}`;
}

export const useToastStore = create<ToastState>()((set) => ({
  items: [],
  push: (message, tone = 'info') => {
    const item: ToastItem = { id: nextToastId(), message, tone };
    set((state) => ({ items: [...state.items, item].slice(-TOAST_VISIBLE_LIMIT) }));
    return item.id;
  },
  dismiss: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
  clear: () => set({ items: [] }),
}));

/** 非组件环境（effect、事件回调、Repository 之外的工具）也能弹提示。 */
export function pushToast(message: string, tone: ToastTone = 'info'): string {
  return useToastStore.getState().push(message, tone);
}
