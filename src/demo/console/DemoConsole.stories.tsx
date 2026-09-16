import type { Meta, StoryObj } from '@storybook/react-vite';

import { DemoConsole } from '@/demo/console/DemoConsole';

/**
 * 演示控制台整体。
 * 两个必要条件都在 parameters 里给足：enabled=true 才会渲染，
 * consoleOpen=true 才会展开面板（否则只看到葫芦按钮）。
 */
const meta = {
  title: '演示系统/DemoConsole',
  component: DemoConsole,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    demo: { state: { enabled: true, role: 'active' }, ui: { consoleOpen: true } },
    docs: {
      description: {
        component:
          '八个分区：身份 / 界面状态 / 主题 / 剧透 / 数据 / 引导 / 场景 / 工具。所有开关都会写回 URL。',
      },
    },
  },
} satisfies Meta<typeof DemoConsole>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = { name: '展开' };

export const Collapsed: Story = {
  name: '仅葫芦按钮',
  parameters: { demo: { state: { enabled: true }, ui: { consoleOpen: false } } },
};

export const AdminRole: Story = {
  name: '管理员身份',
  parameters: { demo: { state: { enabled: true, role: 'admin' }, ui: { consoleOpen: true } } },
};

export const OfflineState: Story = {
  name: '断网 + 高对比',
  globals: { theme: 'contrast' },
  parameters: {
    demo: {
      state: { enabled: true, uiState: 'offline', role: 'banned' },
      ui: { consoleOpen: true },
    },
  },
};

export const CleanMode: Story = {
  name: '截图模式（clean=1，不渲染）',
  parameters: { demo: { state: { enabled: true, clean: true }, ui: { consoleOpen: true } } },
};

export const DisabledOutsideDemo: Story = {
  name: '未进入演示模式',
  parameters: { demo: { state: { enabled: false }, ui: { consoleOpen: false } } },
};
