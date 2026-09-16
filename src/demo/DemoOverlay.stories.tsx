import type { Meta, StoryObj } from '@storybook/react-vite';

import { DemoOverlay } from '@/demo/DemoOverlay';

/**
 * 演示浮层集合（提示条 + 控制台 + 栅格 + 性能面板 + 引导运行器）。
 * 它是 RootShell 里按需加载的那一块，story 用来确认「哪几个开关组合出什么画面」。
 */
const meta = {
  title: '演示系统/DemoOverlay',
  component: DemoOverlay,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'tour 参数在 URL 上时由这里的 useTourRunner 启动引导；story 里通过 demo.state.tour 也能触发。',
      },
    },
  },
} satisfies Meta<typeof DemoOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ConsoleOpen: Story = {
  name: '提示条 + 控制台',
  parameters: { demo: { state: { enabled: true }, ui: { consoleOpen: true } } },
};

export const AllToolsOn: Story = {
  name: '工具全开（栅格 + 性能面板 + 控制台）',
  parameters: {
    demo: {
      state: { enabled: true, grid: true },
      ui: { consoleOpen: true, perfPanel: true, outline: true },
    },
  },
};

export const CleanMode: Story = {
  name: '截图模式（整块不渲染）',
  parameters: { demo: { state: { enabled: true, clean: true }, ui: { consoleOpen: true } } },
};

export const ScenarioLike: Story = {
  name: '场景态（断网 + 高对比 + 栅格）',
  globals: { theme: 'contrast' },
  parameters: {
    demo: {
      state: { enabled: true, role: 'banned', uiState: 'offline', grid: true, spoiler: true },
      ui: { consoleOpen: true },
    },
  },
};
