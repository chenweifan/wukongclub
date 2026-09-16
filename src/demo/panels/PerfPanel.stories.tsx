import type { Meta, StoryObj } from '@storybook/react-vite';

import { PerfPanel } from '@/demo/panels/PerfPanel';

/**
 * 性能面板（帧率 / DOM 节点 / Query 缓存 / JS 堆）。
 * 数值每秒刷新一次，story 里等一秒即可看到真实读数；
 * story 本身也顺带验证了「rAF 循环在卸载时被正确取消」。
 */
const meta = {
  title: '演示系统/PerfPanel',
  component: PerfPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '定位是快速体检而不是 profiler：切主题、开栅格、跑引导时看它有没有异常抖动。',
      },
    },
  },
} satisfies Meta<typeof PerfPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HighContrast: Story = {
  name: '高对比主题',
  globals: { theme: 'contrast' },
};

export const PaperTheme: Story = {
  name: '宣纸主题',
  globals: { theme: 'paper' },
};
