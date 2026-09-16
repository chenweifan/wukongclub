import { beforeEach, describe, expect, it } from 'vitest';

import { GUIDE_KINDS } from '@/data/contracts/guide';
import { clearAllData } from '@/data/db/demoData';
import {
  GUIDE_PAGE_SIZE,
  countGuideArticles,
  getGuide,
  listGuides,
  readGuideKindCounts,
  readLikedGuideIds,
  seedGuideArticles,
  toggleGuideLike,
} from '@/data/db/guideData';
import { HttpError } from '@/data/HttpError';
import { guideRepo } from '@/data/repositories';
import { useDemoStore } from '@/demo/demoStore';
import { GUIDE_SEED_COUNT } from '@/data/seeds/guide.seed';

const NOW = new Date('2026-02-14T12:00:00.000Z');
const OWNER = 'device-test-guide';
const OTHER_OWNER = 'device-other-guide';

/**
 * 攻略 Repository + 数据层的集成测试（真实走 MSW + Dexie）。
 * 重点：查询参数确实被服务端使用、分类角标不随筛选变化、点赞按 owner 归属且计数落在攻略上。
 */
describe('攻略数据层', () => {
  beforeEach(async () => {
    await clearAllData();
    await seedGuideArticles(NOW);
  });

  it('播种是幂等的（不会重复堆积）', async () => {
    const before = await countGuideArticles();
    expect(before).toBe(GUIDE_SEED_COUNT);

    await seedGuideArticles(NOW);
    expect(await countGuideArticles()).toBe(before);
  });

  it('清空数据会移除攻略与点赞记录（空态可演示）', async () => {
    await toggleGuideLike(OWNER, 'guide-heixiongjing');
    await clearAllData();

    expect(await countGuideArticles()).toBe(0);
    expect(await readLikedGuideIds(OWNER)).toEqual([]);
  });

  it('分页返回结构与总数；默认页大小生效', async () => {
    const page = await listGuides({});

    expect(page.total).toBe(GUIDE_SEED_COUNT);
    expect(page.items.length).toBeLessThanOrEqual(GUIDE_PAGE_SIZE);
    expect(page.page).toBe(1);
    expect(page.pageSize).toBe(GUIDE_PAGE_SIZE);
  });

  it('翻页不会重复返回同一条（分页边界）', async () => {
    const first = await listGuides({ page: 1 });
    const second = await listGuides({ page: 2 });

    const firstIds = first.items.map((guide) => guide.id);
    const secondIds = second.items.map((guide) => guide.id);

    expect(firstIds.length).toBeGreaterThan(0);
    expect(secondIds.length).toBeGreaterThan(0);
    expect(secondIds.some((id) => firstIds.includes(id))).toBe(false);
  });

  it('超出范围的页码返回空列表而不是报错（边界）', async () => {
    const page = await listGuides({ page: 99 });

    expect(page.items).toEqual([]);
    expect(page.total).toBe(GUIDE_SEED_COUNT);
  });

  it('详情不存在时 404', async () => {
    await expect(getGuide('guide-nope')).rejects.toBeInstanceOf(HttpError);
  });

  it('分类角标统计全量数据，不随当前筛选变化', async () => {
    const all = await readGuideKindCounts();
    const bossesOnly = await listGuides({ kind: 'boss' });

    expect(bossesOnly.total).toBe(all.boss);
    expect(bossesOnly.total).toBeLessThan(GUIDE_SEED_COUNT);
    // 三个键都必须存在：缺键会让筛选条显示 undefined
    for (const kind of GUIDE_KINDS) {
      expect(typeof all[kind]).toBe('number');
    }
  });

  it('点赞可叠加：同一 owner 再点一次即取消（计数回落）', async () => {
    const guide = await getGuide('guide-heixiongjing');
    const baseLikes = guide.likes;

    const liked = await toggleGuideLike(OWNER, guide.id);
    expect(liked).toMatchObject({ liked: true, likes: baseLikes + 1, guideId: guide.id });
    expect(liked.ids).toContain(guide.id);

    const unliked = await toggleGuideLike(OWNER, guide.id);
    expect(unliked).toMatchObject({ liked: false, likes: baseLikes });
    expect(unliked.ids).not.toContain(guide.id);
  });

  it('并发点同一篇：最终状态自洽，不会出现计数与记录不一致', async () => {
    const guide = await getGuide('guide-lingxuzi');
    const baseLikes = guide.likes;

    // 三个请求同时在飞：两次成功点赞 + 一次取消，最终应落在「已点赞」或「未点赞」之一，
    // 且点赞数与「记录是否存在」必须一致（不能出现有记录但计数没加的情况）
    await Promise.all([
      toggleGuideLike(OWNER, guide.id),
      toggleGuideLike(OWNER, guide.id),
      toggleGuideLike(OWNER, guide.id),
    ]);

    const ids = await readLikedGuideIds(OWNER);
    const finalGuide = await getGuide(guide.id);
    const liked = ids.includes(guide.id);

    expect(finalGuide.likes).toBe(liked ? baseLikes + 1 : baseLikes);
  });

  it('点赞按 owner 归属：换设备/账号互不影响', async () => {
    await toggleGuideLike(OWNER, 'guide-heixiongjing');

    expect(await readLikedGuideIds(OWNER)).toEqual(['guide-heixiongjing']);
    expect(await readLikedGuideIds(OTHER_OWNER)).toEqual([]);
  });

  it('未点赞的攻略不会出现在列表里（边界）', async () => {
    expect(await readLikedGuideIds(OWNER)).toEqual([]);
  });
});

