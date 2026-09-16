import { useRef } from 'react';

import { useVirtualizer } from '@tanstack/react-virtual';

import type { WikiEntry } from '@/data/contracts/encyclopedia';
import { WikiCard } from '@/features/encyclopedia/components/WikiCard';
import { chunkIntoRows, useGridColumns } from '@/features/encyclopedia/useGridColumns';
import { COPY } from '@/utils/copy';

export interface WikiCardWallProps {
  entries: readonly WikiEntry[];
  searchTerm: string;
  favoriteIds: readonly string[];
  compareIds: readonly string[];
  compareFull: boolean;
  favoritePendingId?: string | null;
  onOpen: (entryId: string) => void;
  onToggleFavorite: (entryId: string) => void;
  onToggleCompare: (entryId: string) => void;
}

/** 单行高度估算值：真实高度由 measureElement 动态校正。 */
const ROW_ESTIMATE_PX = 300;

/**
 * 卡片墙（行虚拟化）。
 *
 * 为什么按「行」而不是按「卡片」虚拟化：网格布局的纵向滚动单位是行，
 * 按卡片虚拟化会让同一行的卡片各自算出不同的偏移量，出现错位。
 * 行内卡片高度不一，交给 measureElement 动态测量。
 *
 * 词条数量在几十到上百条之间，虚拟化在这里不是炫技 ——
 * 每张卡片都带图（SVG）与高亮文本，全量渲染会明显拖慢筛选切换。
 */
export function WikiCardWall({
  entries,
  searchTerm,
  favoriteIds,
  compareIds,
  compareFull,
  favoritePendingId = null,
  onOpen,
  onToggleFavorite,
  onToggleCompare,
}: WikiCardWallProps) {
  const columns = useGridColumns();
  const rows = chunkIntoRows(entries, columns);
  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_ESTIMATE_PX,
    overscan: 2,
  });

  if (entries.length === 0) {
    return null;
  }

  return (
    <div
      ref={scrollRef}
      role="region"
      aria-label={COPY.wiki.title}
      className="max-h-[70vh] overflow-y-auto pr-1"
    >
      <div className="relative" style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index] ?? [];

          return (
            <div
              key={virtualRow.key}
              ref={virtualizer.measureElement}
              data-index={virtualRow.index}
              className="absolute inset-x-0 top-0 grid gap-3 pb-3"
              style={{
                transform: `translateY(${virtualRow.start}px)`,
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              }}
            >
              {row.map((entry) => (
                <WikiCard
                  key={entry.id}
                  entry={entry}
                  searchTerm={searchTerm}
                  favorited={favoriteIds.includes(entry.id)}
                  selectedForCompare={compareIds.includes(entry.id)}
                  compareDisabled={compareFull}
                  favoritePending={favoritePendingId === entry.id}
                  onOpen={onOpen}
                  onToggleFavorite={onToggleFavorite}
                  onToggleCompare={onToggleCompare}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
