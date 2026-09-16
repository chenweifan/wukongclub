import { CHAPTER_NAMES } from '@/data/contracts/encyclopedia';
import type { WikiEntry } from '@/data/contracts/encyclopedia';
import { WikiHighlight } from '@/features/encyclopedia/components/WikiHighlight';
import { cn } from '@/utils/cn';
import { COPY } from '@/utils/copy';

export interface WikiCardProps {
  entry: WikiEntry;
  searchTerm: string;
  favorited: boolean;
  selectedForCompare: boolean;
  compareDisabled: boolean;
  favoritePending?: boolean;
  onOpen: (entryId: string) => void;
  onToggleFavorite: (entryId: string) => void;
  onToggleCompare: (entryId: string) => void;
}

/**
 * 影神图卡片（浮雕边框 + 印章封面 + 稀有度标记）。
 *
 * 无障碍取舍：卡片本身不是按钮（否则内部的收藏/对比按钮会形成嵌套按钮），
 * 而是「标题按钮负责打开详情 + 两个独立的功能按钮」。
 * 收藏与对比都用 aria-pressed 表达开关态，键盘与读屏都能识别。
 */
export function WikiCard({
  entry,
  searchTerm,
  favorited,
  selectedForCompare,
  compareDisabled,
  favoritePending = false,
  onOpen,
  onToggleFavorite,
  onToggleCompare,
}: WikiCardProps) {
  const alias = (entry.alias ?? []).join(' · ');

  return (
    <article
      className={cn(
        'panel-scroll flex h-full flex-col p-4 transition-colors duration-fast',
        selectedForCompare ? 'border-accent' : 'hover:border-line-strong',
      )}
    >
      <div className="flex items-start gap-3">
        <img
          src={entry.imageUrl}
          alt=""
          aria-hidden="true"
          width={48}
          height={48}
          loading="lazy"
          className="border-token border-line h-12 w-12 shrink-0 rounded-sm border"
        />

        <div className="min-w-0 flex-1">
          <h3 className="text-sm leading-snug">
            <button
              type="button"
              onClick={() => {
                onOpen(entry.id);
              }}
              className="hover:text-accent text-left transition-colors duration-fast"
            >
              <WikiHighlight text={entry.name} term={searchTerm} pinyin={entry.pinyin} />
            </button>
          </h3>

          {alias === '' ? null : (
            <p className="mt-1 truncate text-[11px] text-content-muted">
              <WikiHighlight text={alias} term={searchTerm} />
            </p>
          )}

          <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-content-muted">
            <span className="stamp">{COPY.wiki.category[entry.category]}</span>
            <span className="stamp">
              {COPY.wiki.chapterLabel(entry.chapter, CHAPTER_NAMES[entry.chapter])}
            </span>
            <span className="text-accent" title={COPY.wiki.filterRarity}>
              {'★'.repeat(entry.rarity)}
            </span>
          </p>
        </div>
      </div>

      <p className="mt-3 line-clamp-3 flex-1 text-xs leading-relaxed text-content-muted">
        <WikiHighlight text={entry.description} term={searchTerm} />
      </p>

      <div className="border-token border-line mt-3 flex items-center gap-2 border-t pt-3">
        <button
          type="button"
          aria-pressed={favorited}
          disabled={favoritePending}
          aria-label={`${favorited ? COPY.wiki.favorite.remove : COPY.wiki.favorite.add}：${entry.name}`}
          onClick={() => {
            onToggleFavorite(entry.id);
          }}
          className={cn(
            'rounded-scroll border-token border px-2 py-1 text-xs transition-colors duration-fast disabled:opacity-60',
            favorited
              ? 'border-accent text-accent'
              : 'border-line text-content-muted hover:text-content',
          )}
        >
          <span aria-hidden="true">{favorited ? '◆' : '◇'}</span>{' '}
          {favorited ? COPY.wiki.favorite.remove : COPY.wiki.favorite.add}
        </button>

        <button
          type="button"
          aria-pressed={selectedForCompare}
          disabled={compareDisabled && !selectedForCompare}
          onClick={() => {
            onToggleCompare(entry.id);
          }}
          className={cn(
            'rounded-scroll border-token border px-2 py-1 text-xs transition-colors duration-fast disabled:opacity-50',
            selectedForCompare
              ? 'border-accent text-accent'
              : 'border-line text-content-muted hover:text-content',
          )}
        >
          {selectedForCompare ? COPY.wiki.compare.remove : COPY.wiki.compare.add}
        </button>

        <button
          type="button"
          onClick={() => {
            onOpen(entry.id);
          }}
          className="border-token border-line hover:text-accent ml-auto rounded-scroll border px-2 py-1 text-xs"
        >
          {COPY.wiki.detail.open}
        </button>
      </div>
    </article>
  );
}
