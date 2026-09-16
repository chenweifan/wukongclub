import type { Meta, StoryObj } from '@storybook/react-vite';

import { DemoBanner } from '@/demo/console/DemoBanner';

/**
 * 顶部演示提示条。
 * clean=1 时它整条不渲染 —— 那条 story 用来证明「截图模式」确实干净。
 */
const meta = {
  title: '演示系统/DemoBanner',
  component: DemoBanner,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    demo: { state: { enabled: true, role: 'admin', uiState: 'normal' } },
    docs: {
      description: {
        component: '同时充当状态摘要：身份与界面状态一眼可见，不必展开控制台。',
      },
    },
  },
} satisfies Meta<typeof DemoBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OfflineState: Story = {
  name: '断网状态摘要',
  parameters: { demo: { state: { enabled: true, role: 'banned', uiState: 'offline' } } },
};

export const HiddenInCleanMode: Story = {
  name: '截图模式（clean=1，不渲染）',
  parameters: { demo: { state: { enabled: true, clean: true } } },
};

export const HighContrast: Story = {
  name: '高对比主题',
  globals: { theme: 'contrast' },
};
