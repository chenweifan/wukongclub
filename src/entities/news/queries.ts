import { useQuery } from '@tanstack/react-query';

import type { NewsQuery } from '@/data/contracts/news';
import { newsRepo } from '@/data/repositories';

/**
 * 资讯查询定义。
 * 列表 key 带上完整查询条件，因此「切回上一组筛选」会直接命中缓存。
 */
export const NEWS_QUERY_KEYS = {
  list: (query: NewsQuery) => ['news', 'list', query] as const,
  tagCounts: ['news', 'tags'] as const,
};

export function useNewsListQuery(query: NewsQuery) {
  return useQuery({
    queryKey: NEWS_QUERY_KEYS.list(query),
    queryFn: () => newsRepo.list(query),
  });
}

export function useNewsTagCountsQuery() {
  return useQuery({
    queryKey: NEWS_QUERY_KEYS.tagCounts,
    queryFn: () => newsRepo.tagCounts(),
  });
}
