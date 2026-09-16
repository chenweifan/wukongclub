import { createBrowserRouter } from 'react-router-dom';

import type { RouteObject } from 'react-router-dom';

import { AdminLayout } from '@/app/layouts/AdminLayout';
import { BlankLayout } from '@/app/layouts/BlankLayout';
import { MainLayout } from '@/app/layouts/MainLayout';
import { RequireRole } from '@/app/RequireRole';
import { RootShell } from '@/app/RootShell';
import { ROUTER_FUTURE_FLAGS, lazyPage } from '@/app/routerOptions';
import { RouteErrorPage } from '@/pages/not-found/RouteErrorPage';

/**
 * 路由表（react-router v6 Data Router，协议第五节 阶段 0 交付物 5）。
 *
 * 为什么用 route.lazy 而不是 React.lazy + Suspense：
 * 1. 页面可以继续用具名导出（协议第八节），无需 `.then(m => ({ default: m.X }))` 包装；
 * 2. 懒加载由路由器统一调度，不必在每层布局里手写 Suspense 边界。
 * 首屏等待由 RouterProvider 的 fallbackElement 兜底（见 src/main.tsx）。
 *
 * 导出 routes 数组而不只是 router：单元测试可用 createMemoryRouter(routes) 直接验证路由行为。
 */

export const routes: RouteObject[] = [
  {
    // 根级外壳：路由出口 + 全局浮层（Toast / 二次确认 / 演示控制台与引导）。
    // 引导要跨页跳转，必须位于 Router 内部，因此浮层挂在这里而不是 AppProviders。
    element: <RootShell />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        errorElement: <RouteErrorPage />,
        children: [
          {
            index: true,
            lazy: () => lazyPage(() => import('@/pages/home/HomePage'), 'HomePage'),
          },
          {
            path: 'news',
            lazy: () => lazyPage(() => import('@/pages/news/NewsPage'), 'NewsPage'),
          },
          {
            path: 'wiki',
            lazy: () => lazyPage(() => import('@/pages/wiki/WikiPage'), 'WikiPage'),
          },
          {
            path: 'guide',
            lazy: () => lazyPage(() => import('@/pages/guide/GuidePage'), 'GuidePage'),
          },
          {
            path: 'map',
            lazy: () => lazyPage(() => import('@/pages/map/MapPage'), 'MapPage'),
          },
          {
            path: 'build-lab',
            lazy: () => lazyPage(() => import('@/pages/build-lab/BuildLabPage'), 'BuildLabPage'),
          },
          {
            path: 'forum',
            lazy: () => lazyPage(() => import('@/pages/forum/ForumPage'), 'ForumPage'),
          },
          {
            path: 'creation',
            lazy: () => lazyPage(() => import('@/pages/creation/CreationPage'), 'CreationPage'),
          },
          {
            path: 'event',
            lazy: () => lazyPage(() => import('@/pages/event/EventPage'), 'EventPage'),
          },
          {
            path: 'shop',
            lazy: () => lazyPage(() => import('@/pages/shop/ShopPage'), 'ShopPage'),
          },
          {
            path: 'user',
            lazy: () => lazyPage(() => import('@/pages/user/UserPage'), 'UserPage'),
          },
          {
            // 他人主页：与自己主页复用同一页面组件，由页面内部读参数区分视角（阶段 2 实现）
            path: 'user/:userId',
            lazy: () => lazyPage(() => import('@/pages/user/UserPage'), 'UserPage'),
          },
        ],
      },
      {
        path: '/admin',
        // 守卫包在布局外层：无权时连后台外壳都不渲染，直接给 403 页
        element: (
          <RequireRole allow={['admin']}>
            <AdminLayout />
          </RequireRole>
        ),
        errorElement: <RouteErrorPage />,
        children: [
          {
            index: true,
            lazy: () => lazyPage(() => import('@/pages/admin/AdminPage'), 'AdminPage'),
          },
        ],
      },
      {
        // 无导航场景：登录页与 404 共用空白布局
        element: <BlankLayout />,
        errorElement: <RouteErrorPage />,
        children: [
          {
            path: 'login',
            lazy: () => lazyPage(() => import('@/pages/login/LoginPage'), 'LoginPage'),
          },
          {
            path: '*',
            lazy: () => lazyPage(() => import('@/pages/not-found/NotFoundPage'), 'NotFoundPage'),
          },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes, { future: ROUTER_FUTURE_FLAGS });
