import type { WikiEntry } from '@/data/contracts/encyclopedia';

/**
 * 影神图搜索与高亮的纯函数。
 *
 * 为什么不用第三方拼音库：技术栈清单里没有，而词条的拼音随数据一起入库更简单可靠
 * （见 contracts/encyclopedia.ts 的说明）。这里负责的是「怎么用拼音匹配与高亮」。
 */

export interface HighlightRange {
  start: number;
  end: number;
}

/** 全拼音节 → 首字母：'hei feng shan' → 'hfs'。 */
export function buildPinyinInitials(pinyin: string): string {
  return pinyin
    .split(/\s+/)
    .map((syllable) => syllable.trim().charAt(0))
    .join('')
    .toLowerCase();
}

/** 搜索词归一化：去空白、转小写、去连字符（用户常输入 'h-f-s' 或 '黑 风 山'）。 */
export function normalizeSearchTerm(term: string): string {
  return term
    .trim()
    .toLowerCase()
    .replace(/[\s\-_]+/g, '');
}

/**
 * 词条是否命中关键词。
 * 匹配面：名称 / 别名 / 描述 / 全拼 / 拼音首字母 / 章节名。
 * 之所以把全拼也纳入：'heifeng' 这种半截输入也该命中，而不是只认首字母。
 */
export function matchesEntry(entry: WikiEntry, normalizedTerm: string): boolean {
  if (normalizedTerm === '') {
    return true;
  }

  const haystacks = [
    entry.name,
    ...(entry.alias ?? []),
    entry.description,
    entry.pinyin,
    buildPinyinInitials(entry.pinyin),
    // 别名的全拼与首字母都要能搜到：只放首字母会让「shoushanheixiong」搜不出「守山黑熊」
    ...(entry.aliasPinyin ?? []).flatMap((pinyin) => [pinyin, buildPinyinInitials(pinyin)]),
  ];

  return haystacks.some((text) => normalizeSearchTerm(text).includes(normalizedTerm));
}

/**
 * 相关度打分。
 *
 * 权重按「用户意图强度」分档，且档位之间留足差距 ——
 * 精确命中名称（1000）必须永远压过「别名命中两次 + 描述命中」这类堆分，
 * 否则搜「黑风山」时黑风山本身排不到第一（这是实装后单测抓出来的问题）。
 */
export const SEARCH_SCORE = {
  nameExact: 1000,
  namePrefix: 300,
  nameIncludes: 150,
  aliasIncludes: 40,
  pinyinInitialsPrefix: 60,
  pinyinIncludes: 30,
  descriptionIncludes: 5,
} as const;

export function scoreEntry(entry: WikiEntry, normalizedTerm: string): number {
  if (normalizedTerm === '') {
    return 0;
  }

  const name = normalizeSearchTerm(entry.name);
  let score = 0;

  if (name === normalizedTerm) {
    score += SEARCH_SCORE.nameExact;
  } else if (name.startsWith(normalizedTerm)) {
    score += SEARCH_SCORE.namePrefix;
  } else if (name.includes(normalizedTerm)) {
    score += SEARCH_SCORE.nameIncludes;
  }

  for (const alias of entry.alias ?? []) {
    if (normalizeSearchTerm(alias).includes(normalizedTerm)) {
      score += SEARCH_SCORE.aliasIncludes;
    }
  }

  if (buildPinyinInitials(entry.pinyin).startsWith(normalizedTerm)) {
    score += SEARCH_SCORE.pinyinInitialsPrefix;
  } else if (normalizeSearchTerm(entry.pinyin).includes(normalizedTerm)) {
    score += SEARCH_SCORE.pinyinIncludes;
  }

  if (normalizeSearchTerm(entry.description).includes(normalizedTerm)) {
    score += SEARCH_SCORE.descriptionIncludes;
  }

  return score;
}

/**
 * 计算高亮区段（用于把命中片段包成 <mark>）。
 *
 * 两条匹配路径，与搜索规则保持一致：
 * 1. **拼音命中**（传入 pinyin 时优先）：把匹配到的音节映射回汉字下标 ——
 *    搜 'hfs' 时该高亮的是「黑风山」三个字，而不是拼音本身。
 *    这依赖「音节数 === 汉字数」，也正是种子测试守着的不变量。
 * 2. 文本命中：逐字符扫描、跳过空白与连字符。
 */
