import { Link } from 'react-router-dom';

import { DELIVERED_NAV, PLANNED_NAV } from '@/app/navigation';
import type { NavItem } from '@/app/navigation';
import { DemoProbePanel } from '@/demo/panels/DemoProbePanel';
import { COPY } from '@/utils/copy';

/**
 * 首页模块卡片。
 *
 * 剩余模块已终止开发，因此首页必须先把「范围」说清楚：
 * 已交付的四个模块是可以真正走通的入口，未交付的模块带明确标记，
 * 点进去看到的是说明页而不是空白 —— 首页不承诺站点没有的东西。
 */
function ModuleCard({ item }: { item: NavItem }) {
  const planned = item.status === 'planned';

  return (
    <Link
      to={item.to}
      className="panel-scroll texture-grain hover:border-line-strong block h-full p-6 transition-colors duration-fast"
    >
      <span className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={`border-token border-line font-display flex h-9 w-9 items-center justify-center rounded-sm text-sm ${
            planned ? 'text-content-muted' : 'text-accent'
          }`}
        >
          {item.seal}
        </span>
        <span className="font-display text-base">{item.label}</span>
        <span className="stamp ml-auto">
          {planned ? COPY.layout.notDelivered : COPY.layout.delivered}
        </span>
      </span>
      <span className="mt-3 block text-sm text-content-muted">{item.description}</span>
    </Link>
  );
}

/** 令牌色板：切换主题时应看到整组色块同时变化。 */
const TOKEN_SWATCHES = [
  { label: '墨黑 ink', className: 'bg-ink' },
  { label: '鎏金 gold', className: 'bg-gold' },
  { label: '朱砂 cinnabar', className: 'bg-cinnabar' },
  { label: '宣纸 paper', className: 'bg-paper' },
  { label: '灵蕴青 jade', className: 'bg-jade' },
  { label: '面板 surface', className: 'bg-surface border-token border-line' },
  { label: '强调 accent', className: 'bg-accent' },
] as const;

export function HomePage() {
  return (
    <div className="space-y-8">
      <section className="panel-scroll texture-grain p-8 md:p-12">
        <p className="stamp inline-block">{COPY.site.heroEyebrow}</p>
        <h1 className="mt-4 text-3xl md:text-5xl">{COPY.site.heroTitle}</h1>
        <p className="mt-4 max-w-2xl text-sm text-content-muted md:text-base">
          {COPY.site.heroDescription}
        </p>
        <p className="border-token border-line mt-4 max-w-3xl rounded-scroll border border-dashed p-3 text-xs leading-relaxed text-content-muted">
          {COPY.site.scopeNote}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/wiki"
            className="bg-accent text-accent-ink rounded-scroll px-4 py-2 text-sm font-medium"
          >
            {COPY.nav.wiki}
          </Link>
          <Link
            to="/guide"
            className="border-token border-line hover:text-accent rounded-scroll border px-4 py-2 text-sm"
          >
            {COPY.nav.guide}
          </Link>
        </div>
      </section>

      <section data-tour="home-modules" aria-labelledby="home-modules" className="space-y-4">
        <h2 id="home-modules" className="text-lg">
          模块导航
        </h2>

        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {DELIVERED_NAV.filter((item) => item.to !== '/').map((item) => (
            <li key={item.to}>
              <ModuleCard item={item} />
            </li>
          ))}
        </ul>

        <h3 className="pt-2 text-sm text-content-muted">
          {COPY.layout.notDelivered}的模块（原计划）
        </h3>
        <ul className="grid gap-3 md:grid-cols-3">
          {PLANNED_NAV.map((item) => (
            <li key={item.to}>
              <ModuleCard item={item} />
            </li>
          ))}
        </ul>
      </section>

      <section data-tour="home-tokens" aria-labelledby="home-tokens" className="panel-scroll p-6">
        <h2 id="home-tokens" className="text-lg">
          {COPY.common.tokenCheck}
        </h2>
        <p className="mt-2 text-xs text-content-muted">{COPY.common.tokenCheckHint}</p>
        <ul className="mt-4 flex flex-wrap gap-3">
          {TOKEN_SWATCHES.map((swatch) => (
            <li key={swatch.label} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`h-8 w-8 rounded-scroll shadow-seal ${swatch.className}`}
              />
              <span className="text-xs text-content-muted">{swatch.label}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 演示系统自检面板：阶段 1 的验收实物，业务模块的数据由各自的 Repository 提供 */}
      <DemoProbePanel />
    </div>
  );
}
