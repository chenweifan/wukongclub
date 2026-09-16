import { cn } from '@/utils/cn';

export interface SegmentedOption<TValue extends string> {
  value: TValue;
  label: string;
  /** 悬停说明（例如「断网：所有请求立即失败」）。 */
  title?: string;
}

export interface SegmentedControlProps<TValue extends string> {
  /** 分组名称：会作为 role=group 的 aria-label。 */
  label: string;
  value: TValue;
  options: readonly SegmentedOption<TValue>[];
  onChange: (value: TValue) => void;
  tourId?: string;
}

/**
 * 分段选择器（原语级组件）。
 *
 * 取舍：用 role=group + aria-pressed 而不是 radiogroup + roving tabindex。
 * 前者每个选项都在 Tab 序里、语义直白、出错概率低；后者更「标准」但需要额外维护
 * 方向键与焦点管理。本项目的选项数都在 3–6 个，可发现性优先。
 * 选中态不只用颜色表达，另有描边与字重差异，满足非色彩可辨。
 */
export function SegmentedControl<TValue extends string>({
  label,
  value,
  options,
  onChange,
  tourId,
}: SegmentedControlProps<TValue>) {
  return (
    <div role="group" aria-label={label} data-tour={tourId} className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            title={option.title}
            onClick={() => {
              onChange(option.value);
            }}
            className={cn(
              'border-token rounded-scroll border px-2 py-1 text-xs transition-colors duration-fast',
              selected
                ? 'border-accent bg-accent text-accent-ink font-medium'
                : 'border-line text-content-muted hover:text-content',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
