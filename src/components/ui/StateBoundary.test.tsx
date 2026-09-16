import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { StateBoundary } from '@/components/ui/StateBoundary';
import type { BoundaryQuery } from '@/components/ui/StateBoundary';
import { HttpError } from '@/data/HttpError';
import { useDemoStore } from '@/demo/demoStore';

/**
 * StateBoundary 的行为验证（协议 1.3 + 验收「offline 下展示统一错误态与重试按钮」）。
 *
 * 直接构造 BoundaryQuery 的五个字段即可 —— 该接口是刻意收窄的，
 * 因此这里不需要任何类型断言，也不依赖真实的 useQuery 时序。
 */
function successQuery(data: number[], refetch: () => unknown = vi.fn()): BoundaryQuery<number[]> {
  return { status: 'success', data, error: null, isFetching: false, refetch };
}

function pendingQuery(): BoundaryQuery<number[]> {
  return { status: 'pending', data: undefined, error: null, isFetching: true, refetch: vi.fn() };
}

function errorQuery(error: Error): BoundaryQuery<number[]> {
  return { status: 'error', data: undefined, error, isFetching: false, refetch: vi.fn() };
}

function renderBoundary(
  query: BoundaryQuery<number[]>,
  options: { isEmpty?: (data: number[]) => boolean } = {},
) {
  return render(
    <StateBoundary query={query} isEmpty={options.isEmpty} label="测试区域">
      {(data) => <p>数据条数：{data.length}</p>}
    </StateBoundary>,
  );
}

describe('StateBoundary', () => {
  beforeEach(() => {
    useDemoStore.getState().reset();
  });

  it('normal + 成功：渲染 children 并传入 data', () => {
    renderBoundary(successQuery([1, 2, 3]));

    expect(screen.getByText('数据条数：3')).toBeInTheDocument();
  });

  it('normal + 空结果：渲染统一空态（由 isEmpty 判定）', () => {
    renderBoundary(successQuery([]), { isEmpty: (data) => data.length === 0 });

    expect(screen.getByRole('status')).toHaveTextContent('此处空空如也');
  });

  it('normal + pending：渲染骨架屏（role=status，含无障碍文案）', () => {
    renderBoundary(pendingQuery());

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('灵蕴汇聚中…')).toBeInTheDocument();
  });

  it('normal + 失败：渲染错误态、展示服务端文案，重试会触发 refetch', () => {
    const refetch = vi.fn();
    renderBoundary({ ...errorQuery(new HttpError(500, '灵蕴紊乱')), refetch });

    expect(screen.getByRole('alert')).toHaveTextContent('灵蕴紊乱');

    screen.getByRole('button', { name: '重试' }).click();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('演示状态 offline：即使查询已成功，也渲染断网态 + 可用的重试按钮', () => {
    useDemoStore.getState().patch({ uiState: 'offline' });
    const refetch = vi.fn();

    renderBoundary(successQuery([1, 2, 3], refetch));

    expect(screen.queryByText('数据条数：3')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('网络已断开');

    screen.getByRole('button', { name: '重试' }).click();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('演示状态 error / empty / loading 分别覆盖成功结果', () => {
    useDemoStore.getState().patch({ uiState: 'error' });
    const first = renderBoundary(successQuery([1]));
    expect(screen.getByRole('alert')).toHaveTextContent('灵蕴紊乱');
    first.unmount();

    useDemoStore.getState().patch({ uiState: 'empty' });
    const second = renderBoundary(successQuery([1]));
    expect(screen.getByRole('status')).toHaveTextContent('此处空空如也');
    second.unmount();

    useDemoStore.getState().patch({ uiState: 'loading' });
    renderBoundary(successQuery([1]));
    expect(screen.queryByText('数据条数：1')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('自定义 slot 优先于默认实现', () => {
    useDemoStore.getState().patch({ uiState: 'offline' });

    render(
      <StateBoundary query={successQuery([1])} offline={<p>自定义断网提示</p>} label="自定义区域">
        {(data) => <p>{data.length}</p>}
      </StateBoundary>,
    );

    expect(screen.getByText('自定义断网提示')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('空态支持自定义标题与操作按钮（探针面板用它给出「填满数据」的出口）', () => {
    render(
      <StateBoundary
        query={successQuery([])}
        isEmpty={(data) => data.length === 0}
        emptyTitle="没有探针"
        emptyAction={<button type="button">填满</button>}
        label="自定义空态"
      >
        {(data) => <p>{data.length}</p>}
      </StateBoundary>,
    );

    expect(screen.getByText('没有探针')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '填满' })).toBeInTheDocument();
    // 自定义空态不再出现默认重试按钮
    expect(screen.queryByRole('button', { name: '重试' })).not.toBeInTheDocument();
  });
});
