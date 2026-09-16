/**
 * 用户可见文案集中管理（协议架构铁律 6）。
 * 逻辑代码里不得出现中文硬编码，一律从这里取。
 * 演示专用文案（场景描述、引导话术）在阶段 1 放到 src/demo/fixtures。
 */
export const COPY = {
  site: {
    name: '黑神话悟空 · 非官方粉丝互动站',
    shortName: '悟空同人站',
    tagline: '天命人自己的影神图、配装台与论坛',
    heroTitle: '黑神话悟空 · 粉丝互动站',
    heroEyebrow: '非官方粉丝作品',
    heroDescription:
      '影神图百科、配装模拟器、互动地图与天命人论坛——全部数据在本地浏览器模拟，随时可重置。',
  },

  disclaimer: {
    unofficial: '本站为非官方粉丝作品，与游戏科学（Game Science）及其关联方无隶属关系。',
    copyright:
      '《黑神话：悟空》的名称、角色、美术与音乐等版权归游戏科学所有，本站仅用于学习与交流。',
    mockData: '页面中的全部数据均由本地 Mock 生成，不代表任何真实信息。',
    spoiler: '默认隐藏剧透内容：剧情、结局与隐藏 Boss 相关信息需手动开启后才展示。',
  },

  nav: {
    home: '首页',
    news: '资讯',
    wiki: '影神图',
    guide: '攻略',
    map: '地图',
    buildLab: '配装',
    forum: '论坛',
    creation: '二创',
    event: '活动',
    shop: '灵蕴商城',
    user: '我的',
    admin: '后台',
    login: '登录',
  },

  navDescription: {
    home: '站点导览与主题令牌自检',
    news: '官方动态聚合，剧透内容自动遮罩',
    wiki: '影神图百科：妖王、人物与地点',
    guide: 'Boss、配装与结局攻略',
    map: '章节互动地图与收集点位',
    buildLab: '配装模拟器与属性实时计算',
    forum: '天命人交流版块',
    creation: '二创广场与授权标识',
    event: '赛季挑战与榜单',
    shop: '灵蕴商城与积分兑换',
    user: '个人主页与成长档案',
    admin: '演示后台：审核、看板与用户管理',
  },

  layout: {
    skipToContent: '跳到主要内容',
    openSidebar: '展开侧栏',
    collapseSidebar: '折叠侧栏',
    expandSidebar: '展开侧栏',
    themeLabel: '主题',
    spoilerLabel: '剧透内容',
    spoilerOn: '已显示',
    spoilerOff: '已隐藏',
    spoilerHint: '开启后展示剧情、结局与隐藏 Boss 信息（阶段 1 接入演示控制台）',
    backToSite: '返回前台',
    adminArea: '演示后台',
    plannedSections: '规划中的后台模块',
    building: '建设中',
  },

  theme: {
    ink: '墨黑',
    paper: '宣纸',
    contrast: '高对比',
  },

  placeholder: {
    /** 阶段 0 统一占位文案：「{{页面名}} · 建设中」 */
    default: (pageName: string): string => `${pageName} · 建设中`,
    hint: '本页将在后续阶段交付，当前仅验证路由与布局骨架。',
  },

  common: {
    loading: '灵蕴汇聚中…',
    empty: '此处空空如也',
    error: '灵蕴紊乱，请稍后重试',
    retry: '重试',
    backHome: '返回首页',
    tokenCheck: '主题令牌自检',
  },

  error: {
    unknown: '发生了未知错误',
    routeTitle: '此路不通',
    routeHint: '页面加载时出现异常，可返回首页重试。',
  },

  notFound: {
    title: '404 · 此页不在影神图中',
    hint: '你寻找的页面不存在，或已被妖怪吞了。',
  },

  forbidden: {
    title: '403 · 无资格入内',
    hint: '当前身份没有访问该区域的权限。演示模式可在阶段 1 的控制台切换身份。',
    currentRole: '当前身份',
  },
} as const;
