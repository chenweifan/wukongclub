import type { Meta, StoryObj } from '@storybook/react-vite';

import { StateBoundary } from '@/components/ui/StateBoundary';
import type { BoundaryQuery, StateBoundaryProps } from '@/components/ui/StateBoundary';
import { HttpError } from '@/data/HttpError';

/**
 * 统一异步边界。story 直接构造查询结果的五种形态，
 * 不依赖真实请求时序 —— 这样每个渲染分支都有一张确定的快照。
 *
 * 泛型组件在 story 里必须显式实例化，否则 args 会被推断成 unknown。
 */
const readyItems = ['灵蕴·7号探针', '甲胄·12号探针', '丹药·3号探针'];

function query(overrides: Partial<BoundaryQuery<string[]>>): BoundaryQuery<string[]> {
  return {
    status: 'success',
    data: readyItems,
    error: null,
    isFetching: false,
    refetch: () => undefined,
    ...overrides,
  };
}

const meta: Meta<StateBoundaryProps<string[]>> = {
  title: '基础组件/StateBoundary',
  component: StateBoundary,
  tags: ['autodocs'],
  args: {
    query: query({}),
    isEmpty: (data: string[]) => data.length === 0,
    label: '演示列表',
    children: (data: string[]) => (
      <ul className="space-y-1 text-sm">
        {data.map((item) => (
          <li key={item} className="border-token border-line rounded-scroll border px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  parameters: {
    docs: {
      description: {
        component:
          '优先服从演示控制台的界面状态；normal / slow 时回落到真实查询状态。页面里禁止再散写 if (loading)。',
      },
    },
  },
};

export default meta;

type Story = StoryObj<StateBoundaryProps<string[]>>;

export const Ready: Story = { name: '正常（有数据）' };

export const Loading: Story = {
  name: '加载中（真实 pending）',
  args: { query: query({ status: 'pending', data: undefined, isFetching: true }) },
};

export const Empty: Story = {
  name: '空数据',
  args: { query: query({ data: [] }) },
};

export const Error: Story = {
  name: '错误（服务端 500）',
  args: {
    query: query({
      status: 'error',
      data: undefined,
      error: new HttpError(500, '灵蕴紊乱'),
    }),
  },
};

export const OfflineOverride: Story = {
  name: '断网（演示状态覆盖成功结果）',
  args: { query: query({}) },
  parameters: { demo: { state: { enabled: true, uiState: 'offline' } } },
};

export const LoadingOverride: Story = {
  name: '加载中（演示状态覆盖）',
  parameters: { demo: { state: { enabled: true, uiState: 'loading' } } },
};

export const EmptyOverride: Story = {
  name: '空数据（演示状态覆盖）',
  parameters: { demo: { state: { enabled: true, uiState: 'empty' } } },
};

export const LongErrorMessage: Story = {
  name: '极端长文本（错误信息）',
  args: {
    query: query({
      status: 'error',
      data: undefined,
      error: new HttpError(500, '灵蕴紊乱：'.repeat(200)),
    }),
  },
};

export const CustomSlots: Story = {
  name: '自定义 slot 优先',
  args: {
    query: query({}),
    offline: <p className="text-sm">业务方自定义的断网提示</p>,
  },
  parameters: { demo: { state: { enabled: true, uiState: 'offline' } } },
};
