import { HttpError } from '@/data/HttpError';
import type {
  CheckInRecord,
  CheckInState,
  NotificationItem,
  TaskItem,
} from '@/data/contracts/growth';
import { resolveTaskStatus } from '@/data/contracts/growth';
import { hmwDb } from '@/data/db/hmwDb';
import type { NotificationRecord, TaskRecord } from '@/data/db/records';
import { grantRewards, findUserById } from '@/data/db/userData';
import type { UserRecord } from '@/data/db/records';
import {
  CHECK_IN_CALENDAR_DAYS,
  calcCheckInReward,
  computeStreak,
  resolvePeriodKey,
  toDateKey,
} from '@/utils/checkInRules';

/**
 * 成长域的数据操作（mock 后端的「签到 / 任务 / 消息服务」）。
 *
 * 三条业务规则在这里落地，并且都是可以用单测直接验证的：
 * 1. 同一天只能签到一次（幂等由日期键保证，不靠前端拦）；
 * 2. 任务进度由真实行为推导（签到会让「上香」任务变成可领取）；
 * 3. 每日/周常任务跨期自动重置（周期键比较，不需要定时任务）。
 */

/* ── 签到 ─────────────────────────────────────────────────────────── */

function toPublicCheckIn(record: CheckInRecord): CheckInRecord {
  return { ...record };
}

async function readRecords(userId: string): Promise<CheckInRecord[]> {
  const records = await hmwDb.checkins.where('userId').equals(userId).toArray();
  return records.sort((left, right) => left.date.localeCompare(right.date));
}

export async function readCheckInState(userId: string, now: Date): Promise<CheckInState> {
  const records = await readRecords(userId);
  const todayKey = toDateKey(now);
  const streak = computeStreak(records, now);
  const todayChecked = records.some((record) => record.date === todayKey);

  return {
    todayChecked,
    streak,
    totalDays: records.length,
    nextReward: calcCheckInReward(todayChecked ? streak : streak + 1),
    // 只回传日历窗口内的记录：历史再长也不必全量往返
    records: records.slice(-CHECK_IN_CALENDAR_DAYS).map(toPublicCheckIn),
  };
}

export interface CheckInOutcome {
  state: CheckInState;
  record: CheckInRecord;
  user: UserRecord;
}

export async function performCheckIn(userId: string, now: Date): Promise<CheckInOutcome> {
  const todayKey = toDateKey(now);
  const records = await readRecords(userId);

  if (records.some((record) => record.date === todayKey)) {
    throw new HttpError(409, '今日已上过香，明天再来', { code: 'ALREADY_CHECKED_IN' });
  }

  const streak = computeStreak(records, now) + 1;
  const reward = calcCheckInReward(streak);
  const record: CheckInRecord = {
    id: `${userId}:${todayKey}`,
    userId,
    date: todayKey,
    at: now.toISOString(),
    streak,
    reward,
  };

  await hmwDb.checkins.put(record);

  // 签到即修为与灵蕴：两处奖励都给，成长才有反馈
  const user = await grantRewards(userId, { spiritPoints: reward, exp: reward * 2 });
  await syncDerivedTaskProgress(userId, now);

  return { state: await readCheckInState(userId, now), record, user };
}

/* ── 任务 ─────────────────────────────────────────────────────────── */

function toTaskItem(record: TaskRecord): TaskItem {
  return {
    id: record.id,
    kind: record.kind,
    title: record.title,
    description: record.description,
    progress: record.progress,
    target: record.target,
    reward: record.reward,
    status: resolveTaskStatus(record.progress, record.target, record.claimed),
    expiresAt: record.expiresAt,
  };
}

/** 跨期重置：周期键不一致就把进度与领取状态归零。 */
async function rolloverTasks(records: TaskRecord[], now: Date): Promise<TaskRecord[]> {
  const rolled: TaskRecord[] = [];

  for (const record of records) {
    const expectedKey = resolvePeriodKey(record.kind, now);

    if (record.periodKey === expectedKey) {
      rolled.push(record);
      continue;
    }

    const next: TaskRecord = {
      ...record,
      progress: 0,
      claimed: false,
      periodKey: expectedKey,
    };
    await hmwDb.tasks.put(next);
    rolled.push(next);
  }

  return rolled;
}

/** 让任务进度反映真实行为：今天已上香 → 上香任务完成。 */
export async function syncDerivedTaskProgress(userId: string, now: Date): Promise<void> {
  const todayKey = toDateKey(now);
  const checkedToday = (await hmwDb.checkins.get(`${userId}:${todayKey}`)) !== undefined;
  const incense = await hmwDb.tasks.get(`${userId}:task:incense`);

  if (incense === undefined) {
    return;
  }

  const progress = checkedToday ? incense.target : 0;

  // 手动领取过的任务不再回退状态，避免「领取后进度被重置」
  if (incense.progress === progress && !(incense.claimed && !checkedToday)) {
    return;
  }

  await hmwDb.tasks.put({ ...incense, progress: checkedToday ? incense.target : 0 });
}

export async function readTaskItems(userId: string, now: Date): Promise<TaskItem[]> {
  await ensureGrowthProvisioned(userId, now);

  const records = await hmwDb.tasks.where('userId').equals(userId).toArray();
  const rolled = await rolloverTasks(records, now);

  return rolled
    .sort((left, right) => left.kind.localeCompare(right.kind) || left.id.localeCompare(right.id))
    .map(toTaskItem);
}

