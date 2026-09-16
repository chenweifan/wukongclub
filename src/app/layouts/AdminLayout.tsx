import { Link, Outlet } from 'react-router-dom';

import { ADMIN_PLANNED_SECTIONS } from '@/app/navigation';
import { UnofficialDisclaimer } from '@/components/business/UnofficialDisclaimer';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { useDemo } from '@/demo/demoContext';
import { COPY } from '@/utils/copy';

/**
 * 后台布局：独立外壳，避免把前台导航带进管理场景。
 * 只有 admin 身份可进入（守卫在 router.tsx 的 <RequireRole> 上，此处不再重复判断）。
 */
export function AdminLayout() {
  const { role } = useDemo();

  return (
    <div className="flex min-h-screen flex-col bg-bg text-content">
      <header className="border-b border-token border-line">
        <div className="mx-auto flex h-nav max-w-page items-center gap-4 px-4">
          <span className="font-display text-base">
            {COPY.layout.adminArea}
            <span className="stamp ml-2 align-middle">{role}</span>
          </span>

          <div className="ml-auto flex items-center gap-3">
            <ThemeSwitcher />
            <Link
              to="/"
              className="border-token border-line rounded-scroll px-3 py-1.5 text-sm text-content-muted hover:text-accent"
            >
              {COPY.layout.backToSite}
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-page flex-1 items-start gap-6 px-4 py-8">
        <aside className="hidden w-sidebar shrink-0 lg:block" aria-label="后台模块">
          <h2 className="mb-3 text-xs text-content-muted">{COPY.layout.plannedSections}</h2>
          <ul className="space-y-2">
            {ADMIN_PLANNED_SECTIONS.map((section) => (
              <li
                key={section.label}
                className="border-token border-line bg-surface/50 rounded-scroll flex items-start gap-3 border p-3"
              >
                <span
                  aria-hidden="true"
                  className="border-token border-line flex h-7 w-7 shrink-0 items-center justify-center rounded-sm font-display text-xs text-accent"
                >
                  {section.seal}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm">
                    {section.label}
                    <span className="stamp">{COPY.layout.building}</span>
                  </span>
                  <span className="mt-1 block text-xs text-content-muted">
                    {section.description}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </aside>

        <main id="main-content" className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>

      <footer className="mt-8 border-t border-token border-line py-8">
        <div className="mx-auto max-w-page px-4">
          <UnofficialDisclaimer variant="compact" />
        </div>
      </footer>
    </div>
  );
}
