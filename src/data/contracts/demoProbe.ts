import { isPaginatedOf, isRecord } from '@/data/contracts/common';
import type { Paginated } from '@/data/contracts/common';

/**
 * 「演示探针」契约 —— 演示系统专用的最小数据域。
 *
 * 它**不是业务数据**：存在的唯一目的是让演示系统的验收可被真实验证 ——
 * Repository → MSW → Dexie 全链路、写操作持久化、StateBoundary 五态、
 * 快照「导出 → 清空 → 导入」完全还原。
 * 四个业务模块已按同一套模式接入各自的真实契约；探针面板保留在首页，
 * 作为演示系统的常驻自检面（而不是被业务列表取代）。
 */
export const PROBE_CATEGORIES = ['alpha', 'beta', 'gamma'] as const;

export type ProbeCategory = (typeof PROBE_CATEGORIES)[number];

export interface DemoProbe {
  id: string;
  label: string;
  category: ProbeCategory;
  score: number;
  collected: boolean;
  createdAt: string;
}

export function isProbeCategory(value: unknown): value is ProbeCategory {
  return typeof value === 'string' && (PROBE_CATEGORIES as readonly string[]).includes(value);
}

export function isDemoProbe(value: unknown): value is DemoProbe {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.label === 'string' &&
    isProbeCategory(value.category) &&
    typeof value.score === 'number' &&
    typeof value.collected === 'boolean' &&
    typeof value.createdAt === 'string'
  );
}

export function isPaginatedProbes(value: unknown): value is Paginated<DemoProbe> {
  return isPaginatedOf(value, isDemoProbe);
}
