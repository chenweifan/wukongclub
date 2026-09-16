import type { Meta, StoryObj } from '@storybook/react-vite';

import { UnofficialDisclaimer } from '@/components/business/UnofficialDisclaimer';

/**
 * 非官方声明与版权说明（协议自检项：含非官方声明与剧透提示）。
 * 它由三个布局统一渲染，因此任何 story 的截图里都应该能看到这段文字。
 */
const meta = {
  title: '业务组件/UnofficialDisclaimer',
  component: UnofficialDisclaimer,
  tags: ['autodocs'],
  args: { variant: 'full' },
} satisfies Meta<typeof UnofficialDisclaimer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Full: Story = { name: '完整（前台页脚）' };

export const Compact: Story = {
  name: '精简（后台/空白布局）',
  args: { variant: 'compact' },
};

export const OnPaperTheme: Story = {
  name: '宣纸主题',
  globals: { theme: 'paper' },
};
