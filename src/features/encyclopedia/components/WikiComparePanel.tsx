import { CHAPTER_NAMES, WIKI_COMPARE_LIMIT } from '@/data/contracts/encyclopedia';
import type { WikiEntry } from '@/data/contracts/encyclopedia';
import { COPY } from '@/utils/copy';

export interface WikiComparePanelProps {
  entries: readonly WikiEntry[];
  onRemove: (entryId: string) => void;
  onClear: () => void;
  onOpen: (entryId: string) => void;
}

/**
 * 词条对比（协议：最多 3 条）。
 *
 * 渲染成表格而不是三张卡片：对比的本质是「同一维度横向看」，
 * 表格语义（th scope=row）也让读屏用户能按行听完一条属性。
 * 少于 2 条时不显示对比表，只留提示 —— 一条词条没什么可对比的。
 */
export function WikiComparePanel({ entries, onRemove, onClear, onOpen }: WikiComparePanelProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <section aria-label={COPY.wiki.compare.title} className="panel-scroll p-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-sm text-content">{COPY.wiki.compare.title}</h2>
        <span className="text-[11px] text-content-muted">
          {COPY.wiki.compare.limitHint(WIKI_COMPARE_LIMIT)}
        </span>
        <button
          type="button"
          onClick={onClear}
          className="border-token border-line text-content-muted hover:text-content ml-auto rounded-scroll border px-2 py-1 text-xs"
        >
          {COPY.wiki.compare.clear}
        </button>
      </div>

      {entries.length < 2 ? (
        <p className="mt-3 text-xs text-content-muted">{COPY.wiki.compare.empty}</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <caption className="sr-only">{COPY.wiki.compare.title}</caption>
            <thead>
              <tr>
                <th scope="col" className="border-token border-line border-b p-2 text-left" />
                {entries.map((entry) => (
                  <th
                    key={entry.id}
                    scope="col"
                    className="border-token border-line border-b p-2 text-left align-top"
                  >
                    <span className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onOpen(entry.id);
                        }}
                        className="hover:text-accent text-content"
                      >
                        {entry.name}
                      </button>
                      <button
                        type="button"
                        aria-label={`${COPY.wiki.compare.remove}：${entry.name}`}
                        onClick={() => {
                          onRemove(entry.id);
                        }}
                        className="text-content-muted hover:text-content"
                      >
                        ✕
                      </button>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <CompareRow
                label={COPY.wiki.compare.field.category}
                entries={entries}
                render={(entry) => COPY.wiki.category[entry.category]}
              />
              <CompareRow
                label={COPY.wiki.compare.field.chapter}
                entries={entries}
                render={(entry) =>
                  COPY.wiki.chapterLabel(entry.chapter, CHAPTER_NAMES[entry.chapter])
                }
              />
              <CompareRow
                label={COPY.wiki.compare.field.rarity}
                entries={entries}
                render={(entry) => '★'.repeat(entry.rarity)}
              />
              <CompareRow
                label={COPY.wiki.compare.field.spoiler}
                entries={entries}
                render={(entry) => COPY.wiki.detail.spoilerLevel[entry.spoilerLevel]}
              />
              <CompareRow
                label={COPY.wiki.compare.field.alias}
                entries={entries}
                render={(entry) => (entry.alias ?? []).join(' · ')}
              />
              <CompareRow
                label={COPY.wiki.compare.field.drops}
                entries={entries}
                render={(entry) => entry.drops.join(' · ')}
              />
              <CompareRow
                label={COPY.wiki.compare.field.related}
                entries={entries}
                render={(entry) => COPY.wiki.detail.relatedCount(entry.relatedIds.length)}
              />
              <CompareRow
                label={COPY.wiki.compare.field.description}
                entries={entries}
                render={(entry) => entry.description}
              />
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

interface CompareRowProps {
  label: string;
  entries: readonly WikiEntry[];
  render: (entry: WikiEntry) => string;
}

function CompareRow({ label, entries, render }: CompareRowProps) {
  return (
    <tr>
      <th
        scope="row"
        className="border-token border-line text-content-muted border-b p-2 text-left align-top font-normal"
      >
        {label}
      </th>
      {entries.map((entry) => {
        const value = render(entry);

        return (
          <td
            key={entry.id}
            className="border-token border-line border-b p-2 align-top text-content"
          >
            {value === '' ? COPY.wiki.compare.none : value}
          </td>
        );
      })}
    </tr>
  );
}
