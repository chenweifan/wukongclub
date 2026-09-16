import { HttpResponse, http } from 'msw';

import { API_PATHS } from '@/data/apiPaths';
import { isNewsCategory, isNewsSort, isNewsTag } from '@/data/contracts/news';
import type { NewsCategory, NewsQuery, NewsSort, NewsTag } from '@/data/contracts/news';
import { getNewsArticle, listNews, listNewsTagCounts } from '@/data/db/newsData';
import { mockDelay, mockError, toMockResponse } from '@/data/mocks/mockControl';

/**
 * 资讯接口（公开内容，不需要登录）。
 *
 * 标签用重复参数传递（`?tags=version&tags=balance`），语义是「同时满足」——
 * 多选标签的直觉就是缩小范围，而不是并集。
 */
function readTags(params: URLSearchParams): NewsTag[] {
  return params
    .getAll('tags')
    .map((raw) => raw.trim())
    .filter((raw): raw is NewsTag => isNewsTag(raw));
}

function readCategory(raw: string | null): NewsCategory | undefined {
  return isNewsCategory(raw) ? raw : undefined;
}

function readSort(raw: string | null): NewsSort | undefined {
  return isNewsSort(raw) ? raw : undefined;
}

function readQuery(request: Request): NewsQuery {
  const params = new URL(request.url).searchParams;

  return {
    category: readCategory(params.get('category')),
    tags: readTags(params),
    search: params.get('search') ?? undefined,
    sort: readSort(params.get('sort')),
    page: Number(params.get('page') ?? '1') || 1,
  };
}

export const newsHandlers = [
  http.get(API_PATHS.news.articles, async ({ request }) => {
    try {
      mockError();
      await mockDelay();

      return HttpResponse.json(await listNews(readQuery(request)));
    } catch (error) {
      return toMockResponse(error);
    }
  }),

  http.get(API_PATHS.news.tags, async () => {
    try {
      mockError();
      await mockDelay();

      return HttpResponse.json(await listNewsTagCounts());
    } catch (error) {
      return toMockResponse(error);
    }
  }),

  http.get(API_PATHS.news.article, async ({ params }) => {
    try {
      mockError();
      await mockDelay();

      const id = typeof params.newsId === 'string' ? params.newsId : '';
      return HttpResponse.json(await getNewsArticle(id));
    } catch (error) {
      return toMockResponse(error);
    }
  }),
];
