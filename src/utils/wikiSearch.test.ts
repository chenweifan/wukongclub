import { describe, expect, it } from 'vitest';

import { createWikiSeed } from '@/data/seeds/encyclopedia.seed';
import type { WikiEntry } from '@/data/contracts/encyclopedia';
import {
  buildPinyinInitials,
  buildSealImageUrl,
  findHighlightRanges,
  matchesEntry,
  matchesPinyin,
  normalizeSearchTerm,
  scoreEntry,
} from '@/utils/wikiSearch';

const seed = createWikiSeed();
const heifengshan = seed.find((entry) => entry.id === 'wiki-heifengshan');
const heixiongjing = seed.find((entry) => entry.id === 'wiki-heixiongjing');

function requireEntry(entry: WikiEntry | undefined): WikiEntry {
  if (entry === undefined) {
    throw new Error('测试前置数据缺失：种子中没有该词条');
  }
  return entry;
}

describe('拼音与归一化', () => {
  it('buildPinyinInitials 取每个音节首字母', () => {
    expect(buildPinyinInitials('hei feng shan')).toBe('hfs');
    expect(buildPinyinInitials('zhi zhu jing si mei')).toBe('zzjsm');
    expect(buildPinyinInitials('')).toBe('');
    expect(buildPinyinInitials('  duo   mu  ')).toBe('dm');
  });

  it('normalizeSearchTerm 去空白、连字符并转小写', () => {
    expect(normalizeSearchTerm('  Hei Feng  ')).toBe('heifeng');
    expect(normalizeSearchTerm('h-f-s')).toBe('hfs');
    expect(normalizeSearchTerm('黑 风 山')).toBe('黑风山');
    expect(normalizeSearchTerm('   ')).toBe('');
  });
});

describe('matchesEntry', () => {
  const entry = requireEntry(heifengshan);

  it('空关键词视为命中（列表默认展示全部）', () => {
    expect(matchesEntry(entry, '')).toBe(true);
  });

  it('按名称、拼音、首字母、描述命中', () => {
    expect(matchesEntry(entry, '黑风')).toBe(true);
    expect(matchesEntry(entry, 'heifeng')).toBe(true);
    expect(matchesEntry(entry, 'hfs')).toBe(true);
    expect(matchesEntry(entry, '林深雾重')).toBe(true);
  });

  it('按别名与其拼音首字母命中（黑熊精的别名「守山黑熊」）', () => {
    const boss = requireEntry(heixiongjing);

    expect(matchesEntry(boss, '守山黑熊')).toBe(true);
    expect(matchesEntry(boss, 'sshx')).toBe(true);
    expect(matchesEntry(boss, 'shoushanheixiong')).toBe(true);
    expect(matchesEntry(boss, '火焰山')).toBe(false);
  });

  it('不相关关键词不命中', () => {
    expect(matchesEntry(entry, '火焰山')).toBe(false);
    expect(matchesEntry(entry, 'zzz')).toBe(false);
  });

  it('超长关键词不抛错（边界）', () => {
    expect(matchesEntry(entry, 'a'.repeat(5000))).toBe(false);
  });
});

describe('scoreEntry（相关度排序）', () => {
  it('名称完全匹配得分最高，其次是前缀、包含、描述', () => {
    const exact = scoreEntry(requireEntry(heifengshan), normalizeSearchTerm('黑风山'));
    const prefix = scoreEntry(requireEntry(heixiongjing), normalizeSearchTerm('黑'));
    const descriptionOnly = scoreEntry(requireEntry(heifengshan), normalizeSearchTerm('林深'));

    expect(exact).toBeGreaterThan(prefix);
    expect(prefix).toBeGreaterThan(descriptionOnly);
  });

  it('拼音首字母命中排在纯描述命中之前', () => {
    const byInitials = scoreEntry(requireEntry(heifengshan), normalizeSearchTerm('hfs'));
    const byDescription = scoreEntry(requireEntry(heifengshan), normalizeSearchTerm('岔路'));

    expect(byInitials).toBeGreaterThan(byDescription);
  });

  it('空关键词得 0 分', () => {
    expect(scoreEntry(requireEntry(heifengshan), '')).toBe(0);
  });
});

describe('findHighlightRanges（高亮区间）', () => {
  it('中文子串按原文本下标返回', () => {
    expect(findHighlightRanges('黑风山', '黑风')).toEqual([{ start: 0, end: 2 }]);
    expect(findHighlightRanges('小西天极乐谷', '极乐')).toEqual([{ start: 3, end: 5 }]);
  });

  it('拼音首字母与全拼命中会映射回汉字（而不是高亮拼音）', () => {
    expect(findHighlightRanges('黑风山', 'hfs', 'hei feng shan')).toEqual([{ start: 0, end: 3 }]);
    expect(findHighlightRanges('黑风山', 'heifeng', 'hei feng shan')).toEqual([
      { start: 0, end: 2 },
    ]);
    // 音节数与汉字数不一致时放弃拼音映射，退回文本匹配
    expect(findHighlightRanges('蜘蛛精·四妹', 'zzjsm', 'zhi zhu jing si mei')).toEqual([]);
  });

  it('多次出现全部标出', () => {
    const ranges = findHighlightRanges('山外有山', '山');
    expect(ranges).toEqual([
      { start: 0, end: 1 },
      { start: 3, end: 4 },
    ]);
  });

  it('边界：空关键词、空文本、无命中都返回空数组', () => {
    expect(findHighlightRanges('黑风山', '')).toEqual([]);
    expect(findHighlightRanges('', '黑')).toEqual([]);
    expect(findHighlightRanges('黑风山', '火焰')).toEqual([]);
  });

  it('命中片段不会越界（末尾整段命中）', () => {
    const ranges = findHighlightRanges('黑风山', '风山');
    expect(ranges).toEqual([{ start: 1, end: 3 }]);
  });
});

describe('matchesPinyin', () => {
  it('全拼与首字母都算拼音命中', () => {
    const entry = requireEntry(heifengshan);
    expect(matchesPinyin(entry, 'heifeng')).toBe(true);
    expect(matchesPinyin(entry, 'hfs')).toBe(true);
    expect(matchesPinyin(entry, '黑风')).toBe(false);
    expect(matchesPinyin(entry, '')).toBe(false);
  });
});

describe('buildSealImageUrl', () => {
  it('生成内联 SVG 数据 URI，取名称首字', () => {
    const url = buildSealImageUrl('黑熊精', 'boss');

    expect(url.startsWith('data:image/svg+xml,')).toBe(true);
    expect(decodeURIComponent(url)).toContain('黑');
    expect(decodeURIComponent(url)).toContain('#c8a96a');
  });

  it('空名称时退回分类字（边界）', () => {
    const url = decodeURIComponent(buildSealImageUrl('', 'location'));
    expect(url).toContain('境');
  });
});
