import { HttpResponse, http } from 'msw';

import { API_PATHS } from '@/data/apiPaths';
import { isChapter } from '@/data/contracts/encyclopedia';
import type { Chapter } from '@/data/contracts/encyclopedia';
import { isGuideDifficulty, isGuideKind, isGuideSort } from '@/data/contracts/guide';
import type { GuideDifficulty, GuideKind, GuideQuery, GuideSort } from '@/data/contracts/guide';
import {
  getGuide,
  listGuides,
  readGuideKindCounts,
  readLikedGuideIds,
  toggleGuideLike,
} from '@/data/db/guideData';
import { DEVICE_ID_HEADER } from '@/data/deviceId';
import { mockDelay, mockError, toMockResponse } from '@/data/mocks/mockControl';
import { resolveUserId } from '@/data/mocks/session';

/**
 * 攻略库接口（读公开、点赞需要归属者）。
 * 归属规则与影神图收藏一致：登录用 user:<id>，未登录用 device:<id>。
 */
function readOwnerId(request: Request): string {
  const userId = resolveUserId(request);
  if (userId !== null) {
    return `user:${userId}`;
  }

  const deviceId = request.headers.get(DEVICE_ID_HEADER);
  return `device:${deviceId === null || deviceId === '' ? 'anonymous' : deviceId}`;
}

function readEnum<TValue extends string | number>(
  raw: string | null,
  guard: (value: unknown) => value is TValue,
): TValue | undefined {
  if (raw === null || raw === '') {
    return undefined;
  }

  const numeric = Number(raw);
  const candidate: unknown = Number.isNaN(numeric) ? raw : numeric;

  return guard(candidate) ? candidate : undefined;
}

function readQuery(request: Request): GuideQuery {
  const params = new URL(request.url).searchParams;

  return {
    kind: readEnum<GuideKind>(params.get('kind'), isGuideKind),
    difficulty: readEnum<GuideDifficulty>(params.get('difficulty'), isGuideDifficulty),
    chapter: readEnum<Chapter>(params.get('chapter'), isChapter),
    search: params.get('search') ?? undefined,
    sort: readEnum<GuideSort>(params.get('sort'), isGuideSort),
    page: Number(params.get('page') ?? '1') || 1,
  };
}

export const guideHandlers = [
  http.get(API_PATHS.guide.list, async ({ request }) => {
    try {
      mockError();
      await mockDelay();

      return HttpResponse.json(await listGuides(readQuery(request)));
    } catch (error) {
      return toMockResponse(error);
    }
  }),

  http.get(API_PATHS.guide.counts, async () => {
    try {
      mockError();
      await mockDelay();

      return HttpResponse.json(await readGuideKindCounts());
    } catch (error) {
      return toMockResponse(error);
    }
  }),

  http.get(API_PATHS.guide.likes, async ({ request }) => {
    try {
      mockError();
      await mockDelay();

      return HttpResponse.json(await readLikedGuideIds(readOwnerId(request)));
    } catch (error) {
      return toMockResponse(error);
    }
  }),

  http.get(API_PATHS.guide.detail, async ({ params }) => {
    try {
      mockError();
      await mockDelay();

      const id = typeof params.guideId === 'string' ? params.guideId : '';
      return HttpResponse.json(await getGuide(id));
    } catch (error) {
      return toMockResponse(error);
    }
  }),

  http.post(API_PATHS.guide.like, async ({ request, params }) => {
    try {
      mockError();
      await mockDelay();

      const id = typeof params.guideId === 'string' ? params.guideId : '';
      return HttpResponse.json(await toggleGuideLike(readOwnerId(request), id));
    } catch (error) {
      return toMockResponse(error);
    }
  }),
];
