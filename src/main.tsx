import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import { AppProviders } from '@/app/providers';
import { router } from '@/app/router';
import { RENDER_FUTURE_FLAGS } from '@/app/routerOptions';
import { RouteFallback } from '@/components/ui/RouteFallback';
import { DEFAULT_DEMO_STATE } from '@/demo/types';
import { readDemoStateFromUrl } from '@/demo/urlState';

import '@/styles/tokens.css';
import '@/styles/globals.css';
import '@/styles/demo.css';

const container = document.getElementById('root');

if (container === null) {
  throw new Error('挂载失败：index.html 中缺少 #root 容器');
}

const rootElement = container;

/**
 * 启动顺序（每一步都有理由）：
 * 1. 先起 MSW —— 本项目没有后端，晚一步首屏请求就会漏拦截；
 * 2. 仅在**首次访问**时动态加载种子模块并播种 ——
 *    种子依赖 faker，那是几百 KB，不该让老用户每次刷新都下载；
 * 3. 最后挂载 React。
 */
async function bootstrap(): Promise<void> {
  const [{ worker }, { isDataInitialized }] = await Promise.all([
    import('@/data/mocks/browser'),
    import('@/data/db/dataFlags'),
  ]);

  try {
    await worker.start({ onUnhandledRequest: 'bypass', quiet: true });
  } catch (error) {
    // worker 起不来（例如 service worker 被禁用）不应该导致白屏：
    // 页面照常渲染，只是所有数据请求会失败并走统一错误态。
    console.error('[demo] MSW worker 启动失败，数据请求将直接失败', error);
  }

  if (!isDataInitialized()) {
    const { ensureFirstRunSeed } = await import('@/data/db/demoData');
    const initialState = readDemoStateFromUrl(window.location.search, DEFAULT_DEMO_STATE);
    await ensureFirstRunSeed(initialState.seed);
  }

  createRoot(rootElement).render(
    <StrictMode>
      <AppProviders>
        {/* fallbackElement 负责首屏等待懒加载路由模块时的占位 */}
        <RouterProvider
          router={router}
          fallbackElement={<RouteFallback />}
          future={RENDER_FUTURE_FLAGS}
        />
      </AppProviders>
    </StrictMode>,
  );
}

void bootstrap();
