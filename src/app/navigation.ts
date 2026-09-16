import { COPY } from '@/utils/copy';

/**
 * 导航项的交付状态。
 *
 * 为什么要把它写成数据而不是靠注释：剩余模块已终止开发，如果导航与首页仍然
 * 按「后续阶段会交付」的口径描述它们，评审点进去只会看到一个说不清楚的页面。
 * 状态放在这里，导航、首页卡片、占位页与测试都读同一份事实。
 */
export type NavStatus = 'delivered' | 'planned';

export interface NavItem {
  to: string;
  /** 单字印章式图标：不引图标库，零新增依赖，也更贴合东方调性。 */
  seal: string;
  label: string;
  description: string;
  status: NavStatus;
}

export const SIDEBAR_NAV: readonly NavItem[] = [
  {
    to: '/',
    seal: '始',
    label: COPY.nav.home,
    description: COPY.navDescription.home,
    status: 'delivered',
  },
  {
    to: '/news',
    seal: '讯',
    label: COPY.nav.news,
    description: COPY.navDescription.news,
    status: 'delivered',
  },
  {
    to: '/wiki',
    seal: '鉴',
    label: COPY.nav.wiki,
    description: COPY.navDescription.wiki,
    status: 'delivered',
  },
  {
    to: '/guide',
    seal: '策',
    label: COPY.nav.guide,
    description: COPY.navDescription.guide,
    status: 'delivered',
  },
  {
    to: '/map',
    seal: '图',
    label: COPY.nav.map,
    description: COPY.navDescription.map,
    status: 'planned',
  },
  {
    to: '/build-lab',
    seal: '装',
    label: COPY.nav.buildLab,
    description: COPY.navDescription.buildLab,
    status: 'planned',
  },
  {
    to: '/forum',
    seal: '坛',
    label: COPY.nav.forum,
    description: COPY.navDescription.forum,
    status: 'planned',
  },
  {
    to: '/creation',
    seal: '绘',
    label: COPY.nav.creation,
    description: COPY.navDescription.creation,
    status: 'planned',
  },
  {
    to: '/event',
    seal: '赛',
    label: COPY.nav.event,
    description: COPY.navDescription.event,
    status: 'planned',
  },
  {
    to: '/shop',
    seal: '蕴',
    label: COPY.nav.shop,
    description: COPY.navDescription.shop,
    status: 'planned',
  },
  {
    to: '/user',
    seal: '命',
    label: COPY.nav.user,
    description: COPY.navDescription.user,
    status: 'delivered',
  },
];

/** 已交付模块（首页、占位页与测试共用同一份清单）。 */
export const DELIVERED_NAV: readonly NavItem[] = SIDEBAR_NAV.filter(
  (item) => item.status === 'delivered',
);

/** 未交付模块（原计划里存在，本次交付没有实现）。 */
export const PLANNED_NAV: readonly NavItem[] = SIDEBAR_NAV.filter(
  (item) => item.status === 'planned',
);

export function isDeliveredRoute(path: string): boolean {
  return DELIVERED_NAV.some((item) => item.to === path);
}

/**
 * 顶部导航：只放最高频入口，且**只放已交付模块** ——
 * 顶部是「现在就可用」的地方，把未交付模块放上去等于制造坏链接。
 */
const TOP_NAV_PATHS = ['/', '/news', '/wiki', '/guide', '/user'] as const;

export const TOP_NAV: readonly NavItem[] = TOP_NAV_PATHS.flatMap((path) => {
  const item = SIDEBAR_NAV.find((candidate) => candidate.to === path);
  return item === undefined ? [] : [item];
});

export interface PlannedSection {
  seal: string;
  label: string;
  description: string;
}

/** 后台模块规划清单（未交付）：后台布局只做版式占位，不实现任何业务。 */
export const ADMIN_PLANNED_SECTIONS: readonly PlannedSection[] = [
  { seal: '审', label: '审核队列', description: '批量操作与键盘快捷键' },
  { seal: '盘', label: '数据看板', description: 'ECharts 指标图表' },
  { seal: '籍', label: '用户管理', description: '虚拟滚动表格与列筛选' },
];