export interface ClaimOutcome {
  task: TaskItem;
  user: UserRecord;
}

export async function claimTaskReward(
  userId: string,
  taskId: string,
  now: Date,
): Promise<ClaimOutcome> {
  const record = await hmwDb.tasks.get(taskId);

  if (record === undefined || record.userId !== userId) {
    throw new HttpError(404, '任务不存在', { code: 'TASK_NOT_FOUND' });
  }

  /**
   * 跨期保护：直接调用领取接口（没先读过列表）时，记录可能还停留在上一周期。
   * 这里先把它滚到当前周期再拒，避免「上周的完成状态被本周冒领」。
   */
  const expectedPeriodKey = resolvePeriodKey(record.kind, now);
  if (record.periodKey !== expectedPeriodKey) {
    await hmwDb.tasks.put({
      ...record,
      progress: 0,
      claimed: false,
      periodKey: expectedPeriodKey,
    });
    throw new HttpError(409, '任务已进入新周期，请重新完成', { code: 'TASK_PERIOD_ROLLED' });
  }

  const status = resolveTaskStatus(record.progress, record.target, record.claimed);
  if (status === 'claimed') {
    throw new HttpError(409, '该任务奖励已领取', { code: 'TASK_ALREADY_CLAIMED' });
  }
  if (status === 'active') {
    throw new HttpError(409, '任务尚未完成，暂时不能领取', { code: 'TASK_NOT_COMPLETED' });
  }

  const updated: TaskRecord = { ...record, claimed: true };
  await hmwDb.tasks.put(updated);

  const user = await grantRewards(userId, { spiritPoints: updated.reward, exp: updated.reward });

  return { task: toTaskItem(updated), user };
}

/* ── 消息 ─────────────────────────────────────────────────────────── */

function toNotificationItem(record: NotificationRecord): NotificationItem {
  const { userId: _userId, ...item } = record;
  return item;
}

export async function readNotificationItems(
  userId: string,
  now: Date,
): Promise<NotificationItem[]> {
  await ensureGrowthProvisioned(userId, now);

  const records = await hmwDb.notifications.where('userId').equals(userId).toArray();

  return records
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .map(toNotificationItem);
}

export async function markNotificationRead(
  userId: string,
  notificationId: string,
): Promise<NotificationItem> {
  const record = await hmwDb.notifications.get(notificationId);

  if (record === undefined || record.userId !== userId) {
    throw new HttpError(404, '消息不存在', { code: 'NOTIFICATION_NOT_FOUND' });
  }

  const updated: NotificationRecord = { ...record, read: true };
  await hmwDb.notifications.put(updated);

  return toNotificationItem(updated);
}

export async function markAllNotificationsRead(userId: string): Promise<number> {
  const records = await hmwDb.notifications.where('userId').equals(userId).toArray();
  const unread = records.filter((record) => !record.read);

  await hmwDb.notifications.bulkPut(unread.map((record) => ({ ...record, read: true })));

  return unread.length;
}

/* ── 首次开通与演示种子 ───────────────────────────────────────────── */

/**
 * 种子工厂依赖 faker（压缩后仍有数百 KB）。
 * 本模块被 MSW handler 静态引用，因此这里用动态 import 把 faker 挡在启动路径之外：
 * 只有真的要造数据时（首次开通 / 重置 / 填满）才付这份加载成本。
 * 返回类型交给 TS 推断，避免写 `typeof import(...)` 这类内联导入类型注解。
 */
async function loadSeedFactory() {
  return import('@/data/seeds/growth.seed');
}

/**
 * 懒开通：无论是演示账号还是刚注册的用户，第一次访问成长域时补齐
 * 任务与欢迎消息。放在读取路径上，因此不需要额外的初始化时机。
 */
export async function ensureGrowthProvisioned(userId: string, now: Date): Promise<void> {
  const taskCount = await hmwDb.tasks.where('userId').equals(userId).count();
  const notificationCount = await hmwDb.notifications.where('userId').equals(userId).count();

  // 两件事都齐了就完全不加载种子工厂（绝大多数请求走的就是这条快路径）
  if (taskCount > 0 && notificationCount > 0) {
    return;
  }

  const { createStarterTaskRecords, createWelcomeNotification } = await loadSeedFactory();

  if (taskCount === 0) {
    await hmwDb.tasks.bulkPut(createStarterTaskRecords(userId, now));
  }

  if (notificationCount === 0) {
    const user = await findUserById(userId);
    await hmwDb.notifications.put(
      createWelcomeNotification(userId, now, user?.displayName ?? '天命人'),
    );
  }
}

/** 演示账号的富数据：42 天签到历史 + 全部任务 + 10 条消息。 */
export async function seedDemoGrowth(userId: string, now: Date): Promise<void> {
  const { createCheckInHistory, createNotificationRecords, createTaskRecords } =
    await loadSeedFactory();

  await hmwDb.checkins.bulkPut(createCheckInHistory(userId, now));
  await hmwDb.tasks.bulkPut(createTaskRecords(userId, now, { claimedKeys: ['browse-news'] }));
  await hmwDb.notifications.bulkPut(createNotificationRecords(userId, now));
  await syncDerivedTaskProgress(userId, now);
}

export async function clearGrowthTables(): Promise<void> {
  await hmwDb.checkins.clear();
  await hmwDb.tasks.clear();
  await hmwDb.notifications.clear();
}
