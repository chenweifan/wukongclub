import type { DemoUiState } from '@/demo/types';

/**
 * StateBoundary 的渲染决策（协议 1.3）。
 *
 * 抽成纯函数的原因：这段判断有 6 × 3 + 空态组合，是阶段 1 最容易写错、
 * 也最难靠手点覆盖的逻辑；纯函数化之后可以用单测把所有组合钉死。
 */
export const BOUNDARY_VIEWS = ['loading', 'error', 'offline', 'empty', 'ready'] as const;

export type BoundaryView = (typeof BOUNDARY_VIEWS)[number];

export interface BoundaryViewInput {
  /** 演示控制台选定的界面状态。 */
  demoUiState: DemoUiState;
  /** 真实 React Query 状态。 */
  queryStatus: 'pending' | 'error' | 'success';
  /** 数据成功返回但业务上为空。 */
  isEmpty: boolean;
}

/**
 * 覆盖优先级：演示状态 > 真实查询状态。
 * `slow` 与 `normal` 走同一套回落逻辑 —— 「慢」由 mockDelay 注入的延迟体现，
 * 而不是靠 UI 假装一直转圈（那样会掩盖真实的加载逻辑）。
 */
export function resolveBoundaryView(input: BoundaryViewInput): BoundaryView {
  const { demoUiState, queryStatus, isEmpty } = input;

  if (demoUiState === 'loading') {
    return 'loading';
  }
  if (demoUiState === 'error') {
    return 'error';
  }
  if (demoUiState === 'offline') {
    return 'offline';
  }
  if (demoUiState === 'empty') {
    return 'empty';
  }

  if (queryStatus === 'pending') {
    return 'loading';
  }
  if (queryStatus === 'error') {
    return 'error';
  }

  return isEmpty ? 'empty' : 'ready';
}
