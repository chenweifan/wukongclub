import { describe, expect, it } from 'vitest';

import { SPOILER_LEVELS } from '@/data/contracts/common';
import { CHAPTERS } from '@/data/contracts/encyclopedia';
import { GUIDE_DIFFICULTIES, GUIDE_KINDS, GUIDE_TAGS } from '@/data/contracts/guide';
import { createWikiSeed } from '@/data/seeds/encyclopedia.seed';
import { GUIDE_SEED_COUNT, GUIDE_SEED_INPUTS, createGuideSeed } from '@/data/seeds/guide.seed';
import { sumStepMinutes, sortGuides } from '@/utils/guideRules';

/**
 * 攻略种子完整性。
 * 运行时最容易出问题的几处：标签/难度超出契约（筛选少结果）、步骤 id 重复
 * （React key 冲突 + 剧透「单独揭开」会一次揭开两步）、关联词条指向不存在的 id
 * （点了跳到空词条）、步骤耗时与总时长明显矛盾。
 */
describe('攻略种子', () => {
  const now = new Date('2026-02-14T12:00:00.000Z');
  const guides = createGuideSeed(now);

  it('数量与输入表一致，三类都够撑起筛选演示', () => {
    expect(guides).toHaveLength(GUIDE_SEED_COUNT);
    expect(guides.length).toBeGreaterThanOrEqual(12);
    expect(GUIDE_SEED_INPUTS).toHaveLength(GUIDE_SEED_COUNT);

    for (const kind of GUIDE_KINDS) {
      expect(guides.filter((guide) => guide.kind === kind).length).toBeGreaterThan(0);
    }
  });

  it('id 唯一', () => {
    const ids = guides.map((guide) => guide.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('分类、难度、标签、剧透级别都在契约范围内', () => {
    for (const guide of guides) {
      expect(GUIDE_KINDS).toContain(guide.kind);
      expect(GUIDE_DIFFICULTIES).toContain(guide.difficulty);
      expect(SPOILER_LEVELS).toContain(guide.spoilerLevel);
      expect(CHAPTERS).toContain(guide.chapter);
      expect(guide.tags.length).toBeGreaterThan(0);

      for (const tag of guide.tags) {
        expect(GUIDE_TAGS).toContain(tag);
      }
    }
  });

  it('标题与摘要不空，且标题有辨识度', () => {
    for (const guide of guides) {
      expect(guide.title.trim().length).toBeGreaterThan(4);
      expect(guide.summary.length).toBeGreaterThan(10);
      expect(guide.author.trim().length).toBeGreaterThan(0);
      expect(guide.version.trim().length).toBeGreaterThan(0);
    }
  });

  it('每篇都有步骤，步骤 id 全局唯一（剧透按 id 揭开，重名会一次揭开两步）', () => {
    const stepIds: string[] = [];

    for (const guide of guides) {
      expect(guide.steps.length).toBeGreaterThanOrEqual(3);

      for (const step of guide.steps) {
        expect(step.title.trim().length).toBeGreaterThan(0);
        expect(step.detail.length).toBeGreaterThan(10);
        expect(SPOILER_LEVELS).toContain(step.spoilerLevel);
        expect(step.minutes === undefined || step.minutes > 0).toBe(true);
        stepIds.push(step.id);
      }
    }

    expect(new Set(stepIds).size).toBe(stepIds.length);
  });

  it('关联词条都能在影神图里找到（否则点过去是空词条）', () => {
    const wikiIds = new Set(createWikiSeed().map((entry) => entry.id));

    for (const guide of guides) {
      expect(guide.relatedEntries.length).toBeGreaterThan(0);

      for (const entry of guide.relatedEntries) {
        expect(wikiIds.has(entry.id), `${guide.id} 关联了不存在的词条 ${entry.id}`).toBe(true);
        // 名字是播种时冗余进来的：不能退化成 id（退化了说明查表失败）
        expect(entry.name).not.toBe(entry.id);
      }
    }
  });

  it('存在「整体不剧透但个别步骤剧透」的攻略（步骤级遮罩的演示前提）', () => {
    const mixed = guides.filter(
      (guide) => guide.spoilerLevel === 0 && guide.steps.some((step) => step.spoilerLevel > 0),
    );

    expect(mixed.length).toBeGreaterThan(0);
  });

  it('封面是内联 SVG data URI（离线可用，不依赖外链图床）', () => {
    for (const guide of guides) {
      expect(guide.coverUrl.startsWith('data:image/svg+xml')).toBe(true);
    }
  });

  it('更新时间都在 now 之前，倒序排列稳定（同一天更新的两篇不会随机换位）', () => {
    const times = guides.map((guide) => guide.updatedAt);

    for (const time of times) {
      expect(new Date(time).getTime()).toBeLessThanOrEqual(now.getTime());
    }

    // 作者只按「几天前」标注，因此允许并列；但排序必须稳定可复现
    expect(sortGuides(guides, 'latest').map((guide) => guide.id)).toEqual(
      sortGuides(createGuideSeed(now), 'latest').map((guide) => guide.id),
    );
  });

  it('声明的总时长不小于步骤耗时之和（否则时长自相矛盾）', () => {
    for (const guide of guides) {
      expect(guide.durationMinutes, `${guide.id} 总时长小于步骤之和`).toBeGreaterThanOrEqual(
        sumStepMinutes(guide.steps),
      );
    }
  });

  it('浏览量、点赞数非负且浏览量大于点赞数（演示数据可信度）', () => {
    for (const guide of guides) {
      expect(guide.views).toBeGreaterThan(0);
      expect(guide.likes).toBeGreaterThanOrEqual(0);
      expect(guide.views).toBeGreaterThan(guide.likes);
    }
  });

  it('同一个 now 生成的结果稳定（幂等播种）', () => {
    expect(createGuideSeed(now).map((guide) => guide.updatedAt)).toEqual(
      guides.map((guide) => guide.updatedAt),
    );
  });
});
