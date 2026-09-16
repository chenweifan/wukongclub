import type { DemoProbe } from '@/data/contracts/demoProbe';
import { isDataInitialized, markDataInitialized } from '@/data/db/dataFlags';
import { hmwDb } from '@/data/db/hmwDb';
import {
  BASELINE_PROBE_COUNT,
  FILLED_PROBE_COUNT,
  createProbeSeed,
} from '@/data/seeds/demoProbe.seed';
import { clearHmwEntries } from '@/utils/hmwStorage';

/**
 * 演示数据的「重置 / 填满 / 清空」实现（协议 1.4 数据分区）。
 * 这几步直接操作本地库与 localStorage，不经过 MSW —— 它们模拟的是
 * 「运维手段」，而不是业务接口。
 *
 * 首次播种标记见 dataFlags.ts（零依赖模块，供启动路径先行判断）。
 */
export { DATA_INITIALIZED_KEY, isDataInitialized, markDataInitialized } from '@/data/db/dataFlags';

export async function readAllProbes(): Promise<DemoProbe[]> {
  const items = await hmwDb.probes.toArray();
  return items.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

/** 覆盖式写入：先清表再批量写入，保证种子操作是幂等的。 */
export async function writeProbes(probes: readonly DemoProbe[]): Promise<void> {
  await hmwDb.transaction('rw', hmwDb.probes, async () => {
    await hmwDb.probes.clear();
    await hmwDb.probes.bulkPut([...probes]);
  });
  markDataInitialized();
}

export async function seedProbes(count: number, seed: number): Promise<number> {
  const probes = createProbeSeed(count, seed);
  await writeProbes(probes);
  return probes.length;
}

/** 重置：回到基线数据量。 */
export async function resetDemoData(seed: number): Promise<number> {
  return seedProbes(BASELINE_PROBE_COUNT, seed);
}

/** 填满：写入足量数据，用于验证长列表与后续虚拟滚动。 */
export async function fillDemoData(seed: number): Promise<number> {
  return seedProbes(FILLED_PROBE_COUNT, seed);
}

/** 清空：本地库清表 + localStorage 按 hmw: 前缀清理（协议 1.7 的 resetAll 语义）。 */
export async function clearAllData(): Promise<{ clearedKeys: number }> {
  await hmwDb.probes.clear();
  const clearedKeys = clearHmwEntries(window.localStorage);
  markDataInitialized();
  return { clearedKeys };
}

/** 首次进入站点时播种基线数据；已初始化过则什么都不做。 */
export async function ensureFirstRunSeed(seed: number): Promise<boolean> {
  if (isDataInitialized()) {
    return false;
  }
  await seedProbes(BASELINE_PROBE_COUNT, seed);
  return true;
}
