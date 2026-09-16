import { Link, Outlet } from 'react-router-dom';

import { UnofficialDisclaimer } from '@/components/business/UnofficialDisclaimer';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { COPY } from '@/utils/copy';

/**
 * 空白布局：登录页、404 等「无导航」场景。
 * 只保留最小品牌信息与主题切换，保证这些页面同样可切主题、同样带合规声明。
 */
export function BlankLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-content">
      <header className="flex items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="border-token border-line flex h-8 w-8 items-center justify-center rounded-sm font-display text-sm text-accent"
          >
            悟
          </span>
          <span className="font-display text-base">{COPY.site.shortName}</span>
        </Link>
        <ThemeSwitcher />
      </header>

      <main id="main-content" className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <Outlet />
        </div>
      </main>

      <footer className="px-6 py-6">
        <div className="mx-auto max-w-page">
          <UnofficialDisclaimer variant="compact" />
        </div>
      </footer>
    </div>
  );
}
