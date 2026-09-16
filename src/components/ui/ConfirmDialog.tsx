import * as Dialog from '@radix-ui/react-dialog';

import { useConfirmStore } from '@/stores/confirmStore';
import { COPY } from '@/utils/copy';

/**
 * 二次确认弹窗（Radix Dialog：焦点陷阱、Esc 关闭、aria 关联都由原语负责）。
 * 它是 confirmStore 的唯一渲染者：任何破坏性操作只需 await requestConfirm()。
 */
export function ConfirmDialogHost() {
  const pending = useConfirmStore((state) => state.pending);
  const settle = useConfirmStore((state) => state.settle);
  const open = pending !== null;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          settle(false);
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[var(--hmw-z-modal)] bg-overlay backdrop-blur-sm" />
        <Dialog.Content className="rounded-scroll border-token border-line bg-surface shadow-panel fixed left-1/2 top-1/2 z-[var(--hmw-z-modal)] w-[min(26rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 p-6">
          <Dialog.Title className="font-display text-lg text-content">
            {pending?.title ?? ''}
          </Dialog.Title>

          {pending?.description === undefined ? null : (
            <Dialog.Description className="mt-3 text-sm text-content-muted">
              {pending.description}
            </Dialog.Description>
          )}

          {pending?.tone === 'danger' ? (
            <p className="text-danger mt-3 text-xs">{COPY.confirm.dangerHint}</p>
          ) : null}

          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close asChild>
              <button
                type="button"
                className="border-token border-line hover:text-content rounded-scroll border px-4 py-2 text-sm text-content-muted"
              >
                {pending?.cancelText ?? COPY.confirm.cancelText}
              </button>
            </Dialog.Close>

            <button
              type="button"
              autoFocus
              onClick={() => {
                settle(true);
              }}
              className={
                pending?.tone === 'danger'
                  ? 'bg-danger rounded-scroll px-4 py-2 text-sm text-white'
                  : 'bg-accent text-accent-ink rounded-scroll px-4 py-2 text-sm'
              }
            >
              {pending?.confirmText ?? COPY.confirm.confirmText}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
