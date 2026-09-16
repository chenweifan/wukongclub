import type {
  GuideArticle,
  GuideDifficulty,
  GuideKind,
  GuideKindCounts,
  GuideQuery,
  GuideStep,
} from '@/data/contracts/guide';
import { GUIDE_DIFFICULTIES, GUIDE_KINDS } from '@/data/contracts/guide';
import { resolveSpoilerVisibility } from '@/utils/spoiler';
import type { SpoilerContext, SpoilerVisibility } from '@/utils/spoiler';

/**
 * 攻略库的纯逻辑：检索、筛选、排序、步骤统计、步骤级剧透。
 * 与资讯/百科同一套做法：mock 后端与前端组件共用，避免两边规则漂移。
 */

export function normalizeGuideSearch(term: string): string {
  return term.trim().toLowerCase();
}

/**
 * 检索面包含**步骤标题**：找「怎么定风」的人未必记得攻略标题，
 * 但他一定记得那一步叫什么。
 */
export function matchesGuideQuery(guide: GuideArticle, normalizedTerm: string): boolean {
  if (normalizedTerm === '') {
    return true;
  }

  const haystacks = [
    guide.title,
    guide.summary,
    guide.author,
    guide.version,
    ...guide.tags,
    ...guide.steps.map((step) => step.title),
  ];

  return haystacks.some((text) => text.toLowerCase().includes(normalizedTerm));
}

/** 难度排序用：故事 < 普通 < 困难 < 挑战。 */
export function difficultyRank(difficulty: GuideDifficulty): number {
  const index = GUIDE_DIFFICULTIES.indexOf(difficulty);
  return index === -1 ? GUIDE_DIFFICULTIES.length : index;
}

export function sortGuides(
  guides: readonly GuideArticle[],
  sort: NonNullable<GuideQuery['sort']>,
): GuideArticle[] {
  const copy = [...guides];

  switch (sort) {
    case 'popular':
      copy.sort((left, right) => right.views - left.views || right.likes - left.likes);
      break;
    case 'difficulty':
      copy.sort(
        (left, right) =>
          difficultyRank(left.difficulty) - difficultyRank(right.difficulty) ||
          right.updatedAt.localeCompare(left.updatedAt),
      );
      break;
    case 'latest':
    default:
      copy.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
      break;
  }

  return copy;
}

export function applyGuideQuery(
  guides: readonly GuideArticle[],
  query: GuideQuery,
): GuideArticle[] {
  const term = normalizeGuideSearch(query.search ?? '');

  const filtered = guides.filter((guide) => {
    if (query.kind !== undefined && guide.kind !== query.kind) {
      return false;
    }
    if (query.difficulty !== undefined && guide.difficulty !== query.difficulty) {
      return false;
    }
    if (query.chapter !== undefined && guide.chapter !== query.chapter) {
      return false;
    }
    return matchesGuideQuery(guide, term);
  });

  return sortGuides(filtered, query.sort ?? 'latest');
}

/** 三类攻略的条数（筛选条角标；空数据时三类都是 0，而不是缺键）。 */
export function countGuidesByKind(guides: readonly GuideArticle[]): GuideKindCounts {
  const counts = Object.fromEntries(GUIDE_KINDS.map((kind) => [kind, 0])) as GuideKindCounts;

  for (const guide of guides) {
    counts[guide.kind] += 1;
  }

  return counts;
}

/** 步骤耗时合计；未标注耗时的步骤不计入，而不是按 0 分钟糊过去。 */
export function sumStepMinutes(steps: readonly GuideStep[]): number {
  return steps.reduce((total, step) => total + (step.minutes ?? 0), 0);
}

export function countStepsWithMinutes(steps: readonly GuideStep[]): number {
  return steps.filter((step) => step.minutes !== undefined).length;
}

/* ── 步骤级剧透 ───────────────────────────────────────────────────── */

export interface VisibleStep {
  step: GuideStep;
  visibility: SpoilerVisibility;
}

/**
 * 逐步骤判定可见性。
 * 一条攻略可以整体安全，但其中某一步含结局信息 —— 那就只遮那一步，
 * 而不是把整篇攻略挡住（否则用户会以为这篇写得不全）。
 */
export function resolveVisibleSteps(
  steps: readonly GuideStep[],
  context: SpoilerContext,
): VisibleStep[] {
  return steps.map((step) => ({
    step,
    visibility: resolveSpoilerVisibility(step, context),
  }));
}

export function countMaskedSteps(steps: readonly GuideStep[], context: SpoilerContext): number {
  return resolveVisibleSteps(steps, context).filter((entry) => entry.visibility === 'masked')
    .length;
}

/** 攻略整体可见性（用于列表卡片）。 */
export function resolveGuideVisibility(
  guide: GuideArticle,
  context: SpoilerContext,
): SpoilerVisibility {
  return resolveSpoilerVisibility(guide, context);
}

/** 攻略+步骤里最高的剧透级别：列表上用它做标记，避免用户点进去才被剧透。 */
export function peakSpoilerLevel(guide: GuideArticle): number {
  return guide.steps.reduce(
    (peak, step) => Math.max(peak, step.spoilerLevel),
    guide.spoilerLevel as number,
  );
}

/** 用于「按难度分组展示」的辅助函数（保持类型安全，避免调用处写 as）。 */
export function groupGuidesByKind(
  guides: readonly GuideArticle[],
): Record<GuideKind, GuideArticle[]> {
  const grouped = Object.fromEntries(
    GUIDE_KINDS.map((kind) => [kind, [] as GuideArticle[]]),
  ) as Record<GuideKind, GuideArticle[]>;

  for (const guide of guides) {
    grouped[guide.kind].push(guide);
  }

  return grouped;
}