export function findHighlightRanges(
  text: string,
  normalizedTerm: string,
  pinyin?: string,
): HighlightRange[] {
  if (normalizedTerm === '' || text === '') {
    return [];
  }

  if (pinyin !== undefined) {
    const pinyinRange = findPinyinCharRange(text, pinyin, normalizedTerm);
    if (pinyinRange !== null) {
      return [pinyinRange];
    }
  }

  const comparable: number[] = [];
  const normalizedChars: string[] = [];

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index] ?? '';
    const normalized = normalizeSearchTerm(char);

    if (normalized === '') {
      continue;
    }

    comparable.push(index);
    normalizedChars.push(normalized);
  }

  const haystack = normalizedChars.join('');
  const ranges: HighlightRange[] = [];

  let cursor = 0;
  while (cursor <= haystack.length - normalizedTerm.length) {
    const found = haystack.indexOf(normalizedTerm, cursor);

    if (found === -1) {
      break;
    }

    const startIndex = comparable[found];
    const endIndex = comparable[found + normalizedTerm.length - 1];

    if (startIndex !== undefined && endIndex !== undefined) {
      ranges.push({ start: startIndex, end: endIndex + 1 });
    }

    cursor = found + normalizedTerm.length;
  }

  return ranges;
}

/** 拼音 → 汉字下标的映射；音节数与汉字数不一致时返回 null（宁可不高亮也不乱高亮）。 */
function findPinyinCharRange(
  text: string,
  pinyin: string,
  normalizedTerm: string,
): HighlightRange | null {
  const characters = [...text];
  const syllables = pinyin
    .trim()
    .split(/\s+/)
    .map((syllable) => syllable.toLowerCase());

  if (syllables.length !== characters.length || characters.length === 0) {
    return null;
  }

  // 先试首字母：'hfs' → 第 0–2 个字
  const initials = syllables.map((syllable) => syllable.charAt(0)).join('');
  const initialsIndex = initials.indexOf(normalizedTerm);

  if (initialsIndex !== -1) {
    return { start: initialsIndex, end: initialsIndex + normalizedTerm.length };
  }

  // 再试全拼：'heifeng' → 第 0–1 个字
  const joined = syllables.join('');
  const joinedIndex = joined.indexOf(normalizedTerm);

  if (joinedIndex === -1) {
    return null;
  }

  const target = joinedIndex + normalizedTerm.length;
  let cursor = 0;
  let startSyllable = 0;
  let endSyllable = syllables.length - 1;

  for (let index = 0; index < syllables.length; index += 1) {
    const syllable = syllables[index] ?? '';
    const next = cursor + syllable.length;

    if (cursor <= joinedIndex && joinedIndex < next) {
      startSyllable = index;
    }
    if (cursor < target && target <= next) {
      endSyllable = index;
      break;
    }

    cursor = next;
  }

  return { start: startSyllable, end: endSyllable + 1 };
}

/** 是否命中拼音（用于给搜索框加「拼音」提示）。 */
export function matchesPinyin(entry: WikiEntry, normalizedTerm: string): boolean {
  if (normalizedTerm === '') {
    return false;
  }

  return (
    normalizeSearchTerm(entry.pinyin).includes(normalizedTerm) ||
    buildPinyinInitials(entry.pinyin).startsWith(normalizedTerm)
  );
}

/* ── 卡片封面：内联 SVG 印章（不引入任何二进制素材） ─────────────── */

const CATEGORY_GLYPH: Record<WikiEntry['category'], string> = {
  yaoguai: '妖',
  npc: '人',
  boss: '王',
  location: '境',
};

/**
 * 生成印章式封面（data URI SVG）。
 * 用固定字符而不是外链图片：演示站离线可用、无版权素材风险，
 * 同时满足契约里的 imageUrl 字段。
 */
export function buildSealImageUrl(name: string, category: WikiEntry['category']): string {
  const glyph = [...name][0] ?? CATEGORY_GLYPH[category];
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">',
    '<rect width="96" height="96" rx="6" fill="#0b0b0d"/>',
    '<rect x="6" y="6" width="84" height="84" rx="4" fill="none" stroke="#c8a96a" stroke-width="2"/>',
    `<text x="48" y="64" font-size="46" text-anchor="middle" fill="#e8ce96" font-family="serif">${glyph}</text>`,
    '</svg>',
  ].join('');

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
