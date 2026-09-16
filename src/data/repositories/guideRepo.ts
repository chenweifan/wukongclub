import { API_PATHS, fillPath } from '@/data/apiPaths';
import { isPaginatedOf, isRecord } from '@/data/contracts/common';
import type { Paginated } from '@/data/contracts/common';
import {
  GUIDE_KINDS,
  isGuideArticle,
  isGuideLikeIdList,
  isGuideLikeState,
} from '@/data/contracts/guide';
import type {
  GuideArticle,
  GuideKindCounts,
  GuideLikeState,
  GuideQuery,
} from '@/data/contracts/guide';
import { HttpError } from '@/data/HttpError';
import { requestJson } from '@/data/httpClient';

/** 分类统计的形状校验：三个键都必须是数字（缺键会让角标显示 undefined）。 */
function isGuideKindCounts(value: unknown): value is GuideKindCounts {
  return isRecord(value) && GUIDE_KINDS.every((kind) => typeof value[kind] === 'number');
}

/**
 * 攻略 Repository：列表（分类/难度/章节/搜索/排序/分页）、详情、点赞。
 * 与百科一致：查询条件发给服务端，点赞的归属者是账号或设备。
 */
export interface GuideRepository {
  list(query: GuideQuery): Promise<Paginated<GuideArticle>>;
  detail(guideId: string): Promise<GuideArticle>;
  kindCounts(): Promise<GuideKindCounts>;
  likedIds(): Promise<readonly string[]>;
  toggleLike(guideId: string): Promise<GuideLikeState>;
}

function buildListUrl(query: GuideQuery): string {
  const params = new URLSearchParams();

  if (query.kind !== undefined) {
    params.set('kind', query.kind);
  }
  if (query.difficulty !== undefined) {
    params.set('difficulty', query.difficulty);
  }
  if (query.chapter !== undefined) {
    params.set('chapter', String(query.chapter));
  }
  if (query.search !== undefined && query.search.trim() !== '') {
    params.set('search', query.search.trim());
  }
  if (query.sort !== undefined) {
    params.set('sort', query.sort);
  }
  params.set('page', String(query.page ?? 1));

  return `${API_PATHS.guide.list}?${params.toString()}`;
}

function contractMismatch(what: string): HttpError {
  return new HttpError(500, `${what}响应不符合契约`, { code: 'CONTRACT_MISMATCH' });
}

export const guideRepo: GuideRepository = {
  async list(query) {
    const payload = await requestJson(buildListUrl(query));

    if (!isPaginatedOf(payload, isGuideArticle)) {
      throw contractMismatch('攻略列表');
    }

    return payload;
  },

  async detail(guideId) {
    const payload = await requestJson(fillPath(API_PATHS.guide.detail, { guideId }));

    if (!isGuideArticle(payload)) {
      throw contractMismatch('攻略详情');
    }

    return payload;
  },

  async likedIds() {
    const payload = await requestJson(API_PATHS.guide.likes);

    if (!isGuideLikeIdList(payload)) {
      throw contractMismatch('攻略点赞列表');
    }

    return payload;
  },

  async kindCounts() {
    const payload = await requestJson(API_PATHS.guide.counts);

    if (!isGuideKindCounts(payload)) {
      throw contractMismatch('攻略分类统计');
    }

    return payload;
  },

  async toggleLike(guideId) {
    const payload = await requestJson(fillPath(API_PATHS.guide.like, { guideId }), {
      method: 'POST',
    });

    if (!isGuideLikeState(payload)) {
      throw contractMismatch('攻略点赞');
    }

    return payload;
  },
};
