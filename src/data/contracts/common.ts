/** 分页响应契约（协议 6.2 的 Paginated）。 */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** 统一错误响应体（MSW handler 返回的错误都用这个形状）。 */
export interface ApiErrorBody {
  message: string;
  code?: string;
}

/**
 * 由于所有跨层数据都来自 fetch（untuk 运行期无法验证类型），
 * 这里提供一组运行时守卫：Repository 用它把 unknown 收敛成契约类型，而不是用类型断言。
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return isRecord(value) && typeof value.message === 'string';
}

/** 构造一个针对具体元素类型的分页守卫，避免为每个契约重复写一遍字段校验。 */
export function isPaginatedOf<T>(
  value: unknown,
  isItem: (item: unknown) => item is T,
): value is Paginated<T> {
  if (!isRecord(value)) {
    return false;
  }

  const { items, total, page, pageSize } = value;

  return (
    Array.isArray(items) &&
    items.every((item) => isItem(item)) &&
    typeof total === 'number' &&
    typeof page === 'number' &&
    typeof pageSize === 'number'
  );
}

export const DEFAULT_PAGE_SIZE = 20;

/** 把数组裁成契约分页形状（mock 实现与种子数据共用）。 */
export function toPaginated<T>(
  items: readonly T[],
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Paginated<T> {
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
  };
}
