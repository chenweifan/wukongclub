import { useEffect } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { TOAST_DURATION_MS, useToastStore } from '@/stores/toastStore';
import type { ToastItem } from '@/stores/toastStore';
import { cn } from '@/utils/cn';

/**
 * 全局提示宿主。
 * 无障碍：容器是 aria-live="polite" 的 status 区域，屏幕阅读器会朗读新提示；
 * danger 档用 role="alert" 提升紧急度。
 */
export function ToastHost() {
  const items = useToastStore((state) => state.items);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 left-4 z-[var(--hmw-z-toast)] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
    >
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastCardProps {
  item: ToastItem;
  onDismiss: (id: string) => void;
}

function ToastCard({ item, onDismiss }: ToastCardProps) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onDismiss(item.id);
    }, TOAST_DURATION_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [item.id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      role={item.tone === 'danger' ? 'alert' : undefined}
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-scroll border-token border bg-surface px-3 py-2 text-xs shadow-panel',
        item.tone === 'danger' ? 'border-danger text-danger' : 'border-line text-content',
      )}
    >
      <span className="min-w-0 flex-1 break-words">{item.message}</span>
      <button
        type="button"
        onClick={() => {
          onDismiss(item.id);
        }}
        aria-label="关闭提示"
        className="text-content-muted hover:text-content shrink-0"
      >
        ✕
      </button>
    </motion.div>
  );
}
