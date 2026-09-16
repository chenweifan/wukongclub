import type { Preview } from '@storybook/react-vite';

import { THEMES } from '@/app/theme';
import { COPY } from '@/utils/copy';

import { withDemoState, withMockBackend, withProviders, withTheme } from './decorators';

// 与 main.tsx 同一套样式入口：story 里看到的令牌、噪点、引导样式都与应用一致
import '@/styles/tokens.css';
import '@/styles/globals.css';
import '@/styles/demo.css';

/**
 * 全局预览配置。
 * 装饰器顺序 = 外层到内层：Providers（Query/主题/路由）
 * → 主题工具栏 → 演示状态参数 → Mock 后端 → Story。
 */
const preview: Preview = {
  decorators: [withProviders, withTheme, withDemoState, withMockBackend],

  initialGlobals: {
    theme: 'ink',
  },

  globalTypes: {
    theme: {
      description: '三套主题共用一套设计令牌',
      toolbar: {
        icon: 'paintbrush',
        title: '主题',
        items: THEMES.map((theme) => ({ value: theme, title: COPY.theme[theme] })),
        dynamicTitle: true,
      },
    },
  },

  parameters: {
    layout: 'padded',
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    options: {
      storySort: {
        order: ['基础组件', '演示系统', '业务组件', '*'],
      },
    },
  },
};

export default preview;
