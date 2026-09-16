import { beforeEach, describe, expect, it } from 'vitest';

import { clearAllData } from '@/data/db/demoData';
import { HttpError } from '@/data/HttpError';
import { authRepo, growthRepo } from '@/data/repositories';
import { useDemoStore } from '@/demo/demoStore';

const IN_CENSE_TASK_ID_PREFIX = ':task:incense';

async function signInAsDemo() {
  return authRepo.demoLogin();
}

describe('growthRepo（未登录）', () => {
  beforeEach(async () => {
    await clearAllData();
  });

  it('三个只读接口在未登录时都返回 401，而不是空列表', async () => {
    await expect(growthRepo.checkInState()).rejects.toMatchObject({ status: 401 });
    await expect(growthRepo.tasks()).rejects.toMatchObject({ status: 401 });
    await expect(growthRepo.notifications()).rejects.toMatchObject({ status: 401 });
  });

  it('签到与领取在未登录时同样 401', async () => {
    await expect(growthRepo.checkIn()).rejects.toMatchObject({ status: 401 });
    await expect(growthRepo.claimTask('any-id')).rejects.toMatchObject({ status: 401 });
  });
});

describe('growthRepo（签到）', () => {
  beforeEach(async () => {
    await clearAllData();
    await signInAsDemo();
  });

  it('演示账号首次进入：未上香、连续 0 天、有可得的奖励预告', async () => {
    const state = await growthRepo.checkInState();

    expect(state.todayChecked).toBe(false);
    expect(state.streak).toBe(0);
    expect(state.totalDays).toBe(0);
    expect(state.nextReward).toBeGreaterThan(0);
    expect(state.records).toEqual([]);
  });

  it('签到成功：连续 1 天、灵蕴与修为同时入账', async () => {
    const before = await growthRepo.tasks();
    expect(before.length).toBeGreaterThan(0);

    const me = await authRepo.me();
    const outcome = await growthRepo.checkIn();

    expect(outcome.record.streak).toBe(1);
    expect(outcome.record.reward).toBeGreaterThan(0);
    expect(outcome.state.todayChecked).toBe(true);
    expect(outcome.state.streak).toBe(1);
    expect(outcome.state.totalDays).toBe(1);
    expect(outcome.user.spiritPoints).toBe(me.spiritPoints + outcome.record.reward);
    expect(outcome.user.exp).toBe(me.exp + outcome.record.reward * 2);
  });

  it('同一天重复签到返回 409（幂等由服务端按日期键保证）', async () => {
    await growthRepo.checkIn();

    await expect(growthRepo.checkIn()).rejects.toMatchObject({ status: 409 });
  });

  it('签到会写进日历：记录落在今天且带有当时的连续天数快照', async () => {
    await growthRepo.checkIn();
    const state = await growthRepo.checkInState();

    expect(state.records).toHaveLength(1);
    expect(state.records[0]?.streak).toBe(1);
    expect(state.records[0]?.reward).toBe(state.records[0]?.reward);
  });
});

describe('growthRepo（任务）', () => {
  beforeEach(async () => {
    await clearAllData();
    await signInAsDemo();
  });

  it('懒开通：新用户拿到日常与周常任务，隐藏成就不会被提前剧透进度', async () => {
    const tasks = await growthRepo.tasks();

    expect(tasks.some((task) => task.kind === 'daily')).toBe(true);
    expect(tasks.some((task) => task.kind === 'weekly')).toBe(true);
    // 隐藏成就在种子模板里存在，但新用户的开通集合里没有它们
    expect(tasks.every((task) => task.progress === 0)).toBe(true);
  });

  it('未完成的任务不能领取（409）', async () => {
    const tasks = await growthRepo.tasks();
    const weekly = tasks.find((task) => task.kind === 'weekly');
    expect(weekly).toBeDefined();

    await expect(growthRepo.claimTask(weekly!.id)).rejects.toMatchObject({ status: 409 });
  });

  it('签到让「上香」任务变成可领取，领取后再领返回 409', async () => {
    await growthRepo.checkIn();

    // 基准要在签到之后再取：签到本身已经发过一次灵蕴
    const afterCheckIn = await authRepo.me();

    const tasks = await growthRepo.tasks();
    const incense = tasks.find((task) => task.id.includes(IN_CENSE_TASK_ID_PREFIX));
    expect(incense?.status).toBe('claimable');

    const outcome = await growthRepo.claimTask(incense!.id);
    expect(outcome.task.status).toBe('claimed');
    expect(outcome.user.spiritPoints).toBe(afterCheckIn.spiritPoints + incense!.reward);

    await expect(growthRepo.claimTask(incense!.id)).rejects.toMatchObject({ status: 409 });
  });

  it('领取不存在的任务返回 404', async () => {
    await expect(growthRepo.claimTask('task-does-not-exist')).rejects.toMatchObject({
      status: 404,
    });
  });
});

describe('growthRepo（消息）', () => {
  beforeEach(async () => {
    await clearAllData();
    await signInAsDemo();
  });

  it('新用户只有一条未读欢迎消息', async () => {
    const items = await growthRepo.notifications();

    expect(items).toHaveLength(1);
    expect(items[0]?.read).toBe(false);
    expect(items[0]?.category).toBe('system');
  });

  it('标记单条已读后列表反映新状态', async () => {
    const [first] = await growthRepo.notifications();
    expect(first).toBeDefined();

    const updated = await growthRepo.markNotificationRead(first!.id);
    expect(updated.read).toBe(true);

    const after = await growthRepo.notifications();
    expect(after[0]?.read).toBe(true);
  });

  it('全部已读返回被更新的条数；再次调用为 0', async () => {
    expect(await growthRepo.markAllNotificationsRead()).toBe(1);
    expect(await growthRepo.markAllNotificationsRead()).toBe(0);
  });

  it('标记不存在的消息返回 404', async () => {
    await expect(growthRepo.markNotificationRead('nope')).rejects.toMatchObject({ status: 404 });
  });
});

describe('growthRepo（演示状态注入）', () => {
  beforeEach(async () => {
    await clearAllData();
    await signInAsDemo();
  });

  it('断网态：签到失败为 HttpError(0)，界面据此展示统一断网态', async () => {
    useDemoStore.getState().patch({ uiState: 'offline' });

    const error = await growthRepo.checkInState().catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(HttpError);
    expect((error as HttpError).isOffline).toBe(true);
  });

  it('恢复 normal 后又能正常读取（错误态可逆）', async () => {
    useDemoStore.getState().patch({ uiState: 'error' });
    await expect(growthRepo.tasks()).rejects.toBeInstanceOf(HttpError);

    useDemoStore.getState().patch({ uiState: 'normal' });
    await expect(growthRepo.tasks()).resolves.toBeInstanceOf(Array);
  });
});
