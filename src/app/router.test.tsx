import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { AppProviders } from '@/app/providers';
import { routes } from '@/app/router';
import { RENDER_FUTURE_FLAGS, ROUTER_FUTURE_FLAGS } from '@/app/routerOptions';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, {
    initialEntries: [path],
    future: ROUTER_FUTURE_FLAGS,
  });
  const view = render(
    <AppProviders>
      <RouterProvider router={router} future={RENDER_FUTURE_FLAGS} />
    </AppProviders>,
  );
  return { router, view };
}

/**
 * 路由级集成测试：用 createMemoryRouter 复用真实路由表，
 * 覆盖「懒加载页面能挂载」「布局与守卫按预期生效」两条阶段 0 验收标准。
 */
describe('路由表', () => {
  it('首页可挂载并渲染主布局（含非官方声明）', async () => {
    renderAt('/');

    expect(
      await screen.findByRole('heading', { level: 1, name: /粉丝互动站/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/非官方粉丝作品，与游戏科学/)).toBeInTheDocument();
  });

  it('侧栏模块路由可达（以论坛为例）', async () => {
    renderAt('/forum');

    expect(await screen.findByRole('heading', { level: 1, name: /论坛 · 建设中/ })).toBeVisible();
  });

  it('guard：guest 访问 /admin 渲染 403 而不是跳转', async () => {
    const { router } = renderAt('/admin');

    expect(await screen.findByRole('heading', { name: /无资格入内/ })).toBeVisible();
    // 未跳转：地址仍是 /admin；且后台外壳完全没有渲染
    expect(router.state.location.pathname).toBe('/admin');
    expect(screen.queryByText('演示后台')).not.toBeInTheDocument();
  });

  it('未知路径渲染 404 页', async () => {
    renderAt('/not-a-real-page');

    expect(await screen.findByRole('heading', { name: /404/ })).toBeVisible();
  });
});
