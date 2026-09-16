export interface GourdButtonProps {
  onClick: () => void;
  label: string;
  expanded?: boolean;
  hint?: string;
}

/**
 * 右下角「葫芦」按钮：演示控制台的开关。
 * 无障碍：aria-label + aria-expanded 常驻，键盘 Tab 可达，Enter/Space 触发。
 */
export function GourdButton({ onClick, label, expanded = false, hint }: GourdButtonProps) {
  return (
    <button
      type="button"
      data-tour="gourd"
      onClick={onClick}
      aria-label={label}
      aria-expanded={expanded}
      title={hint ?? label}
      className="border-token border-accent bg-surface text-accent shadow-seal hover:bg-surface-2 fixed bottom-5 right-5 z-[var(--hmw-z-console)] flex h-12 w-12 items-center justify-center rounded-full border transition-transform duration-fast hover:scale-105"
    >
      <GourdGlyph />
    </button>
  );
}

/** 内联 SVG 葫芦：不引图标库，颜色跟随 currentColor，主题切换自动适配。 */
function GourdGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <circle cx="12" cy="15.4" r="6.1" fill="currentColor" />
      <circle cx="12" cy="8.2" r="4.1" fill="currentColor" />
      <path
        d="M12 3.9v1.9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
