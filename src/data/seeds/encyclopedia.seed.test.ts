import { describe, expect, it } from 'vitest';

import { WIKI_SEED_COUNT, WIKI_SEED_INPUTS, createWikiSeed } from '@/data/seeds/encyclopedia.seed';
import { CHAPTERS, RARITY_LEVELS, WIKI_CATEGORIES } from '@/data/contracts/encyclopedia';
import { buildPinyinInitials, normalizeSearchTerm } from '@/utils/wikiSearch';

/**
 * 种子数据完整性。
 * 这批数据是「手写的内容」，最容易出的不是逻辑错而是**引用错**（relatedIds 指向不存在的 id）
 * 与**格式错**（拼音写空、稀有度越界）。这些在运行时只会表现为「图谱少一条线」，
 * 很难发现，因此用测试兜住。
 */
describe('影神图种子', () => {
  const entries = createWikiSeed();

  it('数量达到卡片墙与性能验证所需规模', () => {
    expect(entries).toHaveLength(WIKI_SEED_COUNT);
    expect(entries.length).toBeGreaterThanOrEqual(40);
    expect(WIKI_SEED_INPUTS).toHaveLength(WIKI_SEED_COUNT);
  });

  it('id 唯一', () => {
    const ids = entries.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('分类 / 章节 / 稀有度 / 剧透级别都在契约允许的范围内', () => {
    for (const entry of entries) {
      expect(WIKI_CATEGORIES).toContain(entry.category);
      expect(CHAPTERS).toContain(entry.chapter);
      expect(RARITY_LEVELS).toContain(entry.rarity);
      expect([0, 1, 2]).toContain(entry.spoilerLevel);
    }
  });

  it('relatedIds 全部指向存在的词条（拼错 id 会让图谱静默缺线）', () => {
    const ids = new Set(entries.map((entry) => entry.id));

    for (const entry of entries) {
      for (const relatedId of entry.relatedIds) {
        expect(ids.has(relatedId), `${entry.id} 关联了不存在的 ${relatedId}`).toBe(true);
      }
    }
  });

  /**
   * 关联是**有向**的（A 提及 B，B 不一定提及 A），这正是维基类数据的常态；
   * 图谱在后端会把反向邻居也连上（见 getWikiGraph），所以不需要强制对称。
   * 这里只守住两条真正影响可用性的性质：没有悬空引用、没有孤立节点。
   */
  it('没有孤立词条（每条都至少有一个关联，图谱才有意义）', () => {
    const isolated = entries.filter((entry) => entry.relatedIds.length === 0);

    expect(isolated.map((entry) => entry.id)).toEqual([]);
  });

  it('每章都有词条，且都有地点（章节导航不会出现空章）', () => {
    for (const chapter of CHAPTERS) {
      const inChapter = entries.filter((entry) => entry.chapter === chapter);
      expect(inChapter.length).toBeGreaterThan(0);
      expect(inChapter.some((entry) => entry.category === 'location')).toBe(true);
    }
  });

  it('名称、简介、拼音都不为空；拼音可推出首字母', () => {
    for (const entry of entries) {
      expect(entry.name.trim().length).toBeGreaterThan(0);
      expect(entry.description.length).toBeGreaterThan(10);
      expect(entry.pinyin.trim().length).toBeGreaterThan(0);
      expect(buildPinyinInitials(entry.pinyin).length).toBeGreaterThan(0);
    }
  });

  it('拼音与名称音节数一致（写错拼音会让搜索失效）', () => {
    for (const entry of entries) {
      // 只数汉字：像「蜘蛛精·四妹」里的间隔号不算音节
      const hanCount = [...entry.name].filter((char) => /\p{Script=Han}/u.test(char)).length;
      expect(entry.pinyin.split(/\s+/), `${entry.id} 的拼音音节数不匹配`).toHaveLength(hanCount);
    }
  });

  it('别名与别名的拼音按索引对齐', () => {
    for (const entry of entries) {
      const alias = entry.alias ?? [];
      const aliasPinyin = entry.aliasPinyin ?? [];
      expect(aliasPinyin).toHaveLength(alias.length);
    }
  });

  it('封面是内联 SVG（不引入二进制素材）', () => {
    for (const entry of entries) {
      expect(entry.imageUrl.startsWith('data:image/svg+xml,')).toBe(true);
    }
  });

  it('关键词「hfs」能命中黑风山（拼音搜索的冒烟验证）', () => {
    const term = normalizeSearchTerm('hfs');
    const matched = entries.filter(
      (entry) =>
        buildPinyinInitials(entry.pinyin).startsWith(term) ||
        normalizeSearchTerm(entry.pinyin).includes(term),
    );

    expect(matched.map((entry) => entry.id)).toContain('wiki-heifengshan');
  });
});
