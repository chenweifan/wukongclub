import type { Meta, StoryObj } from '@storybook/react-vite';

import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';

/**
 * 主题切换器（三套主题共用一个设计令牌层）。
 * 交互后 <html data-theme> 会立刻变化 —— 工具栏的主题选择与它写的是同一个状态源。
 */
const meta = {
  title: '基础组件/ThemeSwitcher',
  component: ThemeSwitcher,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '状态源是 demoStore.theme（协议把 theme 归入 DemoState），因此顶栏、控制台与 URL 三处永远一致。',
      },
    },
  },
} satisfies Meta<typeof ThemeSwitcher>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const PaperTheme: Story = {
  name: '宣纸主题下',
  globals: { theme: 'paper' },
};

export const HighContrast: Story = {
  name: '高对比主题下',
  globals: { theme: 'contrast' },
};
