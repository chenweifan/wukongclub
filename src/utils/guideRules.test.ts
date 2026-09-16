import { describe, expect, it } from 'vitest';

import type { GuideArticle, GuideDifficulty, GuideStep } from '@/data/contracts/guide';
import { GUIDE_KINDS } from '@/data/contracts/guide';
import { createGuideSeed } from '@/data/seeds/guide.seed';
import {
  applyGuideQuery,
  countGuidesByKind,
  countMaskedSteps,
  countStepsWithMinutes,
  difficultyRank,
  groupGuidesByKind,
  matchesGuideQuery,
  normalizeGuideSearch,
  peakSpoilerLevel,
  resolveGuideVisibility,
  resolveVisibleSteps,
  sortGuides,
  sumStepMinutes,
} from '@/utils/guideRules';
import type { SpoilerContext } from '@/utils/spoiler';

const NOW = new Date('2026-02-14T12:00:00.000Z');
const seed = createGuideSeed(NOW);

const HIDDEN: SpoilerContext = { spoilerVisible: false, revealedIds: [] };
const VISIBLE: SpoilerContext = { spoilerVisible: true, revealedIds: [] };

function requireGuide(id: string): GuideArticle {
  const guide = seed.find((item) => item.id === id);
  if (guide === undefined) {
    throw new Error(`测试前置数据缺失：${id}`);
  }
  return guide;
}

describe('applyGuideQuery（筛选与排序）', () => {
  it('无条件下返回全部条目', () => {
    expect(applyGuideQuery(seed, {})).toHaveLength(seed.length);
  });

  it('按分类筛选', () => {
    const bosses = applyGuideQuery(seed, { kind: 'boss' });

    expect(bosses.length).toBeGreaterThan(0);
    expect(bosses.every((guide) => guide.kind === 'boss')).toBe(true);
  });

  it('按难度与章节筛选，且可叠加', () => {
    const hard = applyGuideQuery(seed, { difficulty: 'hard' });
    expect(hard.every((guide) => guide.difficulty === 'hard')).toBe(true);

    const chapterOneHard = applyGuideQuery(seed, { chapter: 1, difficulty: 'hard' });
    expect(
      chapterOneHard.every((guide) => guide.chapter === 1 && guide.difficulty === 'hard'),
    ).toBe(true);
    expect(chapterOneHard.length).toBeLessThanOrEqual(hard.length);
  });

  it('搜索命中标题、摘要、作者、版本与标签', () => {
    expect(applyGuideQuery(seed, { search: '黑熊精' }).length).toBeGreaterThan(0);
    expect(applyGuideQuery(seed, { search: '本站编辑组' }).length).toBeGreaterThan(0);
    expect(applyGuideQuery(seed, { search: '演示版本' }).length).toBe(seed.length);
  });

  it('搜索也命中步骤标题（用户记得的是那一步）', () => {
    const target = requireGuide('guide-heixiongjing');
    const stepTitle = target.steps[0]?.title ?? '';
    expect(stepTitle.length).toBeGreaterThan(0);

    // 该步骤标题不该出现在攻略标题/摘要里，否则这条断言证明不了什么
    expect(target.title.includes(stepTitle)).toBe(false);

    const matched = applyGuideQuery(seed, { search: stepTitle });
    expect(matched.map((guide) => guide.id)).toContain(target.id);
  });

  it('大小写与前后空格不影响结果', () => {
    expect(normalizeGuideSearch('  Boss  ')).toBe('boss');
    expect(applyGuideQuery(seed, { search: '  BOSS  ' })).toEqual(
      applyGuideQuery(seed, { search: 'boss' }),
    );
  });

  it('无匹配返回空数组（边界）', () => {
    expect(applyGuideQuery(seed, { search: '不存在的关键词zzz' })).toEqual([]);
  });

  it('超长搜索词不抛错（边界）', () => {
    expect(applyGuideQuery(seed, { search: 'a'.repeat(5000) })).toEqual([]);
  });

  it('空数组输入返回空数组（边界）', () => {
    expect(applyGuideQuery([], {})).toEqual([]);
    expect(applyGuideQuery([], { kind: 'boss', search: '黑熊精' })).toEqual([]);
  });

  it('latest 按更新时间倒序', () => {
    const sorted = sortGuides(seed, 'latest');
    const times = sorted.map((guide) => guide.updatedAt);

    expect(times).toEqual([...times].sort((left, right) => right.localeCompare(left)));
  });

  it('popular 按浏览量倒序', () => {
    const sorted = sortGuides(seed, 'popular');
    const views = sorted.map((guide) => guide.views);

    expect(views).toEqual([...views].sort((left, right) => right - left));
  });

  it('difficulty 按 故事 < 普通 < 困难 < 挑战 排序', () => {
    const ranks = sortGuides(seed, 'difficulty').map((guide) => difficultyRank(guide.difficulty));

    expect(ranks).toEqual([...ranks].sort((left, right) => left - right));
  });

  it('未知难度排在最后而不是被当成 0（防御）', () => {
    // 契约里不该出现这个值，这里验证的是「脏数据不会静默排到最前」
    const unknownDifficulty = 'impossible' as GuideDifficulty;
    expect(difficultyRank(unknownDifficulty)).toBeGreaterThan(difficultyRank('challenge'));
  });

  it('不修改入参数组（纯函数）', () => {
    const before = seed.map((guide) => guide.id);
    sortGuides(seed, 'popular');
    applyGuideQuery(seed, { kind: 'build' });
    expect(seed.map((guide) => guide.id)).toEqual(before);
  });
});

