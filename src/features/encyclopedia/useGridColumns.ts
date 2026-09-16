import { useEffect, useState } from 'react';

/**
 * 卡片墙的列数。
 *
 * 虚拟滚动必须知道「一行放几个」才能按行虚拟化，所以列数得在 JS 里算。
 * 用 matchMedia 读断点，并监听 resize（rAF 节流）——
 * jsdom 没有 matchMedia，此时退回固定值，测试与 story 依然可渲染。
 */
export const GRID_COLUMN_BREAKPOINTS: readonly { minWidth: number; columns: number }[] = [
  { minWidth: 1280, columns: 4 },
  { minWidth: 1024, columns: 3 },
  { minWidth: 640, columns: 2 },
];

/** 无 matchMedia 环境（jsdom / SSR）下的列数。 */
export const FALLBACK_COLUMNS = 2;

function readColumns(): number {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return FALLBACK_COLUMNS;
  }

  for (const breakpoint of GRID_COLUMN_BREAKPOINTS) {
    if (window.matchMedia(`(min-width: ${breakpoint.minWidth}px)`).matches) {
      return breakpoint.columns;
    }
  }

  return 1;
}

export function useGridColumns(): number {
  const [columns, setColumns] = useState(readColumns);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') {
      return;
    }

    let frame = 0;

    const handleResize = () => {
      if (frame !== 0) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setColumns(readColumns());
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  return columns;
}

/** 把列表按列数切成行（虚拟滚动的单位是行）。 */
export function chunkIntoRows<TItem>(items: readonly TItem[], columns: number): TItem[][] {
  const safeColumns = Math.max(1, Math.floor(columns));
  const rows: TItem[][] = [];

  for (let index = 0; index < items.length; index += safeColumns) {
    rows.push(items.slice(index, index + safeColumns));
  }

  return rows;
}
