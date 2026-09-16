import { Link } from 'react-router-dom';

import { COPY } from '@/utils/copy';

interface ModuleCard {
  to: string;
  seal: string;
  title: string;
  description: string;
  phase: string;
}

/** 首屏三张占位卡片：同时充当「主题令牌是否生效」的可视化自检面。 */
const MODULE_CARDS: readonly ModuleCard[] = [
  {
    to: '/wiki',
    seal: '鉴',
    title: '影神图百科',
    description: '卡片墙、词条对比与关联图谱，妖怪与人物的完整档案。',
    phase: '阶段 2',
  },
  {
    to: '/build-lab',
    seal: '装',
    title: '配装模拟器',
    description: '槽位拖拽 + 属性实时计算，一键导出配装图并分享链接。',
    phase: '阶段 3',
  },
  {
    to: '/map',
    seal: '图',
    title: '互动地图',
    description: '章节图层、点位聚合与收集进度，全部本地保存。',
    phase: '阶段 3',
  },
];

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

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/wiki"
            className="bg-accent text-accent-ink rounded-scroll px-4 py-2 text-sm font-medium"
          >
            {COPY.nav.wiki}
          </Link>
          <Link
            to="/forum"
            className="border-token border-line hover:text-accent rounded-scroll border px-4 py-2 text-sm"
          >
            {COPY.nav.forum}
          </Link>
        </div>
      </section>

      <section aria-labelledby="home-modules" className="space-y-4">
        <h2 id="home-modules" className="text-lg">
          模块导航
        </h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {MODULE_CARDS.map((card) => (
            <li key={card.to}>
              <Link
                to={card.to}
                className="panel-scroll texture-grain hover:border-line-strong block h-full p-6 transition-colors duration-fast"
              >
                <span className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="border-token border-line flex h-9 w-9 items-center justify-center rounded-sm font-display text-sm text-accent"
                  >
                    {card.seal}
                  </span>
                  <span className="font-display text-base">{card.title}</span>
                  <span className="stamp ml-auto">{card.phase}</span>
                </span>
                <span className="mt-3 block text-sm text-content-muted">{card.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="home-tokens" className="panel-scroll p-6">
        <h2 id="home-tokens" className="text-lg">
          {COPY.common.tokenCheck}
        </h2>
        <p className="mt-2 text-xs text-content-muted">
          色块均绑定 CSS 变量令牌（tokens.css）；切换右上角主题时整组应同步变化，无任何硬编码色值。
        </p>
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
    </div>
  );
}
