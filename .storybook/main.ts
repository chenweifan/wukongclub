import { fileURLToPath } from 'node:url';

import type { StorybookConfig } from '@storybook/react-vite';

/**
 * Storybook 配置（协议铁律 10：每个 UI 组件交付时附 story）。
 *
 * 说明：
 * - stories 与源码同目录（Component.stories.tsx），组件搬家时 story 跟着走；
 * - staticDirs 指向 public：MSW 的 mockServiceWorker.js 从这里提供，
 *   否则依赖数据的故事（探针面板、StateBoundary）拿不到 mock 后端；
 * - @storybook/react-vite 会自动合并项目根目录的 vite.config.ts，
 *   因此 `@ -> src` 别名与 Tailwind/PostCSS 链路都跟应用保持一致。
 */
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  staticDirs: ['../public'],
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    // 用 react-docgen 而非 typescript：我们对 props 都有显式 interface，
    // 不需要为了 docs 再跑一遍类型推断（构建更快）。
    reactDocgen: 'react-docgen',
  },
};

/** 供需要绝对路径的扩展使用（保留给后续 viteFinal 定制）。 */
export const projectRoot = fileURLToPath(new URL('..', import.meta.url));

export default config;