describe('guideRepo', () => {
  beforeEach(async () => {
    await clearAllData();
    await seedGuideArticles(NOW);
  });

  it('list 返回分页结果', async () => {
    const page = await guideRepo.list({});

    expect(page.total).toBe(GUIDE_SEED_COUNT);
    expect(page.items[0]?.title.length).toBeGreaterThan(0);
    expect(page.items[0]?.steps.length).toBeGreaterThan(0);
  });

  it('筛选参数经由 HTTP 传给服务端', async () => {
    const builds = await guideRepo.list({ kind: 'build' });
    expect(builds.items.every((guide) => guide.kind === 'build')).toBe(true);

    const hard = await guideRepo.list({ difficulty: 'hard', chapter: 1 });
    expect(hard.items.every((guide) => guide.difficulty === 'hard' && guide.chapter === 1)).toBe(
      true,
    );
  });

  it('搜索与排序生效', async () => {
    const searched = await guideRepo.list({ search: '黑熊精' });
    expect(searched.total).toBeGreaterThan(0);
    expect(searched.items[0]?.id).toBe('guide-heixiongjing');

    const popular = await guideRepo.list({ sort: 'popular' });
    const views = popular.items.map((guide) => guide.views);
    expect(views).toEqual([...views].sort((left, right) => right - left));
  });

  it('搜索无结果时返回空列表而不是 404（边界）', async () => {
    const page = await guideRepo.list({ search: '不存在的关键词zzz' });

    expect(page.items).toEqual([]);
    expect(page.total).toBe(0);
  });

  it('kindCounts 返回三类计数，且与列表总数一致', async () => {
    const counts = await guideRepo.kindCounts();
    const total = GUIDE_KINDS.reduce((sum, kind) => sum + counts[kind], 0);

    expect(total).toBe(GUIDE_SEED_COUNT);
  });

  it('detail 返回单篇攻略（含步骤与关联词条名）', async () => {
    const detail = await guideRepo.detail('guide-huangmei');

    expect(detail.id).toBe('guide-huangmei');
    expect(detail.steps.length).toBeGreaterThan(0);
    expect(detail.relatedEntries.every((entry) => entry.name !== entry.id)).toBe(true);
  });

  it('detail 不存在时 404', async () => {
    await expect(guideRepo.detail('guide-nope')).rejects.toMatchObject({ status: 404 });
  });

  it('点赞往返：likedIds → toggleLike → likedIds', async () => {
    expect(await guideRepo.likedIds()).toEqual([]);

    const state = await guideRepo.toggleLike('guide-heixiongjing');
    expect(state.liked).toBe(true);
    expect(await guideRepo.likedIds()).toEqual(['guide-heixiongjing']);

    const reverted = await guideRepo.toggleLike('guide-heixiongjing');
    expect(reverted.liked).toBe(false);
    expect(await guideRepo.likedIds()).toEqual([]);
  });

  it('给不存在的攻略点赞返回 404（而不是静默成功）', async () => {
    await expect(guideRepo.toggleLike('guide-nope')).rejects.toMatchObject({ status: 404 });
  });

  it('断网态：列表、统计与点赞都变成 HttpError(0)', async () => {
    useDemoStore.getState().patch({ uiState: 'offline' });

    const error = await guideRepo.list({}).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(HttpError);
    expect((error as HttpError).isOffline).toBe(true);

    await expect(guideRepo.kindCounts()).rejects.toBeInstanceOf(HttpError);
    await expect(guideRepo.toggleLike('guide-heixiongjing')).rejects.toBeInstanceOf(HttpError);
  });

  it('错误态：返回 500 与「灵蕴紊乱」', async () => {
    useDemoStore.getState().patch({ uiState: 'error' });
    await expect(guideRepo.list({})).rejects.toMatchObject({ status: 500 });
  });
});
