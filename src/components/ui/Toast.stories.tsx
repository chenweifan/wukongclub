import type { Meta, StoryObj } from '@storybook/react-vite';

import { ToastHost } from '@/components/ui/Toast';
import { useToastStore } from '@/stores/toastStore';
import type { ToastItem } from '@/stores/toastStore';

/**
 * 全局提示宿主。
 * 直接写入 store 而不是靠点击触发 —— 首帧就是目标状态，截图与视觉回归才稳定。
 */
const meta = {
  title: '基础组件/ToastHost',
  component: ToastHost,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'aria-live="polite" 的 status 区域；danger 档额外带 role="alert"。演示模式拦截外链、破坏性操作回执都走它。',
      },
    },
  },
} satisfies Meta<typeof ToastHost>;

export default meta;

type Story = StoryObj<typeof meta>;

function ToastPreview({ items }: { items: readonly ToastItem[] }) {
  useToastStore.setState({ items });
  return <ToastHost />;
}

export const Info: Story = {
  name: '信息',
  render: () => <ToastPreview items={[{ id: 't1', message: '剧透内容已显示', tone: 'info' }]} />,
};

export const Success: Story = {
  name: '成功',
  render: () => (
    <ToastPreview items={[{ id: 't1', message: '已写入 12 条演示数据', tone: 'success' }]} />
  ),
};

export const Danger: Story = {
  name: '失败（role=alert）',
  render: () => (
    <ToastPreview items={[{ id: 't1', message: '勾选失败：网络已断开', tone: 'danger' }]} />
  ),
};

export const Stacked: Story = {
  name: '多条堆叠（上限 4 条）',
  render: () => (
    <ToastPreview
      items={[
        { id: 't1', message: '演示链接已复制，换台机器打开也是同一状态', tone: 'success' },
        { id: 't2', message: '演示模式已拦截外链跳转：github.com', tone: 'info' },
        {
          id: 't3',
          message: '快照导入完成：60 条数据库记录、3 个本地存储键已还原',
          tone: 'success',
        },
        { id: 't4', message: '灵蕴紊乱', tone: 'danger' },
      ]}
    />
  ),
};

export const LongText: Story = {
  name: '极端长文本',
  render: () => (
    <ToastPreview
      items={[
        {
          id: 't1',
          message: `导出失败：${'容器配额超限，请先清理本地数据后重试。'.repeat(8)}`,
          tone: 'danger',
        },
      ]}
    />
  ),
};
