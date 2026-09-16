import type { Meta, StoryObj } from '@storybook/react-vite';

import { GrowthHarness } from '../../../../.storybook/harnesses';
import { CheckInPanel } from '@/features/growth/components/CheckInPanel';

/**
 * 土地庙上香面板。
 *
 * 数据来自真实链路：harness 先以演示账号登录（拿令牌），
 * 再让 mock 后端种上 42 天签到历史，面板自己用 useQuery 取回来。
 * 「今日已上香 / 未上香」取决于种子里的最后一天，因此每个 story 都是确定的。
 */
const meta = {
  title: '业务组件/CheckInPanel',
  component: CheckInPanel,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '同一天只能签到一次由服务端按日期键保证；前端的按钮禁用只是体验优化，重复点击会拿到 409。',
      },
    },
  },
} satisfies Meta<typeof CheckInPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <GrowthHarness>
      <CheckInPanel />
    </GrowthHarness>
  ),
};

export const OfflineOverride: Story = {
  name: '断网（统一错误态 + 重试）',
  render: () => (
    <GrowthHarness>
      <CheckInPanel />
    </GrowthHarness>
  ),
  parameters: { demo: { state: { enabled: true, uiState: 'offline' } } },
};

export const LoadingOverride: Story = {
  name: '加载中（演示状态覆盖）',
  render: () => (
    <GrowthHarness>
      <CheckInPanel />
    </GrowthHarness>
  ),
  parameters: { demo: { state: { enabled: true, uiState: 'loading' } } },
};

export const HighContrast: Story = {
  name: '高对比主题',
  globals: { theme: 'contrast' },
  render: () => (
    <GrowthHarness>
      <CheckInPanel />
    </GrowthHarness>
  ),
};
