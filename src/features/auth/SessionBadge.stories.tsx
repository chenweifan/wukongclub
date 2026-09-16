import type { Meta, StoryObj } from '@storybook/react-vite';

import { SessionHarness } from '../../../.storybook/harnesses';
import { SessionBadge } from '@/features/auth/SessionBadge';

/**
 * 顶栏会话入口：未登录 → 登录链接；已登录 → 印章头像 + 未读红点 + 退出。
 * 未读数复用消息中心的同一份 Query 缓存，因此标记已读后红点会立刻消失。
 */
const meta = {
  title: '业务组件/SessionBadge',
  component: SessionBadge,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '演示模式下切换身份会同步登录态：访客/封禁 = 未登录，其余身份 = 演示账号已登录。',
      },
    },
  },
} satisfies Meta<typeof SessionBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Anonymous: Story = {
  name: '未登录',
  parameters: { demo: { state: { enabled: true, role: 'guest' } } },
};

export const Authenticated: Story = {
  name: '已登录（含未读红点）',
  render: () => (
    <SessionHarness>
      <SessionBadge />
    </SessionHarness>
  ),
};

export const HighContrast: Story = {
  name: '高对比主题',
  globals: { theme: 'contrast' },
  render: () => (
    <SessionHarness>
      <SessionBadge />
    </SessionHarness>
  ),
};
