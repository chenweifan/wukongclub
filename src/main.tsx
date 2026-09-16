import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import { AppProviders } from '@/app/providers';
import { router } from '@/app/router';
import { RENDER_FUTURE_FLAGS } from '@/app/routerOptions';
import { RouteFallback } from '@/components/ui/RouteFallback';

import '@/styles/tokens.css';
import '@/styles/globals.css';

const container = document.getElementById('root');

if (container === null) {
  throw new Error('挂载失败：index.html 中缺少 #root 容器');
}

createRoot(container).render(
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
