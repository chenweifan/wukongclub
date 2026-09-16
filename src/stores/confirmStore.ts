import { create } from 'zustand';

/**
 * 破坏性操作统一二次确认（协议铁律 7）。
 * 用 Promise 形态暴露：调用点写成 `if (!(await requestConfirm({...}))) return;`，
 * 比「受控弹窗 + 一堆 open 状态」更不容易写漏。
 */

export interface ConfirmRequest {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  tone?: 'default' | 'danger';
}

interface PendingConfirm extends ConfirmRequest {
  id: string;
  resolve: (confirmed: boolean) => void;
}

export interface ConfirmState {
  pending: PendingConfirm | null;
  request: (config: ConfirmRequest) => Promise<boolean>;
  settle: (confirmed: boolean) => void;
}

let confirmSequence = 0;

export const useConfirmStore = create<ConfirmState>()((set, get) => ({
  pending: null,

  request: (config) =>
    new Promise<boolean>((resolve) => {
      const previous = get().pending;
      if (previous !== null) {
        // 同一时刻只处理一个确认框：先前那个按「取消」结算，避免它的 await 永远悬着
        previous.resolve(false);
      }

      confirmSequence += 1;
      set({ pending: { ...config, id: `confirm-${confirmSequence}`, resolve } });
    }),

  settle: (confirmed) => {
    const { pending } = get();
    if (pending === null) {
      return;
    }
    pending.resolve(confirmed);
    set({ pending: null });
  },
}));

/** 组件外也能发起确认（例如场景切换、快捷键处理）。 */
export function requestConfirm(config: ConfirmRequest): Promise<boolean> {
  return useConfirmStore.getState().request(config);
}
