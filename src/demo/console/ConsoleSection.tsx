import { useId, useState } from 'react';

import type { ReactNode } from 'react';

export interface ConsoleSectionProps {
  title: string;
  hint?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  /** 引导与测试用的锚点（渲染成 data-tour）。 */
  tourId?: string;
}

/**
 * 控制台分区外壳（可折叠）。
 * 用原生 button + aria-expanded/aria-controls，而不是 <details>：
 * 后者在样式与动画上更难控，且部分读屏对 summary 的支持并不一致。
 */
export function ConsoleSection({
  title,
  hint,
  children,
  defaultOpen = false,
  tourId,
}: ConsoleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <section data-tour={tourId} className="border-token border-line border-t first:border-t-0">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={() => {
            setOpen((previous) => !previous);
          }}
          className="flex w-full items-center justify-between gap-2 py-2 text-left"
        >
          <span className="text-xs font-medium text-content">{title}</span>
          <span aria-hidden="true" className="text-content-muted text-xs">
            {open ? '−' : '+'}
          </span>
        </button>
      </h3>

      {open ? (
        <div id={contentId} className="space-y-2 pb-3">
          {hint === undefined ? null : (
            <p className="text-[11px] leading-relaxed text-content-muted">{hint}</p>
          )}
          {children}
        </div>
      ) : null}
    </section>
  );
}
