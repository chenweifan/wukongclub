import { API_PATHS, fillPath } from '@/data/apiPaths';
import { isPaginatedOf } from '@/data/contracts/common';
import type { Paginated } from '@/data/contracts/common';
import { isNewsArticle, isNewsTagCountList } from '@/data/contracts/news';
import type { NewsArticle, NewsQuery, NewsTagCount } from '@/data/contracts/news';
import { HttpError } from '@/data/HttpError';
import { requestJson } from '@/data/httpClient';

/**
 * 资讯 Repository。
 * 标签走重复参数（tags=a&tags=b），与 handler 的解析约定一致。
 */
export interface NewsRepository {
  list(query: NewsQuery): Promise<Paginated<NewsArticle>>;
  detail(articleId: string): Promise<NewsArticle>;
  tagCounts(): Promise<readonly NewsTagCount[]>;
}

function buildListUrl(query: NewsQuery): string {
  const params = new URLSearchParams();

  if (query.category !== undefined) {
    params.set('category', query.category);
  }
  for (const tag of query.tags ?? []) {
    params.append('tags', tag);
  }
  if (query.search !== undefined && query.search.trim() !== '') {
    params.set('search', query.search.trim());
  }
  if (query.sort !== undefined) {
    params.set('sort', query.sort);
  }
  params.set('page', String(query.page ?? 1));

  return `${API_PATHS.news.articles}?${params.toString()}`;
}

function contractMismatch(what: string): HttpError {
  return new HttpError(500, `${what}响应不符合契约`, { code: 'CONTRACT_MISMATCH' });
}

export const newsRepo: NewsRepository = {
  async list(query) {
    const payload = await requestJson(buildListUrl(query));

    if (!isPaginatedOf(payload, isNewsArticle)) {
      throw contractMismatch('资讯列表');
    }

    return payload;
  },

  async detail(articleId) {
    const payload = await requestJson(fillPath(API_PATHS.news.article, { newsId: articleId }));

    if (!isNewsArticle(payload)) {
      throw contractMismatch('资讯详情');
    }

    return payload;
  },

  async tagCounts() {
    const payload = await requestJson(API_PATHS.news.tags);

    if (!isNewsTagCountList(payload)) {
      throw contractMismatch('资讯标签统计');
    }

    return payload;
  },
};
