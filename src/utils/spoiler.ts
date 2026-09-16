import type { SpoilerLevel } from '@/data/contracts/common';

/**
 * 剧透可见性：站级原语，资讯 / 影神图 / 攻略 / 论坛共用。
 *
 * 判定对象只要求「有 id 且有剧透级别」，因此条目、步骤、帖子都能直接传进来 ——
 * 攻略的**步骤级**遮罩就是这么复用的（一条攻略整体不剧透，但某一步含结局信息）。
 */
export interface SpoilerContext {
  /** 全局剧透开关（演示状态 / 顶栏）。 */
  spoilerVisible: boolean;
  /** 用户手动揭开的 id 集合（会话内）。 */
  revealedIds: readonly string[];
}

export type SpoilerVisibility = 'full' | 'masked';

export interface SpoilerSubject {
  id: string;
  spoilerLevel: SpoilerLevel;
}

/**
 * 为什么是「遮罩」而不是「隐藏」：隐藏条目会让人以为内容缺失，
 * 而遮罩既保住了信息完整性（知道有这条），又把内容挡在用户主动点击之后。
 */
export function resolveSpoilerVisibility(
  subject: SpoilerSubject,
  context: SpoilerContext,
): SpoilerVisibility {
  if (subject.spoilerLevel === 0 || context.spoilerVisible) {
    return 'full';
  }

  return context.revealedIds.includes(subject.id) ? 'full' : 'masked';
}

/** 需要遮罩的条数（筛选条上的提示用）。 */
export function countMaskedSubjects(
  subjects: readonly SpoilerSubject[],
  context: SpoilerContext,
): number {
  return subjects.filter((subject) => resolveSpoilerVisibility(subject, context) === 'masked')
    .length;
}
