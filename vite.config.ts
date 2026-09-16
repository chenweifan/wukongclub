import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

/**
 * 用 vitest/config 的 defineConfig：让同一份配置同时携带 Vite 与 Vitest 的类型，
 * 避免额外维护一份 vitest.config.ts（两份配置的 alias 很容易漂移）。
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
    open: false,
  },
  optimizeDeps: {
    /**
     * 默认的依赖扫描入口是 `**\/*.html`，会把构建产物 storybook-static/ 一起扫进来，
     * 进而尝试解析 Storybook 自己的 chunk（其中引用了本仓库没有的 @emotion/is-prop-valid），
     * 在 dev 启动日志里刷出「could not be resolved」错误。
     * 只把真正的应用入口交给预构建，问题消失且启动更快。
     */
    entries: ['index.html'],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2022',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    css: false,
    restoreMocks: true,
  },
});
