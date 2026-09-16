import { CULTIVATION_RANKS } from '@/data/contracts/user';
import type { CultivationRank } from '@/data/contracts/user';

export interface UserLevel {
  level: number;
  rank: CultivationRank;
  /** 距下一境界还需多少修为；已是最高境界时为 null。 */
  expToNext: number | null;
  /** 当前境界内的进度（0–1），用于进度条；满级恒为 1。 */
  progress: number;
}

/**
 * 由修为推导等级与境界（纯函数）。
 * 服务端只存 exp，规则全在这里 —— 调整境界门槛时不需要回填历史数据。
 */
export function resolveUserLevel(exp: number): UserLevel {
  const safeExp = Number.isFinite(exp) ? Math.max(0, Math.floor(exp)) : 0;

  let rankIndex = 0;
  for (let index = 0; index < CULTIVATION_RANKS.length; index += 1) {
    const candidate = CULTIVATION_RANKS[index];
    if (candidate !== undefined && safeExp >= candidate.minExp) {
      rankIndex = index;
    }
  }

  const rank = CULTIVATION_RANKS[rankIndex] ?? CULTIVATION_RANKS[0];
  const nextRank = CULTIVATION_RANKS[rankIndex + 1] ?? null;

  if (rank === undefined) {
    // 理论上不可达（CULTIVATION_RANKS 非空）；保留兜底以免规则变更时静默崩溃
    throw new Error('修行境界表为空，无法推导等级');
  }

  if (nextRank === null) {
    return { level: rankIndex + 1, rank, expToNext: null, progress: 1 };
  }

  const span = nextRank.minExp - rank.minExp;
  const gained = safeExp - rank.minExp;

  return {
    level: rankIndex + 1,
    rank,
    expToNext: nextRank.minExp - safeExp,
    progress: span <= 0 ? 1 : Math.min(1, Math.max(0, gained / span)),
  };
}
