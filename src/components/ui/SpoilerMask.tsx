import type { ReactNode } from 'react';

import type { SpoilerLevel } from '@/data/contracts/common';
import { cn } from '@/utils/cn';
import { COPY } from '@/utils/copy';

export interface SpoilerMaskProps {
  level: SpoilerLevel;
  /** 用户点击「揭开这一条」时调用；是否揭开由调用方决定（全局开关 + 单条揭开）。 */
  onReveal: () => void;
  children: ReactNode;
  className?: string;
}

/**
 * 剧透遮罩（站级原语，资讯与论坛共用）。
 *
 * 关键取舍：遮罩的内容层带 `aria-hidden` —— 读屏用户不应该比视觉用户更容易拿到剧透，
 * 否则「默认不剧透」这个承诺对无障碍用户就是失效的。
 * 揭开的入口是一个真正的按钮，键盘与读屏都能走到。
 */
export function SpoilerMask({ level, onReveal, children, className }: SpoilerMaskProps) {
  return (
    <div className={cn('relative overflow-hidden rounded-scroll', className)}>
      <div aria-hidden="true" className="pointer-events-none select-none opacity-50 blur-sm">
        {children}
      </div>

      <div
        role="group"
        aria-label={COPY.spoiler.title}
        className="bg-surface absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center"
      >
        <p className="stamp">{COPY.spoiler.levels[level]}</p>
        <p className="text-xs text-content-muted">{COPY.spoiler.title}</p>
        <button
          type="button"
          onClick={onReveal}
          className="border-token border-accent text-accent hover:bg-surface-2 rounded-scroll border px-3 py-1.5 text-xs transition-colors duration-fast"
        >
          {COPY.spoiler.reveal}
        </button>
      </div>
    </div>
  );
}
