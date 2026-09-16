/**
 * 用户可见文案集中管理（协议架构铁律 6）。
 * 逻辑代码里不得出现中文硬编码，一律从这里取。
 * 演示专用文案（场景描述、引导话术）在 src/demo/fixtures 与 src/demo/scenarios。
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
    spoilerHint: '开启后展示剧情、结局与隐藏 Boss 信息',
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
    tokenCheckHint:
      '色块均绑定 CSS 变量令牌（tokens.css）；切换主题时整组应同步变化，说明没有硬编码色值漏网。',
    close: '关闭',
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
    hint: '当前身份没有访问该区域的权限。可在演示控制台切换身份后重试。',
    currentRole: '当前身份',
  },

  /** 统一异步边界的默认槽位文案。 */
  boundary: {
    errorTitle: '灵蕴紊乱，数据没能取回来',
    offlineTitle: '网络已断开',
    offlineDescription:
      '演示控制台把界面状态切成了「断网」，所有请求都会立即失败。恢复后点重试即可。',
    emptyTitle: '此处空空如也',
    emptyDescription: '当前没有任何数据。可在演示控制台切换「填满数据」后再看。',
  },

  /** 破坏性操作统一二次确认（协议铁律 7）。 */
  confirm: {
    confirmText: '确认执行',
    cancelText: '取消',
    dangerHint: '该操作不可撤销',
  },

  /** 演示模式与控制台文案。 */
  demo: {
    banner: '演示模式 · 数据为本地模拟',
    bannerHint: '全部状态都在 URL 上，复制链接即可复现当前界面',
    enterDemo: '进入演示模式',
    exitDemo: '退出演示模式',
    consoleTitle: '演示控制台',
    openConsole: '打开演示控制台',
    closeConsole: '收起演示控制台',
    expandSection: '展开',
    collapseSection: '收起',
    linkCopied: '演示链接已复制，换台机器打开也是同一状态',
    linkCopyFailed: '复制失败，请手动复制地址栏链接',
    cleanMode: '截图模式',
    cleanHint: '隐藏控制台与顶部提示条，方便截图',
    section: {
      identity: '身份',
      uiState: '界面状态',
      theme: '主题',
      spoiler: '剧透',
      data: '数据',
      guide: '引导',
      scenario: '场景',
      tools: '工具',
    },
    sectionHint: {
      identity: '身份决定权限与可见内容，RequireRole 守卫读的就是它',
      uiState: '统一覆盖所有异步 UI，StateBoundary 优先服从它',
      theme: '三套主题共用一套设计令牌，切换即整体换肤',
      spoiler: '开启后展示剧情、结局与隐藏 Boss 信息',
      data: '数据保存在浏览器本地：IndexedDB + localStorage',
      guide: '分步引导会跨页跳转并高亮界面元素，支持 ← → 与 Esc',
      scenario: '一键切到某个典型演示现场',
      tools: '辅助调试与截图',
    },
    role: {
      guest: '访客',
      newbie: '新入天命人',
      active: '活跃天命人',
      moderator: '版主',
      admin: '管理员',
      banned: '封禁',
    },
    uiState: {
      normal: '正常',
      empty: '空数据',
      loading: '加载中',
      error: '错误',
      slow: '慢速网络',
      offline: '断网',
    },
    data: {
      reset: '重置',
      fill: '填满',
      clear: '清空',
      export: '导出快照',
      import: '导入快照',
      baselineHint: '首次进入会自动播种 12 条探针数据；快照可把本地库与 hmw: 存储一起备份。',
      resetConfirmTitle: '重置本地数据？',
      resetConfirmDescription: '会清空本地库并写回基线种子数据（12 条探针）。',
      fillConfirmTitle: '填充演示数据？',
      fillConfirmDescription: '会清空本地库并写入 60 条探针数据，用于验证长列表。',
      clearConfirmTitle: '清空全部本地数据？',
      clearConfirmDescription:
        '本地库与所有 hmw: 开头的本地存储都会被清空，包括主题、侧栏偏好与勾选记录。',
      seeded: (count: number): string => `已写入 ${count} 条演示数据`,
      cleared: '本地数据已清空',
      exported: '快照已开始下载（JSON）',
      imported: (rows: number, keys: number): string =>
        `快照导入完成：${rows} 条数据库记录、${keys} 个本地存储键已还原`,
      importFailed: '快照文件无法解析或版本不兼容',
      importEmpty: '没有选择文件',
    },
    scenario: {
      label: '预设场景',
      apply: '应用场景',
      applied: (name: string): string => `已切到场景：${name}`,
      unknown: '未找到该场景',
    },
    tour: {
      label: '引导剧本',
      start: '启动引导',
      unknown: '未找到该引导剧本',
      next: '下一步',
      previous: '上一步',
      done: '完成',
      close: '退出引导',
      progress: '第 {{current}} / {{total}} 步',
      missingElement: '这一步的目标元素没出现，已跳过高亮',
    },
    tools: {
      grid: '布局栅格',
      outline: '组件边界',
      perf: '性能面板',
      record: '操作记录',
      copyLink: '复制演示链接',
    },
    record: {
      enabled: '正在记录操作路径（record=1）',
      count: (count: number): string => `已记录 ${count} 条`,
      export: '导出记录',
      clear: '清空记录',
      exported: '操作记录已下载（JSON）',
      cleared: '操作记录已清空',
    },
    externalLinkBlocked: (url: string): string => `演示模式已拦截外链跳转：${url}`,
    spoilerOn: '剧透内容已显示',
    spoilerOff: '剧透内容已隐藏',
  },

  /** 演示探针自检面板文案。 */
  probe: {
    title: '演示系统自检 · 探针列表',
    description:
      '这一块是阶段 1 的自检面板：它真实走「Repository → MSW → IndexedDB」链路，用来验证加载 / 空 / 错误 / 断网 / 慢速五种状态，以及写操作持久化与快照备份。阶段 2 起会被真实业务列表取代。',
    countLabel: (total: number): string => `共 ${total} 条探针`,
    toggle: (label: string, collected: boolean): string =>
      `${collected ? '取消勾选' : '勾选'} ${label}`,
    collected: '已勾选',
    notCollected: '未勾选',
    updateFailed: '勾选失败，请重试',
    updateDone: '已更新勾选状态',
  },

  /** 性能面板文案（工具分区）。 */
  perf: {
    title: '性能面板',
    fps: '帧率',
    domNodes: 'DOM 节点',
    queryCache: 'Query 缓存',
    heap: 'JS 堆',
    unavailable: '不可用',
  },
} as const;
