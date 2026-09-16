import type { Meta, StoryObj } from '@storybook/react-vite';

import { ConsoleSection } from '@/demo/console/ConsoleSection';

/**
 * 控制台分区外壳（可折叠）。
 * 用原生 button + aria-expanded/aria-controls；展开态在 story 里固定住，
 * 否则每次截图都要先点一下。
 */
const meta = {
  title: '演示系统/ConsoleSection',
  component: ConsoleSection,
  tags: ['autodocs'],
  args: {
    title: '界面状态',
    hint: '统一覆盖所有异步 UI，StateBoundary 优先服从它',
    children: <p className="text-xs">（分区内容）</p>,
    defaultOpen: true,
  },
} satisfies Meta<typeof ConsoleSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = { name: '展开' };

export const Closed: Story = {
  name: '折叠',
  args: { defaultOpen: false },
};

export const NoHint: Story = {
  name: '无说明',
  args: { hint: undefined },
};

export const LongText: Story = {
  name: '极端长文本',
  args: {
    title: '身份与权限（含后台审核队列、批量操作与键盘快捷键）',
    hint: '这里是一段刻意写得很长的分区说明，用来检查换行、行高与折叠按钮的对齐是否依然稳。'.repeat(
      4,
    ),
  },
};
