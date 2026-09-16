import type { NewsArticle, NewsCategory, NewsSource, NewsTag } from '@/data/contracts/news';
import type { SpoilerLevel } from '@/data/contracts/common';
import { buildSealCoverUrl } from '@/utils/sealCover';

/**
 * 资讯种子（协议阶段 2「资讯」模块）。
 *
 * ⚠️ 内容口径（重要）：本站是**非官方粉丝站**，因此这里没有一条是伪造的官方公告。
 * 内容分两类：
 * 1. `official` / `media` 类目是**聚合位**：标题与摘要描述「该渠道有哪些公开动态」，
 *    正文段落明确标注为演示数据，来源按钮指向真实渠道首页，评审可以点出去核对；
 * 2. 其余类目是**本站编辑内容**（source.kind = 'editorial'，没有站外链接）。
 * 页面顶部会常驻一句「演示数据，不代表任何官方信息」。
 *
 * 结构：先写紧凑输入表（用 daysAgo 相对今天定位时间），再统一展开成契约。
 */
interface NewsSeedInput {
  id: string;
  title: string;
  summary: string;
  body: readonly string[];
  category: NewsCategory;
  tags: readonly NewsTag[];
  source: NewsSource;
  /** 距今天数；配合 hoursAgo 让同一天内也有先后。 */
  daysAgo: number;
  hoursAgo?: number;
  spoilerLevel: SpoilerLevel;
  pinned?: boolean;
}

const SOURCE_STEAM: NewsSource = {
  name: 'Steam 商店页',
  url: 'https://store.steampowered.com/',
  kind: 'official',
};
const SOURCE_OFFICIAL_SITE: NewsSource = {
  name: '官方网站',
  url: 'https://www.heishenhua.com/',
  kind: 'official',
};
const SOURCE_WEIBO: NewsSource = { name: '官方微博', url: 'https://weibo.com/', kind: 'official' };
const SOURCE_BILIBILI: NewsSource = {
  name: '哔哩哔哩',
  url: 'https://www.bilibili.com/',
  kind: 'media',
};
const SOURCE_EDITORIAL: NewsSource = { name: '本站编辑部', url: null, kind: 'editorial' };
/** 活动组也是站内身份：没有站外链接，因此 kind 必须是 editorial（种子测试守着这条一致性）。 */
const SOURCE_EVENT: NewsSource = { name: '本站活动组', url: null, kind: 'editorial' };

