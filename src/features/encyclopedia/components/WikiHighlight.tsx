import { findHighlightRanges, normalizeSearchTerm } from '@/utils/wikiSearch';

export interface WikiHighlightProps {
  /** 原始搜索词（内部会归一化）。 */
  term: string;
  text: string;
  /**
   * 可选：该文本对应的拼音（名称才有）。
   * 传入后，拼音/首字母命中会高亮到**汉字**上 ——
   * 搜 'hfs' 时用户看到的是「黑风山」被标出来，而不是拼音。
   */
  pinyin?: string;
  className?: string;
}

/**
 * 命中片段高亮。
 *
 * 高亮规则与搜索规则共用 utils/wikiSearch 的同一套归一化，
 * 因此「按 hfs 搜到了黑风山」时，卡片上真的能把那三个字标出来 ——
 * 而不是搜到了却看不出为什么命中。
 */
export function WikiHighlight({ text, term, pinyin, className }: WikiHighlightProps) {
  const normalized = normalizeSearchTerm(term);
  const ranges = findHighlightRanges(text, normalized, pinyin);

  if (ranges.length === 0) {
    return <span className={className}>{text}</span>;
  }

  const parts: { text: string; highlighted: boolean }[] = [];
  let cursor = 0;

  for (const range of ranges) {
    if (range.start > cursor) {
      parts.push({ text: text.slice(cursor, range.start), highlighted: false });
    }
    parts.push({ text: text.slice(range.start, range.end), highlighted: true });
    cursor = range.end;
  }

  if (cursor < text.length) {
    parts.push({ text: text.slice(cursor), highlighted: false });
  }

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.highlighted ? (
          <mark
            key={`${part.text}-${index}`}
            className="bg-accent text-accent-ink rounded-sm px-0.5"
          >
            {part.text}
          </mark>
        ) : (
          <span key={`${part.text}-${index}`}>{part.text}</span>
        ),
      )}
    </span>
  );
}
