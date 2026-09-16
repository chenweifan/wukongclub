import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { GuideQuery } from '@/data/contracts/guide';
import { guideRepo } from '@/data/repositories';

/**
 * 攻略查询定义。
 * 点赞与影神图收藏同一套模式：服务端返回权威的计数与完整 id 列表，
 * 前端直接覆盖缓存，不做本地推算。
 */
export const GUIDE_QUERY_KEYS = {
  list: (query: GuideQuery) => ['guide', 'list', query] as const,
  counts: ['guide', 'counts'] as const,
  liked: ['guide', 'liked'] as const,
};

export function useGuideListQuery(query: GuideQuery) {
  return useQuery({
    queryKey: GUIDE_QUERY_KEYS.list(query),
    queryFn: () => guideRepo.list(query),
  });
}

/** 分类角标用：统计全量数据，不随筛选变化。 */
export function useGuideKindCountsQuery() {
  return useQuery({
    queryKey: GUIDE_QUERY_KEYS.counts,
    queryFn: () => guideRepo.kindCounts(),
  });
}

export function useLikedGuideIdsQuery() {
  return useQuery({
    queryKey: GUIDE_QUERY_KEYS.liked,
    queryFn: () => guideRepo.likedIds(),
  });
}

export function useToggleGuideLikeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (guideId: string) => guideRepo.toggleLike(guideId),
    onSuccess: (state) => {
      queryClient.setQueryData(GUIDE_QUERY_KEYS.liked, state.ids);
      // 计数落在攻略记录上，列表里的数字也要跟着刷新
      void queryClient.invalidateQueries({ queryKey: ['guide', 'list'] });
    },
  });
}
