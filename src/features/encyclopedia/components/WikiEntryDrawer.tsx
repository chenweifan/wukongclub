import { lazy, Suspense } from 'react';

import * as Dialog from '@radix-ui/react-dialog';

import { StateBoundary } from '@/components/ui/StateBoundary';
import { CHAPTER_NAMES } from '@/data/contracts/encyclopedia';
import type { WikiEntry } from '@/data/contracts/encyclopedia';
import { useWikiDetailQuery, useWikiGraphQuery } from '@/entities/encyclopedia/queries';
import { cn } from '@/utils/cn';
import { COPY } from '@/utils/copy';

/**
 * 图谱按需加载：ECharts 是本项目最重的依赖之一，
 * 而它只在「打开词条详情」时才有用，没有理由让它进入百科页的首屏包。
 */
const WikiRelatedGraph = lazy(async () => {
  const module = await import('@/features/encyclopedia/components/WikiRelatedGraph');
  return { default: module.WikiRelatedGraph };
});

export interface WikiEntryDrawerProps {
  entryId: string | null;
  favoriteIds: readonly string[];
  compareIds: readonly string[];
  compareFull: boolean;
  onClose: () => void;
  /** 点击关联词条 / 图谱节点时切换到该词条（不跳页）。 */
  onSelect: (entryId: string) => void;
  onToggleFavorite: (entryId: string) => void;
  /**
   * entry 可选：抽屉里点「加入对比」时把已加载的词条一并带过去，
   * 因为该词条可能不在当前筛选后的列表里（例如从图谱节点跳进来）。
   */
  onToggleCompare: (entryId: string, entry?: WikiEntry) => void;
}

/**
 * 词条详情抽屉（协议要求「不跳页」）。
 * 用 Radix Dialog 承载：焦点陷阱、Esc 关闭、aria 关联都由原语保证，
 * 视觉上是右侧滑出的抽屉而不是居中弹窗。
 */
