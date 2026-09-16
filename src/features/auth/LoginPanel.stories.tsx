import type { Meta, StoryObj } from '@storybook/react-vite';

import { SessionHarness } from '../../../.storybook/harnesses';
import { LoginPanel } from '@/features/auth/LoginPanel';

/**
 * 注册 / 登录面板。
 * 校验规则与 mock 后端共用同一份（data/contracts/user.ts），
 * 因此「前端说没问题、后端 400」这种割裂不会出现。
 */
const meta = {
  title: '业务组件/LoginPanel',
  component: LoginPanel,
  tags: ['autodocs'],
  parameters: {
    demo: { state: { enabled: true, role: 'guest' } },
  },
} satisfies Meta<typeof LoginPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LoginMode: Story = { name: '登录（默认）' };

export const RegisterMode: Story = {
  name: '注册表单',
  args: { initialMode: 'register' },
};

export const AlreadyLoggedIn: Story = {
  name: '已登录（入口收敛）',
  render: () => (
    <SessionHarness>
      <LoginPanel />
    </SessionHarness>
  ),
};

export const Offline: Story = {
  name: '断网（提交会统一失败）',
  parameters: { demo: { state: { enabled: true, role: 'guest', uiState: 'offline' } } },
};

export const HighContrast: Story = {
  name: '高对比主题',
  globals: { theme: 'contrast' },
};