export const NEWS_SEED_INPUTS: readonly NewsSeedInput[] = [
  {
    id: 'news-000',
    title: '演示数据说明：本站内容全部为本地模拟',
    summary:
      '本页聚合的「官方动态」是演示占位：标题描述渠道类型，正文为示例文案，来源按钮指向真实渠道首页，请以官方发布为准。',
    body: [
      '本站是非官方粉丝作品，没有任何真实后端，也不代表游戏科学或任何渠道方。',
      '资讯模块演示的是「聚合 + 标签筛选 + 剧透遮罩 + 来源跳转」这套交互，数据由本地 Mock 生成。',
      '想核对真实动态，请点击来源按钮跳到对应渠道；演示模式下外链会被拦截并提示，退出演示模式即可跳转。',
    ],
    category: 'official',
    tags: ['community'],
    source: SOURCE_EDITORIAL,
    daysAgo: 0,
    hoursAgo: 2,
    spoilerLevel: 0,
    pinned: true,
  },
  {
    id: 'news-001',
    title: '剧透保护机制上线：默认遮罩剧情与结局内容',
    summary: '含剧透的资讯不再被隐藏，而是被打上遮罩：你能看到「有这样一条」，内容需要手动揭开。',
    body: [
      '隐藏条目会让人误以为漏发新闻，遮罩既保住了信息完整性，也把内容挡在点击之后。',
      '遮罩支持全局开关（顶栏与演示控制台）与单条揭开两种粒度：全局给「已经通关的人」，单条给「只想看这一条的人」。',
    ],
    category: 'community',
    tags: ['community'],
    source: SOURCE_EDITORIAL,
    daysAgo: 0,
    hoursAgo: 6,
    spoilerLevel: 0,
    pinned: true,
  },
  {
    id: 'news-002',
    title: 'Steam 商店页版本更新记录',
    summary: '商店页的更新日志是版本信息最权威的来源之一；本站只做摘要与时间线整理。',
    body: [
      '演示数据：此处应为该渠道最近一次更新的要点摘要（平衡性调整、性能优化、已知问题）。',
      '版本类动态通常不含剧透，因此默认不遮罩；若摘要涉及剧情改动，会被标记为含剧情信息。',
    ],
    category: 'update',
    tags: ['version', 'balance'],
    source: SOURCE_STEAM,
    daysAgo: 1,
    hoursAgo: 3,
    spoilerLevel: 0,
  },
  {
    id: 'news-003',
    title: '官方网站公告栏动态',
    summary: '官网公告栏通常发布活动、联动与重要节点信息，是本模块聚合权重最高的渠道。',
    body: [
      '演示数据：此处为该渠道公开公告的摘要。',
      '官方渠道的表述以原文为准，本站只做索引与归档，避免转述失真。',
    ],
    category: 'official',
    tags: ['version'],
    source: SOURCE_OFFICIAL_SITE,
    daysAgo: 2,
    hoursAgo: 5,
    spoilerLevel: 0,
  },
  {
    id: 'news-004',
    title: '官方微博动态汇总',
    summary: '社交渠道更新频繁且碎片化，这里按周汇总一次，避免刷屏。',
    body: [
      '演示数据：此处应为该周的若干条动态要点。',
      '碎片信息更容易夹杂剧透，因此涉及剧情的内容会被打上含剧情标记。',
    ],
    category: 'official',
    tags: ['community'],
    source: SOURCE_WEIBO,
    daysAgo: 3,
    hoursAgo: 8,
    spoilerLevel: 0,
  },
  {
    id: 'news-005',
    title: 'B 站官方账号视频更新',
    summary: '视频渠道的更新多为实机片段、幕后花絮与活动宣传，摘要里会标注时长与类型。',
    body: [
      '演示数据：此处为该账号最近一次视频更新的摘要。',
      '实机片段往往包含未通关玩家不该看到的内容，这类条目默认按含剧情处理。',
    ],
    category: 'media',
    tags: ['art', 'community'],
    source: SOURCE_BILIBILI,
    daysAgo: 4,
    hoursAgo: 10,
    spoilerLevel: 1,
  },
  {
    id: 'news-006',
    title: '影神图补完计划：黄风岭新增 12 条词条',
    summary: '本站编辑组把黄风岭的妖怪、人物与地点补齐，并补上拼音索引与关联图谱。',
    body: [
      '新增词条覆盖黄风大圣、虎先锋、石先锋、沙国旧民与卧虎寺等地标。',
      '影神图支持按章节、类型与稀有度筛选，筛选条件写在 URL 上，可以直接分享某一组结果。',
    ],
    category: 'community',
    tags: ['guide', 'community'],
    source: SOURCE_EDITORIAL,
    daysAgo: 5,
    hoursAgo: 2,
    spoilerLevel: 0,
  },
  {
    id: 'news-007',
    title: '配装分享活动第一季：三套思路与背后的取舍',
    summary: '活动收到 40 余份配装，编辑组挑出三套思路差异最大的做拆解。',
    body: [
      '第一套走高棍势爆发，第二套靠定身术拉开节奏，第三套是纯防御流。',
      '配装模拟器会在后续版本支持分享链接与出图，届时活动投稿可以直接贴链接。',
    ],
    category: 'event',
    tags: ['guide', 'community'],
    source: SOURCE_EVENT,
    daysAgo: 6,
    hoursAgo: 6,
    spoilerLevel: 0,
  },
  {
    id: 'news-008',
    title: '版本平衡观察：棍势与法术的取舍变化',
    summary: '以现有公开资料为据，梳理棍势流与法术流的相对强度变化。',
    body: [
      '演示数据：这里的数值结论来自本站整理，不是官方平衡性说明。',
      '结论仅供参考，实际手感与敌人配置、地形强相关。',
    ],
    category: 'update',
    tags: ['balance', 'guide'],
    source: SOURCE_EDITORIAL,
    daysAgo: 7,
    spoilerLevel: 1,
  },
  {
    id: 'news-009',
    title: '隐藏成就「不杀一人」的三种达成路径',
    summary: '一整章不取一条性命，难点不在战斗，而在路线与耐心。',
    body: [
      '三种路径分别对应：纯潜行绕过、借环境击杀、以及利用敌人的互相攻击。',
      '本条含隐藏成就信息，已按含剧情处理。',
    ],
    category: 'community',
    tags: ['guide'],
    source: SOURCE_EDITORIAL,
    daysAgo: 8,
    hoursAgo: 4,
    spoilerLevel: 2,
  },
  {
    id: 'news-010',
    title: '速通路线整理：黑风山到黄风岭的最短动线',
    summary: '把两章之间的必经点连成一条线，并列出门槛与备选点。',
    body: [
      '路线以「少战斗、少绕路」为目标，牺牲了一部分收集效率。',
      '章节地图与点位标注会在互动地图模块里交付，届时路线可以直接在图上画出来。',
    ],
    category: 'community',
    tags: ['guide', 'community'],
    source: SOURCE_EDITORIAL,
    daysAgo: 9,
    hoursAgo: 7,
    spoilerLevel: 1,
  },
  {
    id: 'news-011',
    title: '赛季挑战报名开启：连续上香 5 天得限定勋章',
    summary: '成长中心的签到与任务体系接入活动：连续签到 5 天可领取限定勋章。',
    body: [
      '活动期间在成长中心完成「本周上香五日」任务即可领取，灵蕴奖励翻倍。',
      '活动全部逻辑跑在本地：数据存在你的浏览器里，随时可以在演示控制台重置。',
    ],
    category: 'event',
    tags: ['community', 'merch'],
    source: SOURCE_EVENT,
    daysAgo: 10,
    spoilerLevel: 0,
  },
  {
    id: 'news-012',
    title: '音乐赏析：主题曲里的三种节奏型',
    summary: '从鼓点结构入手，听主题曲如何在三段之间切换情绪。',
    body: [
      '第一段以低频鼓点铺底，第二段加入弦乐推进，第三段回到单一的节奏骨架收束。',
      '本文为粉丝向听感分析，不含官方创作说明。',
    ],
    category: 'media',
    tags: ['music', 'art'],
    source: SOURCE_EDITORIAL,
    daysAgo: 11,
    hoursAgo: 3,
    spoilerLevel: 0,
  },
  {
    id: 'news-013',
    title: '美术设定观察：影神图卡面纹样',
    summary: '卡面边框的纹样并非装饰：不同稀有度对应不同的纹路密度与描边粗细。',
    body: [
      '本站的影神图卡片沿用同一套思路：稀有度决定描边与配色，而非另加文字标注。',
      '设计令牌集中在 tokens.css，三套主题共用同一组变量。',
    ],
    category: 'media',
    tags: ['art'],
    source: SOURCE_EDITORIAL,
    daysAgo: 12,
    hoursAgo: 9,
    spoilerLevel: 0,
  },
  {
    id: 'news-014',
    title: '制作人访谈摘要（粉丝整理）',
    summary: '公开访谈中关于「为什么选择这个题材」与「如何取舍难度」的部分摘要。',
    body: [
      '演示数据：此处应为访谈原文的要点摘录，并附原文链接。',
      '转述难免失真，建议以访谈原文为准。',
    ],
    category: 'media',
    tags: ['interview'],
    source: SOURCE_BILIBILI,
    daysAgo: 14,
    hoursAgo: 5,
    spoilerLevel: 1,
  },
  {
    id: 'news-015',
    title: '实机片段逐帧观察：棍法动作拆解',
    summary: '把公开片段里的三段棍法逐帧拆开，标注起手、判定与收招。',
    body: [
      '观察结论用于配装模拟器的动作衔接假设，误差在所难免。',
      '片段本身涉及中后期敌人，本条按含剧情处理。',
    ],
    category: 'media',
    tags: ['art', 'guide'],
    source: SOURCE_BILIBILI,
    daysAgo: 16,
    spoilerLevel: 1,
  },
  {
    id: 'news-016',
    title: '同人二创精选：本期十件作品',
    summary: '本期精选十件二创，涵盖插画、短漫与手工，均已获得作者授权标识。',
    body: [
      '二创广场会给每件作品标注授权范围（可否转载、可否商用、是否允许二次创作）。',
      '尊重作者与版权方是本模块的第一原则。',
    ],
    category: 'community',
    tags: ['art', 'community'],
    source: SOURCE_EDITORIAL,
    daysAgo: 18,
    hoursAgo: 4,
    spoilerLevel: 0,
  },
  {
    id: 'news-017',
    title: '玩家提问合集：新手最常问的 12 个问题',
    summary: '从论坛提问里整理出高频问题，逐条给短答与延伸阅读。',
    body: [
      '问题集中在：难度选择、存档机制、剧透保护、以及配装入门。',
      '每条短答都指向对应的百科词条或攻略页，避免答案散落在评论区。',
    ],
    category: 'community',
    tags: ['guide', 'community'],
    source: SOURCE_EDITORIAL,
    daysAgo: 20,
    spoilerLevel: 0,
  },
  {
    id: 'news-018',
    title: '论坛版规 v1：剧透、转载与二创授权',
    summary: '版规明确了三件事：剧透必须标级别、转载必须给出处、二创必须标授权。',
    body: [
      '发帖时可以选择剧透级别，含剧透的帖子默认折叠正文。',
      '版规与举报流程会在论坛模块交付时一并上线。',
    ],
    category: 'community',
    tags: ['community'],
    source: SOURCE_EDITORIAL,
    daysAgo: 22,
    hoursAgo: 8,
    spoilerLevel: 0,
  },
  {
    id: 'news-019',
    title: '主题讨论：你心中的第六章',
    summary: '第六章的评价两极，本期挑了六篇长评并给出编辑视角的补充。',
    body: [
      '讨论集中在节奏与结局处理两点上，本文尽量保留不同立场。',
      '本条含结局级信息，默认遮罩。',
    ],
    category: 'community',
    tags: ['community'],
    source: SOURCE_EDITORIAL,
    daysAgo: 24,
    spoilerLevel: 2,
  },
  {
    id: 'news-020',
    title: '互动地图标注规范（草案）',
    summary: '为了让收集点标注可比对，草案规定了点位命名、坐标精度与图层归属。',
    body: [
      '图层分为收集点、打坐点、妖王与商人四类，与收集追踪模块共用一套分类。',
      '草案向社区征集意见，评论区可直接讨论。',
    ],
    category: 'community',
    tags: ['guide', 'community'],
    source: SOURCE_EDITORIAL,
    daysAgo: 26,
    hoursAgo: 6,
    spoilerLevel: 0,
  },
  {
    id: 'news-021',
    title: '周边晒单合集（演示数据）',
    summary: '本期晒单包含画册、徽章与手工道具，均为演示用示例内容。',
    body: [
      '演示数据：真实投稿需在二创广场提交并勾选授权范围。',
      '商城模块上线后，灵蕴可以兑换虚拟勋章与头像框。',
    ],
    category: 'community',
    tags: ['merch'],
    source: SOURCE_EDITORIAL,
    daysAgo: 28,
    spoilerLevel: 0,
  },
  {
    id: 'news-022',
    title: '二创广场作品授权标识说明',
    summary: '每件作品都会带上授权标识，转载与二次创作前请先看清范围。',
    body: [
      '授权标识分三档：仅展示、允许转载（署名）、允许二创（署名且非商用）。',
      '平台方与版权方的权利边界在页脚声明里写清楚了。',
    ],
    category: 'community',
    tags: ['art', 'community'],
    source: SOURCE_EDITORIAL,
    daysAgo: 30,
    hoursAgo: 3,
    spoilerLevel: 0,
  },
  {
    id: 'news-023',
    title: '展会现场速报：试玩区排队实况',
    summary: '展会试玩区的排队与体验反馈摘要，含现场照片描述。',
    body: [
      '演示数据：此处应为展会现场记录，照片以文字描述替代（本站不引入二进制素材）。',
      '现场体验与正式版本可能存在差异。',
    ],
    category: 'media',
    tags: ['community'],
    source: SOURCE_WEIBO,
    daysAgo: 32,
    hoursAgo: 9,
    spoilerLevel: 0,
  },
  {
    id: 'news-024',
    title: '六月活动预告：影神图征集',
    summary: '征集社区自制的词条卡面设计，入选作品会进入影神图展示位。',
    body: [
      '征集不涉及官方素材的再分发，投稿需为原创且标注授权范围。',
      '评选标准：辨识度、与现有卡面的一致性、以及对原作的尊重。',
    ],
    category: 'event',
    tags: ['art', 'community'],
    source: SOURCE_EVENT,
    daysAgo: 34,
    spoilerLevel: 0,
  },
  {
    id: 'news-025',
    title: '上一次活动的获奖名单与作品回顾',
    summary: '上一季活动的获奖名单与作品回顾，附评审要点。',
    body: [
      '获奖作品在三项评审维度上都表现均衡，评审要点已整理成清单。',
      '灵蕴奖励已通过成长中心的站内信发放。',
    ],
    category: 'event',
    tags: ['community', 'merch'],
    source: SOURCE_EVENT,
    daysAgo: 36,
    hoursAgo: 5,
    spoilerLevel: 0,
  },
  {
    id: 'news-026',
    title: '剧情向问答：三个常见误解',
    summary: '整理社区里反复出现的三个剧情误解，逐条给出依据与出处。',
    body: ['误解多来自转述失真，本文给出可核对的信息位置。', '本条涉及关键剧情，默认遮罩。'],
    category: 'community',
    tags: ['guide'],
    source: SOURCE_EDITORIAL,
    daysAgo: 40,
    spoilerLevel: 2,
  },
  {
    id: 'news-027',
    title: '站点更新日志：演示系统与快照导出',
    summary: '本次更新带来可分享的演示链接、数据快照导入导出与操作路径录制。',
    body: [
      '演示链接把状态写在 URL 上：身份、界面状态、主题、剧透开关都能一条链接复现。',
      '快照可以把本地库与 hmw: 存储一起备份，换台机器导入后完全还原。',
    ],
    category: 'update',
    tags: ['version', 'community'],
    source: SOURCE_EDITORIAL,
    daysAgo: 44,
    hoursAgo: 4,
    spoilerLevel: 0,
  },
];

const CATEGORY_GLYPH: Record<NewsCategory, string> = {
  official: '官',
  update: '版',
  event: '赛',
  media: '影',
  community: '坛',
};

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** 展开成契约：补上封面、发布时间与默认值。 */
export function createNewsSeed(now: Date): NewsArticle[] {
  return NEWS_SEED_INPUTS.map((input) => ({
    id: input.id,
    title: input.title,
    summary: input.summary,
    body: input.body,
    category: input.category,
    tags: input.tags,
    source: input.source,
    publishedAt: new Date(
      now.getTime() - input.daysAgo * DAY_MS - (input.hoursAgo ?? 0) * HOUR_MS,
    ).toISOString(),
    spoilerLevel: input.spoilerLevel,
    pinned: input.pinned ?? false,
    coverUrl: buildSealCoverUrl(input.title, CATEGORY_GLYPH[input.category]),
  }));
}

export const NEWS_SEED_COUNT = NEWS_SEED_INPUTS.length;
