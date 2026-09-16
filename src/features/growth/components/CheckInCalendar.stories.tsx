import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { CheckInCalendar } from '@/features/growth/components/CheckInCalendar';
import { buildCalendar } from '@/utils/checkInRules';

const NOW = new Date('2026-02-14T09:00:00.000Z');

/** 造一段「最近 6 天连续、更早稀疏」的历史，日历的两种形态就都有了。 */
function history(checkedTail: number): { date: string }[] {
  const cells = buildCalendar([], NOW);
  return cells
    .filter((_, index) => index >= cells.length - checkedTail || index % 3 === 0)
    .map((cell) => ({ date: cell.date }));
}

function Harness({ checkedTail }: { checkedTail: number }) {
  const [records] = useState(() => history(checkedTail));
  return (
    <div className="max-w-md">
      <CheckInCalendar cells={buildCalendar(records, NOW)} />
    </div>
  );
}

/**
 * 近 30 天签到日历（10/15 列滚动窗口）。
 * 视觉上只显示日号，完整描述放在 sr-only 里 —— 30 个「已上香」会把版面撑爆。
 */
const meta = {
  title: '业务组件/CheckInCalendar',
  component: CheckInCalendar,
  tags: ['autodocs'],
  args: { cells: buildCalendar(history(6), NOW) },
} satisfies Meta<typeof CheckInCalendar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithStreak: Story = {
  name: '有连续段',
  render: () => <Harness checkedTail={6} />,
};

export const AllChecked: Story = {
  name: '全勤',
  render: () => <Harness checkedTail={30} />,
};

export const Empty: Story = {
  name: '空数据（从未上香）',
  args: { cells: buildCalendar([], NOW) },
};

export const HighContrast: Story = {
  name: '高对比主题',
  globals: { theme: 'contrast' },
};
