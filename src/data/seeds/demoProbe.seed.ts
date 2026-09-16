import { faker } from '@faker-js/faker';

import { PROBE_CATEGORIES } from '@/data/contracts/demoProbe';
import type { DemoProbe } from '@/data/contracts/demoProbe';

/**
 * 演示探针种子数据（协议 6.x：长尾数据用 faker 生成，但必须固定 seed 保证可复现）。
 *
 * 注意：这里的词条是**纯演示用词**，与任何真实游戏内容无关 ——
 * 真实影神图数据在 data/seeds/encyclopedia.seed.ts 里。
 */

/** 基线数据量：首次进入与「重置」用。 */
export const BASELINE_PROBE_COUNT = 12;

/** 「填满」用的数据量：够让列表滚动，顺便验证后续虚拟滚动的接入位。 */
export const FILLED_PROBE_COUNT = 60;

const PROBE_PREFIXES = ['灵蕴', '甲胄', '丹药', '符箓', '经文', '法器', '山径', '古钟'] as const;

/** 固定基准时间 + 序号偏移：保证同一 seed 生成的时间序列完全一致且有序。 */
const SEED_BASE_TIME = Date.parse('2026-01-01T08:00:00.000Z');
const SEED_TIME_STEP_MS = 3_600_000;

/**
 * 生成探针种子。
 * 同 (count, seed) 必然得到完全相同的数组 —— 单测里有断言守着这条性质。
 */
export function createProbeSeed(count: number, seed: number): DemoProbe[] {
  const safeCount = Math.max(0, Math.floor(count));
  faker.seed(seed);

  return Array.from({ length: safeCount }, (_, index) => {
    const category = faker.helpers.arrayElement(PROBE_CATEGORIES);
    const prefix = faker.helpers.arrayElement(PROBE_PREFIXES);

    return {
      // id 不用 faker.uuid：序号形式让排序、排查、快照 diff 都可读
      id: `probe-${seed}-${String(index).padStart(3, '0')}`,
      label: `${prefix}·${faker.number.int({ min: 1, max: 99 })}号探针`,
      category,
      score: faker.number.int({ min: 1, max: 100 }),
      collected: faker.datatype.boolean(0.25),
      createdAt: new Date(SEED_BASE_TIME + index * SEED_TIME_STEP_MS).toISOString(),
    } satisfies DemoProbe;
  });
}
