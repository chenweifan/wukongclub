import { Suspense, lazy } from 'react';

import { Outlet } from 'react-router-dom';

import { ConfirmDialogHost } from '@/components/ui/ConfirmDialog';
import { ToastHost } from '@/components/ui/Toast';
import { useDemoStore } from '@/demo/demoStore';

/**
 * 演示浮层按需加载。
 *
 * 为什么值得拆：控制台要用 framer-motion、Radix、以及「重置/填满/快照」背后的
 * Dexie + faker。它们只服务于演示场景，不该压在首屏体积上。
 * 生产环境下只有带 demo=1 的链接才会下载这个 chunk；开发环境始终加载，便于调试。
 */
const DemoOverlay = lazy(async () => {
  const module = await import('@/demo/DemoOverlay');
  return { default: module.DemoOverlay };
});

/**
 * 应用外壳：路由出口 + 全局浮层（Toast / 二次确认 / 演示控制台）。
 *
 * 为什么不放在 AppProviders 里：引导需要跨页跳转（useNavigate），
 * 必须位于 Router 内部；把全局 UI 宿主统一收在这里，位置只有一个，不会散落。
 */
export function RootShell() {
  const enabled = useDemoStore((state) => state.enabled);
  const clean = useDemoStore((state) => state.clean);

  // 截图模式（clean）下演示浮层整块不渲染：既省掉一份渲染开销，也保证截图干净
  const shouldRenderDemo = (enabled && !clean) || import.meta.env.DEV;

  return (
    <>
      <Outlet />
      <ToastHost />
      <ConfirmDialogHost />
      {shouldRenderDemo ? (
        <Suspense fallback={null}>
          <DemoOverlay />
        </Suspense>
      ) : null}
    </>
  );
}
