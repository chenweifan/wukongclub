import { COPY } from '@/utils/copy';

export interface NavItem {
  to: string;
  /** 单字印章式图标：不引图标库，零新增依赖，也更贴合东方调性。 */
  seal: string;
  label: string;
  description: string;
}

export const SIDEBAR_NAV: readonly NavItem[] = [
  { to: '/', seal: '始', label: COPY.nav.home, description: COPY.navDescription.home },
  { to: '/news', seal: '讯', label: COPY.nav.news, description: COPY.navDescription.news },
  { to: '/wiki', seal: '鉴', label: COPY.nav.wiki, description: COPY.navDescription.wiki },
  { to: '/guide', seal: '策', label: COPY.nav.guide, description: COPY.navDescription.guide },
  { to: '/map', seal: '图', label: COPY.nav.map, description: COPY.navDescription.map },
  {
    to: '/build-lab',
    seal: '装',
    label: COPY.nav.buildLab,
    description: COPY.navDescription.buildLab,
  },
  { to: '/forum', seal: '坛', label: COPY.nav.forum, description: COPY.navDescription.forum },
  {
    to: '/creation',
    seal: '绘',
    label: COPY.nav.creation,
    description: COPY.navDescription.creation,
  },
  { to: '/event', seal: '赛', label: COPY.nav.event, description: COPY.navDescription.event },
  { to: '/shop', seal: '蕴', label: COPY.nav.shop, description: COPY.navDescription.shop },
  { to: '/user', seal: '命', label: COPY.nav.user, description: COPY.navDescription.user },
];

/** 顶部导航：只放最高频入口，完整模块列表交给侧栏，避免两处重复。 */
const TOP_NAV_PATHS = ['/', '/news', '/wiki', '/forum', '/event'] as const;

export const TOP_NAV: readonly NavItem[] = TOP_NAV_PATHS.flatMap((path) => {
  const item = SIDEBAR_NAV.find((candidate) => candidate.to === path);
  return item === undefined ? [] : [item];
});

export interface PlannedSection {
  seal: string;
  label: string;
  description: string;
}

/** 后台模块规划清单（阶段 3 交付）：这里只做版式占位，不实现任何业务。 */
export const ADMIN_PLANNED_SECTIONS: readonly PlannedSection[] = [
  { seal: '审', label: '审核队列', description: '批量操作与键盘快捷键' },
  { seal: '盘', label: '数据看板', description: 'ECharts 指标图表' },
  { seal: '籍', label: '用户管理', description: '虚拟滚动表格与列筛选' },
];
