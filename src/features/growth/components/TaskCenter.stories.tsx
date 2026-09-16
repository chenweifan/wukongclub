import type { Meta, StoryObj } from '@storybook/react-vite';

import { GrowthHarness } from '../../../../.storybook/harnesses';
import { TaskCenter } from '@/features/growth/components/TaskCenter';

/**
 * 任务中心：每日 / 周常 / 隐藏成就三个标签。
 * 种子数据里「翻阅三则资讯」已被领取、「土地庙上香」可领取，其余进行中，
 * 所以三个标签都有内容可看，标签上也会带可领取数量。
 */
const meta = {
  title: '业务组件/TaskCenter',
  component: TaskCenter,
  tags: ['autodocs'],
} satisfies Meta<typeof TaskCenter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <GrowthHarness>
      <TaskCenter />
    </GrowthHarness>
  ),
};

export const EmptyUser: Story = {
  name: '新注册用户（任务都是新的）',
  render: () => (
    <GrowthHarness prep="fresh">
      <TaskCenter />
    </GrowthHarness>
  ),
};

export const ErrorOverride: Story = {
  name: '错误（演示状态覆盖）',
  render: () => (
    <GrowthHarness>
      <TaskCenter />
    </GrowthHarness>
  ),
  parameters: { demo: { state: { enabled: true, uiState: 'error' } } },
};

export const EmptyOverride: Story = {
  name: '空数据（演示状态覆盖）',
  render: () => (
    <GrowthHarness>
      <TaskCenter />
    </GrowthHarness>
  ),
  parameters: { demo: { state: { enabled: true, uiState: 'empty' } } },
};
