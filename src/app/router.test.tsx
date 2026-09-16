import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { AppProviders } from '@/app/providers';
import { DELIVERED_NAV, isDeliveredRoute } from '@/app/navigation';
import { routes } from '@/app/router';
import { RENDER_FUTURE_FLAGS, ROUTER_FUTURE_FLAGS } from '@/app/routerOptions';
import { useDemoStore } from '@/demo/demoStore';
import { COPY } from '@/utils/copy';

function renderAt(path: string) {
  // 演示状态来自 window.location（DemoProvider 挂在 Router 之外），
  // 而 memory router 不会改动 window.location —— 两边都要给，测试才真实。
  window.history.replaceState(null, '', path);

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

/** 演示浮层是 React.lazy 的：断言「没有渲染」之前，先给它一个挂载窗口。 */
async function waitForLazyOverlay(): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, 80);
  });
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

  it('侧栏模块路由可达，未交付模块给出说明而不是坏页面（以论坛为例）', async () => {
    renderAt('/forum');

    expect(
      await screen.findByRole('heading', { level: 1, name: /论坛 · 未在本次交付范围内/ }),
    ).toBeVisible();
  });

  it('未交付的占位页列出已交付模块，用户不会走进死胡同', async () => {
    renderAt('/forum');

    const heading = await screen.findByRole('heading', {
      level: 2,
      name: COPY.placeholder.deliveredTitle,
    });
    const section = heading.closest('section');

    expect(section?.querySelectorAll('a')).toHaveLength(DELIVERED_NAV.length);
    for (const item of DELIVERED_NAV) {
      expect(
        section?.querySelector(`a[href="${item.to}"]`),
        `缺少 ${item.to} 的入口`,
      ).not.toBeNull();
    }
  });

  it('顶部导航只放已交付模块（不制造指向未交付模块的入口）', async () => {
    renderAt('/');

    await screen.findByRole('heading', { level: 1, name: /粉丝互动站/ });

    const topNav = screen.getByRole('navigation', { name: '主导航' });
    const hrefs = [...topNav.querySelectorAll('a')].map((anchor) => anchor.getAttribute('href'));

    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(isDeliveredRoute(href ?? ''), `${href} 不是已交付模块`).toBe(true);
    }
  });

  it('影神图页带着引导剧本的跨页锚点（自动跨页那一步不会高亮不到东西）', async () => {
    renderAt('/wiki');

    await screen.findByRole('heading', { level: 1, name: COPY.wiki.title });
    expect(document.querySelector('[data-tour="wiki-wall"]')).not.toBeNull();
  });

  it('guard：guest 访问 /admin 渲染 403 而不是跳转', async () => {
    const { router } = renderAt('/admin');

    expect(await screen.findByRole('heading', { name: /无资格入内/ })).toBeVisible();
    // 未跳转：地址仍是 /admin；且后台外壳完全没有渲染
    expect(router.state.location.pathname).toBe('/admin');
    expect(screen.queryByText('演示后台')).not.toBeInTheDocument();
  });

  it('场景「版主值班」的落点成立：版主身份访问 /admin 同样是 403（后台未交付）', async () => {
    renderAt('/admin?demo=1&role=moderator');

    expect(await screen.findByRole('heading', { name: /无资格入内/ })).toBeVisible();
  });

  it('他人主页未交付：/user/:userId 给出说明页，而不是展示自己的档案', async () => {
    renderAt('/user/user-someone-else?demo=1&role=active');

    expect(
      await screen.findByRole('heading', { level: 1, name: /他人主页 · user-someone-else/ }),
    ).toBeVisible();
    // 不能把当前登录用户的成长中心当成别人的主页渲染出来
    expect(screen.queryByLabelText(COPY.growth.profile.title)).not.toBeInTheDocument();
  });

  it('未知路径渲染 404 页', async () => {
    renderAt('/not-a-real-page');

    expect(await screen.findByRole('heading', { name: /404/ })).toBeVisible();
  });

  /* ── 阶段 1：演示链接的可复现性（协议 1.2 验收） ───────────────── */

  it('demo=1 链接打开即进入演示模式，并渲染顶部提示条', async () => {
    renderAt('/?demo=1&role=admin');

    expect(await screen.findByText(/演示模式 · 数据为本地模拟/)).toBeInTheDocument();
    expect(useDemoStore.getState().enabled).toBe(true);
    expect(useDemoStore.getState().role).toBe('admin');
  });

  it('ui=offline 链接让列表类区域展示统一断网态与重试按钮', async () => {
    renderAt('/?demo=1&ui=offline');

    expect(await screen.findByText('网络已断开')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '重试' }).length).toBeGreaterThan(0);
  });

  it('ui=empty 链接让列表类区域展示统一空态', async () => {
    renderAt('/?demo=1&ui=empty');

    expect(await screen.findByText('此处空空如也')).toBeInTheDocument();
  });

  it('clean=1 时提示条与控制台都不渲染（截图模式）', async () => {
    renderAt('/?demo=1&clean=1');

    expect(await screen.findByRole('heading', { level: 1, name: /粉丝互动站/ })).toBeVisible();

    // 演示浮层是按需加载的：先等它有机会挂载，再断言「确实什么都没渲染」
    await waitForLazyOverlay();

    expect(useDemoStore.getState().enabled).toBe(true);
    expect(useDemoStore.getState().clean).toBe(true);
    expect(screen.queryByText(/演示模式 · 数据为本地模拟/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '打开演示控制台' })).not.toBeInTheDocument();
  });

  it('role=admin 链接让后台守卫放行（身份也走 URL）', async () => {
    renderAt('/admin?demo=1&role=admin');

    expect(await screen.findByText('演示后台')).toBeInTheDocument();
  });

  it('seed=777 链接让首次播种与界面状态保持一致', async () => {
    renderAt('/?demo=1&seed=777');

    expect(await screen.findByRole('heading', { level: 1, name: /粉丝互动站/ })).toBeVisible();
    expect(useDemoStore.getState().seed).toBe(777);
  });

  /* ── 阶段 2：成长中心的登录态同样由 URL 驱动 ───────────────────── */

  it('role=guest 打开「我的」时展示登录引导，而不是四个失败的请求', async () => {
    renderAt('/user?demo=1&role=guest');

    expect(await screen.findByText(COPY.auth.needLoginTitle)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: COPY.auth.toLogin })).toBeInTheDocument();
  });

  it('role=active 打开「我的」会自动登录演示账号并渲染成长中心', async () => {
    renderAt('/user?demo=1&role=active');

    // 演示身份 → 自动登录 → 名片与三个面板
    expect(await screen.findByRole('heading', { level: 1, name: COPY.growth.title })).toBeVisible();
    expect(await screen.findByLabelText(COPY.growth.profile.title)).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: COPY.growth.checkIn.title })).toBeVisible();
  });

  it('role=banned 打开「我的」时给出封禁说明', async () => {
    renderAt('/user?demo=1&role=banned');

    expect(await screen.findByText(COPY.auth.bannedTitle)).toBeInTheDocument();
  });
});
