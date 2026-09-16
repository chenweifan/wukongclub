import type { Meta, StoryObj } from '@storybook/react-vite';

import { GrowthHarness } from '../../../../.storybook/harnesses';
import { NotificationCenter } from '@/features/growth/components/NotificationCenter';

/**
 * 消息中心：分类筛选 + 仅未读 + 全部已读。
 * 种子里前四条未读，因此红点、仅未读筛选、全部已读按钮都有真实内容可验收。
 */
const meta = {
  title: '业务组件/NotificationCenter',
  component: NotificationCenter,
  tags: ['autodocs'],
} satisfies Meta<typeof NotificationCenter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <GrowthHarness>
      <NotificationCenter />
    </GrowthHarness>
  ),
};

export const FreshUser: Story = {
  name: '新用户（只有一条欢迎消息）',
  render: () => (
    <GrowthHarness prep="fresh">
      <NotificationCenter />
    </GrowthHarness>
  ),
};

export const OfflineOverride: Story = {
  name: '断网（统一错误态 + 重试）',
  render: () => (
    <GrowthHarness>
      <NotificationCenter />
    </GrowthHarness>
  ),
  parameters: { demo: { state: { enabled: true, uiState: 'offline' } } },
};

export const HighContrast: Story = {
  name: '高对比主题',
  globals: { theme: 'contrast' },
  render: () => (
    <GrowthHarness>
      <NotificationCenter />
    </GrowthHarness>
  ),
};
