import type { DemoTourId } from '@/demo/tours/types';

/**
 * 引导文案（与步骤逻辑分离，便于非技术人员修改）。
 * 键 = 步骤 id；改文案不需要动 tours/*Tour.ts。
 */
export interface TourCopy {
  title: string;
  description: string;
}

export const TOUR_COPY: Record<string, TourCopy> = {
  /* ── 首次到访 ───────────────────────────────────────────── */
  'fv-brand': {
    title: '欢迎来到天命人同人站',
    description: '这是非官方粉丝作品：全部数据都在你自己浏览器里模拟，不连任何后端，随时可重置。',
  },
  'fv-sidebar': {
    title: '十个模块，一条侧栏',
    description:
      '资讯、影神图、攻略、地图、配装、论坛、二创、活动、商城、个人主页。点击徽记可以折叠侧栏，把版面让给内容。',
  },
  'fv-theme': {
    title: '三套主题随时切换',
    description:
      '墨黑 / 宣纸 / 高对比。它们共用同一套设计令牌，所以切换的是变量，不是样式表 —— 也不会打断你正在做的事。',
  },
  'fv-spoiler': {
    title: '剧透保护默认开启',
    description: '默认隐藏剧情、结局与隐藏 Boss 信息。把链接发给还没通关的朋友时，保持关闭即可。',
  },
  'fv-gourd': {
    title: '右下角这只葫芦是演示控制台',
    description:
      '身份、界面状态、主题、剧透、数据、引导、场景、工具都在里面。评审想看哪种状态，直接点。',
  },
  'fv-modules': {
    title: '模块入口',
    description: '每个模块都会在后续阶段逐个交付，卡片上的阶段标签标明了计划顺序。',
  },
  'fv-wiki': {
    title: '引导会自动跨页',
    description:
      '你刚才被自动带到了影神图页 —— 步骤绑定路由，跨页时引导会跳转并把目标元素挖出来高亮。',
  },
  'fv-tokens': {
    title: '令牌自检',
    description: '这排色块全部绑在 CSS 变量上。切主题时它们一起变，说明没有硬编码色值漏网。',
  },

  /* ── 控制台导览 ─────────────────────────────────────────── */
  'cg-gourd': {
    title: '打开控制台',
    description: '葫芦按钮同时是开关：再点一次收起，Esc 也能关。',
  },
  'cg-identity': {
    title: '身份',
    description: '六种身份决定权限与可见内容。切到「管理员」后，侧栏底部的后台入口就能进入了。',
  },
  'cg-uistate': {
    title: '界面状态',
    description:
      '六个状态统一覆盖所有异步 UI：正常 / 空 / 加载 / 错误 / 慢速 / 断网。切到断网，页面上每个列表都会立刻变成统一的失败态。',
  },
  'cg-scenario': {
    title: '预设场景',
    description: '一键切到典型现场：状态 + 种子数据 + 路由 + 引导一起到位，并把结果写进 URL。',
  },
  'cg-data': {
    title: '数据',
    description: '重置 / 填满 / 清空 / 导出快照 / 导入快照。导出后清空再导入，界面会完全还原。',
  },
  'cg-tools': {
    title: '工具',
    description: '布局栅格、组件边界、性能面板，以及「复制演示链接」——把当前状态发给评审。',
  },
};

export const TOUR_SUMMARY: Record<DemoTourId, { name: string; description: string }> = {
  'first-visit': {
    name: '首次到访',
    description: '八步走完站点骨架，中途会跨页跳转并自动回到首页。',
  },
  'console-guide': {
    name: '控制台导览',
    description: '六个分区逐个讲解，演示控制台能做什么一目了然。',
  },
};
