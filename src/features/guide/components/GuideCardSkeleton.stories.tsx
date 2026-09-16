import type { Meta, StoryObj } from '@storybook/react-vite';

import { GuideCardSkeleton } from '@/features/guide/components/GuideCardSkeleton';

/**
 * 攻略列表骨架屏（StateBoundary 的 `loading` slot）。
 *
 * 它不是「转圈的替代品」：按卡片真实结构（封面 + 标题 + 元信息 + 摘要 + 标签 + 操作区）
 * 搭骨架，数据到位时版面不会跳一下。读屏只会念一次「攻略加载中」，方块本身 aria-hidden。
 */
const meta = {
  title: '业务组件/GuideCardSkeleton',
  component: GuideCardSkeleton,
  tags: ['autodocs'],
  args: { count: 6 },
  decorators: [
    (Story) => (
      <div className="bg-bg p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GuideCardSkeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleCard: Story = {
  name: '单张骨架',
  args: { count: 1 },
};

export const ZeroSanitized: Story = {
  name: '非法数量（0 也至少渲染一张）',
  args: { count: 0 },
};

export const HighContrast: Story = {
  name: '高对比主题',
  globals: { theme: 'contrast' },
  args: { count: 3 },
};
