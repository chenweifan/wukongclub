import type { DemoProbe } from '@/data/contracts/demoProbe';
import { clearWikiTables, seedWikiEntries } from '@/data/db/encyclopediaData';
import { clearGuideTables, seedGuideArticles } from '@/data/db/guideData';
import { clearNewsTable, seedNewsArticles } from '@/data/db/newsData';
import { clearGrowthTables, seedDemoGrowth } from '@/data/db/growthData';
import { isDataInitialized, markDataInitialized } from '@/data/db/dataFlags';
import { hmwDb } from '@/data/db/hmwDb';
import { clearUserTable, ensureDemoUser } from '@/data/db/userData';
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

/**
 * 重置：回到基线数据（探针 + 影神图词条 + 资讯 + 演示账号 + 成长数据）。
 * 阶段 2 起，「重置」不再只清探针 —— 评审点它时期望的是回到一个完整可演示的初始状态。
 */
export async function resetDemoData(seed: number, now: Date = new Date()): Promise<number> {
  const probeCount = await seedProbes(BASELINE_PROBE_COUNT, seed);
  await seedWikiEntries();
  await seedNewsArticles(now);
  await seedGuideArticles(now);
  const user = await ensureDemoUser(now);
  await clearGrowthTables();
  await seedDemoGrowth(user.id, now);
  return probeCount;
}

/** 填满：写入足量数据，用于验证长列表与虚拟滚动。 */
export async function fillDemoData(seed: number, now: Date = new Date()): Promise<number> {
  const probeCount = await seedProbes(FILLED_PROBE_COUNT, seed);
  await seedWikiEntries();
  await seedNewsArticles(now);
  await seedGuideArticles(now);
  const user = await ensureDemoUser(now);
  await seedDemoGrowth(user.id, now);
  return probeCount;
}

/**
 * 清空：本地库全部清表（含影神图这类内容数据）+ localStorage 按 hmw: 前缀清理
 * （协议 1.7 的 resetAll 语义）。清空后百科会展示空态，这正是「空数据首启」场景要看的。
 */
export async function clearAllData(): Promise<{ clearedKeys: number }> {
  await hmwDb.transaction(
    'rw',
    hmwDb.probes,
    hmwDb.checkins,
    hmwDb.tasks,
    hmwDb.notifications,
    async () => {
      await hmwDb.probes.clear();
      await hmwDb.checkins.clear();
      await hmwDb.tasks.clear();
      await hmwDb.notifications.clear();
    },
  );
  await clearWikiTables();
  await clearNewsTable();
  await clearGuideTables();
  await clearUserTable();

  const clearedKeys = clearHmwEntries(window.localStorage);
  markDataInitialized();
  return { clearedKeys };
}

/**
 * 首次进入站点时播种基线数据；已初始化过则什么都不做。
 * 演示账号、成长数据与影神图词条一并准备好，否则首访者看到的是一座空站，
 * 分不清是「还没登录」还是「数据没种上」。
 */
export async function ensureFirstRunSeed(seed: number, now: Date = new Date()): Promise<boolean> {
  if (isDataInitialized()) {
    return false;
  }

  await seedProbes(BASELINE_PROBE_COUNT, seed);
  await seedWikiEntries();
  await seedNewsArticles(now);
  await seedGuideArticles(now);
  const user = await ensureDemoUser(now);
  await seedDemoGrowth(user.id, now);
  return true;
}
