import { useId } from 'react';

import * as Switch from '@radix-ui/react-switch';

import { cn } from '@/utils/cn';

export interface SwitchFieldProps {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  hint?: string;
  /** 供引导/测试定位用（渲染成 data-tour）。 */
  tourId?: string;
}

/**
 * 开关字段（Radix Switch 原语：键盘 Space/Enter 切换、aria-checked 由原语维护）。
 * 标签用 <label htmlFor> 与开关绑定，因此点击文字也能切换。
 */
export function SwitchField({ label, checked, onCheckedChange, hint, tourId }: SwitchFieldProps) {
  const controlId = useId();
  const hintId = `${controlId}-hint`;

  return (
    <div className="flex items-center justify-between gap-3" data-tour={tourId}>
      <label htmlFor={controlId} className="cursor-pointer text-xs text-content-muted">
        {label}
      </label>

      <Switch.Root
        id={controlId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-describedby={hint === undefined ? undefined : hintId}
        className={cn(
          'border-token border-line relative h-5 w-10 shrink-0 rounded-full transition-colors duration-fast',
          'data-[state=checked]:bg-accent data-[state=unchecked]:bg-surface-2',
        )}
      >
        <Switch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-content transition-transform duration-fast data-[state=checked]:translate-x-[1.35rem] data-[state=checked]:bg-accent-ink" />
      </Switch.Root>

      {hint === undefined ? null : (
        <span id={hintId} className="sr-only">
          {hint}
        </span>
      )}
    </div>
  );
}