export function WikiEntryDrawer({
  entryId,
  favoriteIds,
  compareIds,
  compareFull,
  onClose,
  onSelect,
  onToggleFavorite,
  onToggleCompare,
}: WikiEntryDrawerProps) {
  const detailQuery = useWikiDetailQuery(entryId);
  const graphQuery = useWikiGraphQuery(entryId);
  const open = entryId !== null;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="bg-overlay fixed inset-0 z-[var(--hmw-z-modal)]" />
        <Dialog.Content
          className={cn(
            'border-token border-line bg-surface fixed right-0 top-0 z-[var(--hmw-z-modal)]',
            'h-full w-[min(32rem,100vw)] overflow-y-auto border-l p-6',
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <Dialog.Title className="font-display text-xl text-content">
              {detailQuery.data?.name ?? COPY.wiki.title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label={COPY.wiki.detail.close}
                className="border-token border-line text-content-muted hover:text-content shrink-0 rounded-scroll border px-2 py-1 text-xs"
              >
                ✕
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Description className="sr-only">{COPY.wiki.detail.graphHint}</Dialog.Description>

          <div className="mt-4">
            <StateBoundary query={detailQuery} label={COPY.wiki.detail.open}>
              {(entry) => {
                const favorited = favoriteIds.includes(entry.id);
                const inCompare = compareIds.includes(entry.id);
                const alias = (entry.alias ?? []).join(' · ');

                return (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={entry.imageUrl}
                        alt=""
                        aria-hidden="true"
                        width={64}
                        height={64}
                        className="border-token border-line h-16 w-16 shrink-0 rounded-sm border"
                      />
                      <dl className="min-w-0 flex-1 space-y-1 text-xs text-content-muted">
                        <div className="flex gap-2">
                          <dt>{COPY.wiki.compare.field.category}</dt>
                          <dd className="text-content">{COPY.wiki.category[entry.category]}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt>{COPY.wiki.compare.field.chapter}</dt>
                          <dd className="text-content">
                            {COPY.wiki.chapterLabel(entry.chapter, CHAPTER_NAMES[entry.chapter])}
                          </dd>
                        </div>
                        <div className="flex gap-2">
                          <dt>{COPY.wiki.compare.field.rarity}</dt>
                          <dd className="text-accent">{'★'.repeat(entry.rarity)}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt>{COPY.wiki.compare.field.spoiler}</dt>
                          <dd className="text-content">
                            {COPY.wiki.detail.spoilerLevel[entry.spoilerLevel]}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    {alias === '' ? null : (
                      <p className="text-xs text-content-muted">
                        {COPY.wiki.detail.alias}：<span className="text-content">{alias}</span>
                      </p>
                    )}

                    <p className="text-sm leading-relaxed text-content">{entry.description}</p>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        aria-pressed={favorited}
                        onClick={() => {
                          onToggleFavorite(entry.id);
                        }}
                        className={cn(
                          'border-token rounded-scroll border px-3 py-1.5 text-xs',
                          favorited
                            ? 'border-accent text-accent'
                            : 'border-line text-content-muted hover:text-content',
                        )}
                      >
                        {favorited ? COPY.wiki.favorite.remove : COPY.wiki.favorite.add}
                      </button>

                      <button
                        type="button"
                        aria-pressed={inCompare}
                        disabled={compareFull && !inCompare}
                        onClick={() => {
                          onToggleCompare(entry.id, entry);
                        }}
                        className={cn(
                          'border-token rounded-scroll border px-3 py-1.5 text-xs disabled:opacity-50',
                          inCompare
                            ? 'border-accent text-accent'
                            : 'border-line text-content-muted hover:text-content',
                        )}
                      >
                        {inCompare ? COPY.wiki.compare.remove : COPY.wiki.compare.add}
                      </button>
                    </div>

                    <section aria-label={COPY.wiki.detail.drops}>
                      <h3 className="text-xs text-content-muted">{COPY.wiki.detail.drops}</h3>
                      {entry.drops.length === 0 ? (
                        <p className="mt-1 text-xs text-content-muted">{COPY.wiki.compare.none}</p>
                      ) : (
                        <ul className="mt-1 flex flex-wrap gap-1.5">
                          {entry.drops.map((drop) => (
                            <li key={drop} className="stamp">
                              {drop}
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>

                    <section aria-label={COPY.wiki.detail.related}>
                      <h3 className="text-xs text-content-muted">{COPY.wiki.detail.related}</h3>
                      {/*
                        关联词条直接用图谱数据渲染：它已经是「中心词条 + 一跳邻居 + 名字」，
                        再为几个 chip 单独发一次请求没有意义。
                      */}
                      {graphQuery.data === undefined ? (
                        <p className="mt-1 text-xs text-content-muted">
                          {COPY.wiki.detail.graphLoading}
                        </p>
                      ) : (
                        <ul className="mt-1 flex flex-wrap gap-1.5">
                          {graphQuery.data.nodes
                            .filter((node) => !node.isRoot)
                            .map((node) => (
                              <li key={node.id}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onSelect(node.id);
                                  }}
                                  className="border-token border-line hover:border-accent hover:text-accent rounded-scroll border px-2 py-0.5 text-xs text-content-muted"
                                >
                                  {node.name}
                                </button>
                              </li>
                            ))}
                        </ul>
                      )}
                    </section>

                    <section aria-label={COPY.wiki.detail.graphTitle}>
                      <h3 className="text-xs text-content-muted">{COPY.wiki.detail.graphTitle}</h3>
                      <p className="mt-1 text-[11px] text-content-muted">
                        {COPY.wiki.detail.graphHint}
                      </p>
                      <div className="mt-2">
                        <StateBoundary
                          query={graphQuery}
                          label={COPY.wiki.detail.graphTitle}
                          loading={
                            <p className="text-content-muted text-xs">
                              {COPY.wiki.detail.graphLoading}
                            </p>
                          }
                        >
                          {(graph) => (
                            <Suspense
                              fallback={
                                <p className="text-content-muted text-xs">
                                  {COPY.wiki.detail.graphLoading}
                                </p>
                              }
                            >
                              <WikiRelatedGraph graph={graph} onSelect={onSelect} />
                            </Suspense>
                          )}
                        </StateBoundary>
                      </div>
                    </section>
                  </div>
                );
              }}
            </StateBoundary>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
