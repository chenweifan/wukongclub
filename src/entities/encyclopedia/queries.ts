import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { encyclopediaRepo } from '@/data/repositories';
import type { WikiQuery } from '@/data/contracts/encyclopedia';
import { useDemoStore } from '@/demo/demoStore';

/**
 * 影神图查询定义。
 *
 * 列表的 Query key 里带上完整查询条件：筛选/搜索/排序变化即视为不同数据，
 * 这样 React Query 自带的缓存就能直接服务「返回上一组筛选」这种操作。
 * 剧透开关也进 key —— 它确实会改变服务端返回的内容，不该复用旧缓存。
 */
export const WIKI_QUERY_KEYS = {
  list: (query: WikiQuery, spoiler: boolean) => ['wiki', 'list', query, spoiler] as const,
  detail: (entryId: string) => ['wiki', 'detail', entryId] as const,
  graph: (entryId: string) => ['wiki', 'graph', entryId] as const,
  favorites: ['wiki', 'favorites'] as const,
};

export function useWikiListQuery(query: WikiQuery) {
  const spoiler = useDemoStore((state) => state.spoiler);

  return useQuery({
    queryKey: WIKI_QUERY_KEYS.list(query, spoiler),
    queryFn: () => encyclopediaRepo.list({ ...query, includeSpoilers: spoiler }),
  });
}

export function useWikiDetailQuery(entryId: string | null) {
  return useQuery({
    queryKey: WIKI_QUERY_KEYS.detail(entryId ?? 'none'),
    queryFn: () => encyclopediaRepo.detail(entryId ?? ''),
    enabled: entryId !== null,
  });
}

export function useWikiGraphQuery(entryId: string | null) {
  return useQuery({
    queryKey: WIKI_QUERY_KEYS.graph(entryId ?? 'none'),
    queryFn: () => encyclopediaRepo.graph(entryId ?? ''),
    enabled: entryId !== null,
  });
}

export function useFavoriteIdsQuery() {
  return useQuery({
    queryKey: WIKI_QUERY_KEYS.favorites,
    queryFn: () => encyclopediaRepo.favoriteIds(),
  });
}

/**
 * 收藏切换：成功后直接用服务端返回的完整 id 列表覆盖缓存，
 * 而不是本地猜一个再等失效重拉 —— 收藏是「设备/账号二象性」的数据，
 * 服务端才是唯一的权威。
 */
export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entryId: string) => encyclopediaRepo.toggleFavorite(entryId),
    onSuccess: (state) => {
      queryClient.setQueryData(WIKI_QUERY_KEYS.favorites, state.ids);
    },
  });
}