describe('matchesGuideQuery / countGuidesByKind', () => {
  it('空搜索词匹配任何攻略', () => {
    expect(matchesGuideQuery(requireGuide('guide-heixiongjing'), '')).toBe(true);
  });

  it('分类统计覆盖全部三类，空数据时也不缺键', () => {
    const counts = countGuidesByKind(seed);

    for (const kind of GUIDE_KINDS) {
      expect(counts[kind]).toBeGreaterThan(0);
    }
    expect(Object.values(counts).reduce((total, value) => total + value, 0)).toBe(seed.length);

    expect(countGuidesByKind([])).toEqual({ boss: 0, build: 0, ending: 0 });
  });

  it('按分类分组：每篇只进一组，组内顺序保持', () => {
    const grouped = groupGuidesByKind(seed);

    expect(grouped.boss.length + grouped.build.length + grouped.ending.length).toBe(seed.length);
    expect(grouped.boss.map((guide) => guide.id)).toEqual(
      seed.filter((guide) => guide.kind === 'boss').map((guide) => guide.id),
    );
  });
});

describe('步骤统计', () => {
  it('耗时合计只累加标注过的步骤', () => {
    const guide = requireGuide('guide-heixiongjing');
    const expected = guide.steps.reduce((total, step) => total + (step.minutes ?? 0), 0);

    expect(sumStepMinutes(guide.steps)).toBe(expected);
    expect(countStepsWithMinutes(guide.steps)).toBe(
      guide.steps.filter((step) => step.minutes !== undefined).length,
    );
  });

  it('没有步骤或都没有耗时 → 0（边界，不是 NaN）', () => {
    expect(sumStepMinutes([])).toBe(0);
    expect(countStepsWithMinutes([])).toBe(0);
    expect(sumStepMinutes([{ id: 's1', title: '无耗时', detail: 'x', spoilerLevel: 0 }])).toBe(0);
  });

  it('极度耗时也不会溢出成 Infinity（边界）', () => {
    const steps: GuideStep[] = Array.from({ length: 50 }, (_value, index) => ({
      id: `s${index}`,
      title: `步骤 ${index}`,
      detail: 'x',
      minutes: Number.MAX_SAFE_INTEGER,
      spoilerLevel: 0,
    }));

    expect(Number.isFinite(sumStepMinutes(steps))).toBe(true);
  });
});

describe('步骤级剧透', () => {
  // 配装攻略整体 0 级，但最后一步提到后期珍玩的获取时机（1 级）
  const mixedGuide = requireGuide('guide-build-burst');

  it('全局剧透开关打开时全部可见', () => {
    const resolved = resolveVisibleSteps(mixedGuide.steps, VISIBLE);
    expect(resolved.every((entry) => entry.visibility === 'full')).toBe(true);
    expect(countMaskedSteps(mixedGuide.steps, VISIBLE)).toBe(0);
  });

  it('关闭时只遮含剧透的步骤（不是整篇挡掉）', () => {
    const masked = countMaskedSteps(mixedGuide.steps, HIDDEN);

    expect(masked).toBe(1);
    expect(masked).toBeLessThan(mixedGuide.steps.length);
  });

  it('单独揭开某一步只影响那一步', () => {
    const target = mixedGuide.steps.find((step) => step.spoilerLevel > 0);
    expect(target).toBeDefined();
    if (target === undefined) {
      return;
    }

    const before = countMaskedSteps(mixedGuide.steps, HIDDEN);
    const after = countMaskedSteps(mixedGuide.steps, {
      spoilerVisible: false,
      revealedIds: [target.id],
    });

    expect(after).toBe(before - 1);
  });

  it('无剧透步骤在任何上下文都可见（spoilerLevel 0 不受开关影响）', () => {
    const safeSteps = mixedGuide.steps.filter((step) => step.spoilerLevel === 0);

    expect(safeSteps.length).toBeGreaterThan(0);
    expect(countMaskedSteps(safeSteps, HIDDEN)).toBe(0);
  });

  it('同一条攻略里可以出现不同剧透级别（1 级与 2 级并存）', () => {
    const collect = requireGuide('guide-ending-collect');
    const levels = new Set(collect.steps.map((step) => step.spoilerLevel));

    expect(collect.spoilerLevel).toBe(1);
    expect(levels.has(2)).toBe(true);
    expect(levels.has(1)).toBe(true);
  });

  it('空步骤列表返回空数组（边界）', () => {
    expect(resolveVisibleSteps([], HIDDEN)).toEqual([]);
    expect(countMaskedSteps([], HIDDEN)).toBe(0);
  });
});

describe('攻略整体可见性 / 剧透峰值', () => {
  it('列表卡片用的是攻略自身级别', () => {
    const safe = seed.find((guide) => guide.spoilerLevel === 0);
    const risky = seed.find((guide) => guide.spoilerLevel > 0);

    expect(safe).toBeDefined();
    expect(risky).toBeDefined();
    if (safe === undefined || risky === undefined) {
      return;
    }

    expect(resolveGuideVisibility(safe, HIDDEN)).toBe('full');
    expect(resolveGuideVisibility(risky, HIDDEN)).toBe('masked');
    expect(resolveGuideVisibility(risky, VISIBLE)).toBe('full');
  });

  it('峰值取攻略与步骤中的最大值（步骤比标题更剧透时也能标出来）', () => {
    const guide: GuideArticle = {
      ...requireGuide('guide-heixiongjing'),
      spoilerLevel: 0,
      steps: [{ id: 's1', title: '结局', detail: 'x', spoilerLevel: 2 }],
    };

    expect(peakSpoilerLevel(guide)).toBe(2);
  });

  it('没有步骤时峰值就是攻略自身的级别（边界）', () => {
    const guide: GuideArticle = {
      ...requireGuide('guide-heixiongjing'),
      spoilerLevel: 1,
      steps: [],
    };
    expect(peakSpoilerLevel(guide)).toBe(1);
  });
});
