import { toPaginated } from '@/data/contracts/common';
import type { Paginated } from '@/data/contracts/common';
import type {
  GuideArticle,
  GuideKindCounts,
  GuideLikeState,
  GuideQuery,
} from '@/data/contracts/guide';
import { hmwDb } from '@/data/db/hmwDb';
import type { GuideLikeRecord } from '@/data/db/records';
import { HttpError } from '@/data/HttpError';
import { createGuideSeed } from '@/data/seeds/guide.seed';
import { applyGuideQuery, countGuidesByKind } from '@/utils/guideRules';

/**
 * 攻略库的数据操作（mock 后端的「攻略服务」）。
 * 点赞是唯一写操作：它同时改「点赞记录」与「攻略上的计数」，
 * 因此用户刷新后看到的数字是自己点过的结果，而不是固定的种子值。
 */

export const GUIDE_PAGE_SIZE = 9;

export async function readAllGuides(): Promise<GuideArticle[]> {
  return hmwDb.guideArticles.toArray();
}

export async function listGuides(query: GuideQuery): Promise<Paginated<GuideArticle>> {
  const guides = await readAllGuides();
  const matched = applyGuideQuery(guides, query);

  return toPaginated(matched, query.page ?? 1, query.pageSize ?? GUIDE_PAGE_SIZE);
}

export async function getGuide(id: string): Promise<GuideArticle> {
  const guide = await hmwDb.guideArticles.get(id);

  if (guide === undefined) {
    throw new HttpError(404, '攻略不存在', { code: 'GUIDE_NOT_FOUND' });
  }

  return guide;
}

/**
 * 三类攻略的条数。
 * 与资讯标签统计同理：统计**全量数据**而不是当前筛选结果，
 * 否则分类角标会随筛选互相吞掉（选了 BOSS 之后「配装」就变 0，看起来像没有内容）。
 */
export async function readGuideKindCounts(): Promise<GuideKindCounts> {
  return countGuidesByKind(await readAllGuides());
}

/* ── 点赞（按 ownerId 归属：账号或设备） ─────────────────────────── */

function toLikeId(ownerId: string, guideId: string): string {
  return `${ownerId}:${guideId}`;
}

export async function readLikedGuideIds(ownerId: string): Promise<string[]> {
  const records = await hmwDb.guideLikes.where('ownerId').equals(ownerId).toArray();

  return records
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
    .map((record) => record.guideId);
}

export async function toggleGuideLike(ownerId: string, guideId: string): Promise<GuideLikeState> {
  const id = toLikeId(ownerId, guideId);
  let liked = false;
  let likes = 0;

  // 读-改-写必须包在同一个事务里。点赞要同时改「记录」与「攻略上的计数」，
  // 分开做的话并发点击会出现「记录被删了、计数却还是 +1」这种对不上的状态
  // （读过攻略之后、写回之前，另一个请求改了记录）。Dexie 会把同一批表上的
  // 事务串行化，因此并发点击退化成一次接一次的切换，最终状态始终自洽。
  await hmwDb.transaction('rw', hmwDb.guideArticles, hmwDb.guideLikes, async () => {
    const guide = await getGuide(guideId);
    const existing = await hmwDb.guideLikes.get(id);

    if (existing === undefined) {
      const record: GuideLikeRecord = {
        id,
        ownerId,
        guideId,
        createdAt: new Date().toISOString(),
      };
      await hmwDb.guideLikes.put(record);
    } else {
      await hmwDb.guideLikes.delete(id);
    }

    liked = existing === undefined;
    likes = Math.max(0, guide.likes + (liked ? 1 : -1));

    // 计数落在攻略记录上：这样「点赞数」对所有人都是同一个权威值，而不是各自本地推算
    await hmwDb.guideArticles.put({ ...guide, likes });
  });

  return {
    guideId,
    liked,
    likes,
    ids: await readLikedGuideIds(ownerId),
  };
}

/* ── 播种与清理 ───────────────────────────────────────────────────── */

export async function seedGuideArticles(now: Date = new Date()): Promise<number> {
  const guides = createGuideSeed(now);

  await hmwDb.transaction('rw', hmwDb.guideArticles, async () => {
    await hmwDb.guideArticles.clear();
    await hmwDb.guideArticles.bulkPut(guides);
  });

  return guides.length;
}

export async function countGuideArticles(): Promise<number> {
  return hmwDb.guideArticles.count();
}

export async function clearGuideTables(): Promise<void> {
  await hmwDb.guideArticles.clear();
  await hmwDb.guideLikes.clear();
}
