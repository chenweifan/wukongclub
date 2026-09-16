import { Link } from 'react-router-dom';

import { DELIVERED_NAV } from '@/app/navigation';
import { COPY } from '@/utils/copy';

export interface PagePlaceholderProps {
  /** 页面名，用于拼出「{{页面名}} · 未在本次交付范围内」 */
  pageName: string;
  /** 该页在原计划里属于哪个阶段，方便评审一眼定位。 */
  phase?: string;
  /** 覆盖默认说明文案（通常传导航里对该模块的描述，作为「原计划」内容）。 */
  description?: string;
}

/**
 * 未交付模块的统一占位页。
 *
 * 它存在的意义不是「占个位」，而是**诚实**：剩余模块已终止开发，
 * 直接删路由会让导航出现坏链接，什么都不写又会让人以为是页面坏了。
 * 因此这里说清三件事：这个模块没有实现、原计划它做什么、现在能去哪里。
 */
export function PagePlaceholder({
  pageName,
  phase = '原计划 · 阶段 2/3',
  description = COPY.placeholder.hint,
}: PagePlaceholderProps) {
  return (
    <section
      data-tour="page-placeholder"
      className="panel-scroll texture-grain mx-auto max-w-page space-y-6 p-8"
    >
      <header>
        <p className="stamp inline-block">{COPY.layout.notDelivered}</p>
        <h1 className="mt-4 text-2xl md:text-3xl">{COPY.placeholder.default(pageName)}</h1>
        <p className="mt-2 text-xs text-content-muted">{phase}</p>
        <p className="mt-3 max-w-2xl text-sm text-content-muted">{COPY.placeholder.hint}</p>
        <p className="mt-3 max-w-2xl text-sm text-content-muted">
          {COPY.placeholder.plannedPrefix}：{description}
        </p>
        <p className="mt-3 max-w-2xl text-xs text-content-muted">{COPY.placeholder.keptFor}</p>
      </header>

      <section
        aria-labelledby="placeholder-delivered"
        className="border-token border-line border-t pt-6"
      >
        <h2 id="placeholder-delivered" className="text-lg">
          {COPY.placeholder.deliveredTitle}
        </h2>
        <p className="mt-2 text-xs text-content-muted">{COPY.placeholder.deliveredHint}</p>

        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {DELIVERED_NAV.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="panel-scroll hover:border-line-strong flex items-center gap-3 p-4 transition-colors duration-fast"
              >
                <span
                  aria-hidden="true"
                  className="border-token border-line text-accent font-display flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-xs"
                >
                  {item.seal}
                </span>
                <span className="min-w-0">
                  <span className="font-display block text-sm">{item.label}</span>
                  <span className="mt-0.5 block text-xs text-content-muted">
                    {item.description}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
