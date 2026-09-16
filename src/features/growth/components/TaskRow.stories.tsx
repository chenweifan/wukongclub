import type { Meta, StoryObj } from '@storybook/react-vite';

import { TaskRow } from '@/features/growth/components/TaskRow';
import type { TaskItem } from '@/data/contracts/growth';

const baseTask: TaskItem = {
  id: 'task-story',
  kind: 'daily',
  title: '土地庙上香',
  description: '每日到土地庙上一炷香，续上连续天数。',
  progress: 0,
  target: 1,
  reward: 10,
  status: 'active',
  expiresAt: null,
};

/**
 * 单条任务：进行中 / 可领取 / 已领取 / 隐藏成就 / 极端长文本。
 * 状态用进度条 + 按钮文案 + 按钮可用性三重表达，不只靠颜色。
 */
const meta = {
  title: '业务组件/TaskRow',
  component: TaskRow,
  tags: ['autodocs'],
  args: { task: baseTask, onClaim: () => undefined },
} satisfies Meta<typeof TaskRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Active: Story = { name: '进行中' };

export const Claimable: Story = {
  name: '可领取',
  args: { task: { ...baseTask, progress: 1, status: 'claimable' } },
};

export const Claimed: Story = {
  name: '已领取',
  args: { task: { ...baseTask, progress: 1, status: 'claimed' } },
};

export const WeeklyWithDeadline: Story = {
  name: '周常（带截止时间）',
  args: {
    task: {
      ...baseTask,
      id: 'task-weekly',
      kind: 'weekly',
      title: '本周上香五日',
      description: '本周累计签到五天，土地公记得你。',
      progress: 3,
      target: 5,
      reward: 80,
      expiresAt: '2026-02-15T23:59:59.000Z',
    },
  },
};

export const HiddenAchievement: Story = {
  name: '隐藏成就',
  args: {
    task: {
      ...baseTask,
      id: 'task-hidden',
      kind: 'hidden',
      title: '不杀一人',
      description: '隐藏成就：一整章不取一条性命。',
      target: 1,
      reward: 120,
    },
  },
};

export const Claiming: Story = {
  name: '领取中（按钮禁用）',
  args: { task: { ...baseTask, progress: 1, status: 'claimable' }, isClaiming: true },
};

export const LongText: Story = {
  name: '极端长文本',
  args: {
    task: {
      ...baseTask,
      title: '在黄风岭不借助定风珠、不使用任何法术道具、且全程不落地的条件下完成一次追击',
      description: '这是一段刻意写得很长的任务说明，用来检查布局在极端文案下是否依然稳定：'.repeat(
        5,
      ),
      progress: 2,
      target: 7,
    },
  },
};
