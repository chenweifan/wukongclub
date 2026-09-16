/**
 * 布局栅格（工具）：12 列竖向参考线，用于对齐检查。
 * aria-hidden + pointer-events-none：它对读屏与鼠标都是完全透明的。
 *
 * 半透明色用内联 color-mix，而不是 Tailwind 的透明度修饰符：
 * v3 无法为 var() 定义的颜色生成这类规则，整条声明会被静默丢弃。
 * 项目内已用 tokenUsage.test.ts 守住这条约定。
 */
export function GridOverlay() {
  const columnStyle = {
    backgroundColor: 'color-mix(in srgb, var(--hmw-accent) 6%, transparent)',
    borderColor: 'color-mix(in srgb, var(--hmw-accent) 28%, transparent)',
  } as const;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[var(--hmw-z-grid)] mx-auto flex max-w-page gap-4 px-4"
    >
      {Array.from({ length: 12 }, (_, index) => (
        <span key={index} style={columnStyle} className="flex-1 border-x" />
      ))}
    </div>
  );
}
