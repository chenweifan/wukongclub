import type { Meta, StoryObj } from '@storybook/react-vite';

import { RouteFallback } from '@/components/ui/RouteFallback';

/**
 * 路由级加载态（首屏等待懒加载 chunk 时的占位）。
 * 它本身就是 loading 形态，因此只覆盖 default 与无标签两个变体。
 */
const meta = {
  title: '基础组件/RouteFallback',
  component: RouteFallback,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '作为 RouterProvider 的 fallbackElement 使用；页面内部的异步态由 StateBoundary 负责，两者不要混用。',
      },
    },
  },
} satisfies Meta<typeof RouteFallback>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OnPaperTheme: Story = {
  name: '宣纸主题',
  globals: { theme: 'paper' },
};

export const HighContrast: Story = {
  name: '高对比主题',
  globals: { theme: 'contrast' },
};
