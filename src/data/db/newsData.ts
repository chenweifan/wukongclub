import { toPaginated } from '@/data/contracts/common';
import type { Paginated } from '@/data/contracts/common';
import type { NewsArticle, NewsQuery, NewsTagCount } from '@/data/contracts/news';
import { hmwDb } from '@/data/db/hmwDb';
import { HttpError } from '@/data/HttpError';
import { createNewsSeed } from '@/data/seeds/news.seed';
import { applyNewsQuery, collectTagCounts } from '@/utils/newsRules';

/**
 * 资讯的数据操作（mock 后端的「资讯服务」）。
 * 与影神图一致：筛选、排序、分页都在这一侧完成，前端只发查询参数。
 */

export const NEWS_PAGE_SIZE = 12;

export async function readAllNews(): Promise<NewsArticle[]> {
  return hmwDb.newsArticles.toArray();
}

export async function listNews(query: NewsQuery): Promise<Paginated<NewsArticle>> {
  const articles = await readAllNews();
  const matched = applyNewsQuery(articles, query);

  return toPaginated(matched, query.page ?? 1, query.pageSize ?? NEWS_PAGE_SIZE);
}

export async function getNewsArticle(id: string): Promise<NewsArticle> {
  const article = await hmwDb.newsArticles.get(id);

  if (article === undefined) {
    throw new HttpError(404, '资讯不存在', { code: 'NEWS_NOT_FOUND' });
  }

  return article;
}

/** 标签统计只针对全量数据（不是当前筛选结果），否则角标会互相吞掉。 */
export async function listNewsTagCounts(): Promise<NewsTagCount[]> {
  return collectTagCounts(await readAllNews());
}

/** 幂等写入（清表后写入整份种子）。 */
export async function seedNewsArticles(now: Date = new Date()): Promise<number> {
  const articles = createNewsSeed(now);

  await hmwDb.transaction('rw', hmwDb.newsArticles, async () => {
    await hmwDb.newsArticles.clear();
    await hmwDb.newsArticles.bulkPut(articles);
  });

  return articles.length;
}

export async function countNewsArticles(): Promise<number> {
  return hmwDb.newsArticles.count();
}

export async function clearNewsTable(): Promise<void> {
  await hmwDb.newsArticles.clear();
}
