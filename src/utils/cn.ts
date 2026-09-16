/** 可参与拼接的值：故意不接受 number / object，避免把 `0`、`NaN` 之类静默拼进类名。 */
export type ClassValue = string | false | null | undefined;

/**
 * 极简 className 组合器。
 * 为什么不引 clsx / tailwind-merge：当前无需冲突消解，且协议限制新增依赖；
 * 若后续出现同类名覆盖需求，再评估引入 tailwind-merge（需先申请）。
 */
export function cn(...values: readonly ClassValue[]): string {
  return values
    .filter((value): value is string => typeof value === 'string' && value !== '')
    .join(' ');
}
