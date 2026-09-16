import type { ComponentType } from 'react';

/** 类型守卫：把 unknown 收敛成组件类型，避免使用类型断言（协议铁律 9）。 */
function isComponentType(value: unknown): value is ComponentType {
  return typeof value === 'function';
}

/**
 * 页面懒加载包装：统一「具名导出 → Component」的适配，避免每个路由重复样板。
 *
 * 为什么要包一层而不是直接 `React.lazy`：
 * 1. 页面继续使用具名导出（协议第八节），无需 `.then(m => ({ default: m.X }))`；
 * 2. 配合 Data Router 的 route.lazy，路由切换由路由器调度，无需层层手写 Suspense。
 *
 * TKey 受 keyof TModule 约束，写错导出名会在编译期报错，而不是运行时白屏。
 */
export async function lazyPage<TModule extends object, TKey extends keyof TModule>(
  importer: () => Promise<TModule>,
  exportName: TKey,
): Promise<{ Component: ComponentType }> {
  const module = await importer();
  const component: unknown = module[exportName];

  if (!isComponentType(component)) {
    throw new Error(`路由懒加载失败：模块未导出组件 "${String(exportName)}"`);
  }

  return { Component: component };
}

/**
 * v7 前瞻开关（router.future）：现在打开，将来升级 react-router 7 时行为不会突变。
 * 单独成文件是为了让 router.tsx 只保留路由表，满足 react-refresh 的单导出形态约束。
 *
 * 刻意不开 `v7_partialHydration`：一旦开启，RouterProvider 的 fallbackElement 会被判为弃用，
 * 而它在 6.x 里是「懒加载路由首屏占位」的唯一手段。升到 v7 时应改用路由级 HydrateFallback。
 */
export const ROUTER_FUTURE_FLAGS = {
  v7_relativeSplatPath: true,
  v7_fetcherPersist: true,
  v7_normalizeFormMethod: true,
  v7_skipActionErrorRevalidation: true,
} as const;

/**
 * 渲染级 v7 开关（RouterProvider future），与 router.future 是两套配置：
 * react-router 6.30 中 v7_startTransition 只在 RouterProvider 上生效。
 */
export const RENDER_FUTURE_FLAGS = { v7_startTransition: true } as const;
