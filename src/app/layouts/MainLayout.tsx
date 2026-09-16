import { Link, NavLink, Outlet } from 'react-router-dom';

import { SIDEBAR_NAV, TOP_NAV } from '@/app/navigation';
import type { NavItem } from '@/app/navigation';
import { UnofficialDisclaimer } from '@/components/business/UnofficialDisclaimer';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { useDemoStore } from '@/demo/demoStore';
import { SessionBadge } from '@/features/auth/SessionBadge';
import { pushToast } from '@/stores/toastStore';
import { useUiStore } from '@/stores/uiStore';
import { cn } from '@/utils/cn';
import { COPY } from '@/utils/copy';

/** 侧栏条目（含单字印章图标 + 说明），折叠时只留印章。 */
function SidebarItem({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      title={collapsed ? `${item.label} · ${item.description}` : undefined}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-scroll px-2 py-2 text-sm transition-colors duration-fast',
          isActive
            ? 'bg-surface-2 text-accent border-token border-line'
            : 'text-content-muted hover:bg-surface hover:text-content',
        )
      }
    >
      <span
        aria-hidden="true"
        className="border-token border-line flex h-7 w-7 shrink-0 items-center justify-center rounded-sm font-display text-xs"
      >
        {item.seal}
      </span>
      <span className={cn('truncate', collapsed && 'sr-only')}>{item.label}</span>
      {collapsed ? null : (
        <span className="ml-auto hidden text-[11px] text-content-muted xl:inline">
          {item.description}
        </span>
      )}
    </NavLink>
  );
}

/**
 * 主布局：顶部导航 + 可折叠侧栏 + 页脚非官方声明（协议第五节 阶段 0 交付物 6）。
 *
 * 阶段 1 的两处变化：
 * 1. 剧透开关改读 DemoState.spoiler —— 唯一状态源，且会同步进 URL；
 * 2. 顶部让出 --hmw-banner-h（演示提示条高度），提示条出现时头部与侧栏一起下移。
 */
export function MainLayout() {
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const spoiler = useDemoStore((state) => state.spoiler);
  const patchDemo = useDemoStore((state) => state.patch);

  return (
    <div className="flex min-h-screen flex-col bg-bg text-content">
      {/* 键盘用户跳过导航的快捷入口（无障碍基线） */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-scroll focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-ink"
      >
        {COPY.layout.skipToContent}
      </a>

      <header className="border-token border-line bg-bg sticky top-[var(--hmw-banner-h)] z-30 border-b">
        <div className="mx-auto flex h-nav max-w-page items-center gap-4 px-4">
          <Link to="/" data-tour="brand" className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="border-token border-line font-display text-accent flex h-8 w-8 items-center justify-center rounded-sm text-sm"
            >
              悟
            </span>
            <span className="font-display text-base tracking-wide">{COPY.site.shortName}</span>
          </Link>

          <nav
            aria-label="主导航"
            data-tour="top-nav"
            className="hidden items-center gap-1 md:flex"
          >
            {TOP_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'rounded-scroll px-3 py-1.5 text-sm transition-colors duration-fast',
                    isActive ? 'text-accent' : 'text-content-muted hover:text-content',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span data-tour="theme-switcher">
              <ThemeSwitcher />
            </span>

            <button
              type="button"
              data-tour="spoiler-toggle"
              aria-pressed={spoiler}
              title={COPY.layout.spoilerHint}
              onClick={() => {
                patchDemo({ spoiler: !spoiler });
                pushToast(!spoiler ? COPY.demo.spoilerOn : COPY.demo.spoilerOff);
              }}
              className={cn(
                'border-token rounded-scroll border px-2 py-1 text-xs transition-colors duration-fast',
                spoiler
                  ? 'border-cinnabar text-cinnabar'
                  : 'border-line text-content-muted hover:text-content',
              )}
            >
              {COPY.layout.spoilerLabel}：{spoiler ? COPY.layout.spoilerOn : COPY.layout.spoilerOff}
            </button>

            <SessionBadge />
          </div>
        </div>
      </header>

      {/* 小屏：侧栏收起为横向模块条，保证所有路由都可达 */}
      <nav aria-label="模块导航" className="border-token border-line border-b lg:hidden">
        <ul className="mx-auto flex max-w-page gap-2 overflow-x-auto px-4 py-2">
          {SIDEBAR_NAV.map((item) => (
            <li key={item.to} className="shrink-0">
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'border-token rounded-scroll border px-2 py-1 text-xs',
                    isActive ? 'border-accent text-accent' : 'border-line text-content-muted',
                  )
                }
              >
                {item.seal} {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-auto flex w-full max-w-page flex-1 items-start gap-6 px-4 py-6">
        <aside data-tour="sidebar" className="hidden shrink-0 lg:block" aria-label="模块侧栏">
          <div
            className={cn(
              'border-token border-line bg-surface sticky top-[calc(var(--hmw-banner-h)+var(--hmw-nav-h)+1.5rem)] rounded-scroll p-2 transition-[width] duration-base',
              sidebarCollapsed ? 'w-sidebar-collapsed' : 'w-sidebar',
            )}
          >
            <div className="mb-2 flex items-center justify-between px-1">
              {sidebarCollapsed ? null : (
                <span className="text-content-muted text-xs">{COPY.site.tagline}</span>
              )}
              <button
                type="button"
                onClick={toggleSidebar}
                aria-expanded={!sidebarCollapsed}
                aria-label={
                  sidebarCollapsed ? COPY.layout.expandSidebar : COPY.layout.collapseSidebar
                }
                className="border-token border-line text-content-muted hover:text-accent rounded-sm px-1.5 py-0.5 text-xs"
              >
                {sidebarCollapsed ? '»' : '«'}
              </button>
            </div>

            <nav aria-label="模块列表">
              <ul className="space-y-1">
                {SIDEBAR_NAV.map((item) => (
                  <li key={item.to}>
                    <SidebarItem item={item} collapsed={sidebarCollapsed} />
                  </li>
                ))}
              </ul>
            </nav>

            <Link
              to="/admin"
              className="border-token border-line text-content-muted hover:text-accent mt-3 flex items-center gap-2 rounded-scroll border border-dashed px-2 py-2 text-xs"
            >
              <span aria-hidden="true">司</span>
              <span>{COPY.nav.admin}</span>
            </Link>
          </div>
        </aside>

        <main id="main-content" className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>

      <footer data-tour="disclaimer" className="border-token border-line mt-8 border-t py-8">
        <div className="mx-auto max-w-page px-4">
          <UnofficialDisclaimer />
        </div>
      </footer>
    </div>
  );
}
