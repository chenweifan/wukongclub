import { faker } from '@faker-js/faker';

import type { CheckInRecord } from '@/data/contracts/growth';
import type { NotificationRecord, TaskRecord } from '@/data/db/records';
import {
  addDays,
  buildDateRange,
  calcCheckInReward,
  resolvePeriodKey,
  toDateKey,
} from '@/utils/checkInRules';

/**
 * 成长域种子：签到历史、任务、消息。
 * 全部基于固定 seed 生成，同 (参数, 日期) 必然得到相同数据（协议要求可复现）。
 */

export const CHECK_IN_SEED_DAYS = 42;
export const CHECK_IN_STREAK_TAIL = 6;
export const CHECK_IN_EXTRA_RATIO = 0.45;

export interface CheckInHistoryOptions {
  /** 总天数（含今天），默认 42 天，够喂满 30 天日历还有富余。 */
  days?: number;
  /** 最近连续签到的天数。 */
  streakTail?: number;
  /** 更早日子的随机签到概率（固定 seed，因此可复现）。 */
  extraRatio?: number;
  seed?: number;
}

/**
 * 生成签到历史。
 * 最近 streakTail 天一定签到（形成可见的连续天数），更早的日子按概率散布，
 * 这样日历上既有连续段也有断点 —— 空态与断签逻辑都能被真实数据覆盖。
 */
export function createCheckInHistory(
  userId: string,
  today: Date,
  options: CheckInHistoryOptions = {},
): CheckInRecord[] {
  const {
    days = CHECK_IN_SEED_DAYS,
    streakTail = CHECK_IN_STREAK_TAIL,
    extraRatio = CHECK_IN_EXTRA_RATIO,
    seed = 42,
  } = options;

  faker.seed(seed);
  const dateKeys = buildDateRange(today, days);
  const records: CheckInRecord[] = [];
  let streak = 0;

  for (const [index, dateKey] of dateKeys.entries()) {
    const fromEnd = dateKeys.length - 1 - index;
    const checked = fromEnd < streakTail || faker.datatype.boolean(extraRatio);

    if (!checked) {
      streak = 0;
      continue;
    }

    streak += 1;
    records.push({
      id: `${userId}:${dateKey}`,
      userId,
      date: dateKey,
      at: new Date(`${dateKey}T09:00:00`).toISOString(),
      streak,
      reward: calcCheckInReward(streak),
    });
  }

  return records;
}

export interface TaskTemplate {
  key: string;
  kind: TaskRecord['kind'];
  title: string;
  description: string;
  target: number;
  reward: number;
}

/**
 * 任务模板（章节/系统名取自游戏内真实内容，文案为本项目原创）。
 * progress 起点在生成时决定：有的可直接领取、有的进行中、有的还是 0。
 */
export const TASK_TEMPLATES: readonly TaskTemplate[] = [
  {
    key: 'incense',
    kind: 'daily',
    title: '土地庙上香',
    description: '每日到土地庙上一炷香，续上连续天数。',
    target: 1,
    reward: 10,
  },
  {
    key: 'browse-news',
    kind: 'daily',
    title: '翻阅三则资讯',
    description: '在资讯页读完三则官方动态。',
    target: 3,
    reward: 15,
  },
  {
    key: 'like-post',
    kind: 'daily',
    title: '为同门点赞',
    description: '给论坛里的一个帖子点个赞。',
    target: 1,
    reward: 10,
  },
  {
    key: 'share-build',
    kind: 'weekly',
    title: '分享一套配装',
    description: '用配装模拟器导出一套方案并分享。',
    target: 1,
    reward: 60,
  },
  {
    key: 'streak-week',
    kind: 'weekly',
    title: '本周上香五日',
    description: '本周累计签到五天，土地公记得你。',
    target: 5,
    reward: 80,
  },
  {
    key: 'no-kill',
    kind: 'hidden',
    title: '不杀一人',
    description: '隐藏成就：一整章不取一条性命。',
    target: 1,
    reward: 120,
  },
  {
    key: 'codex-full',
    kind: 'hidden',
    title: '影神图藏家',
    description: '隐藏成就：集齐一个章节的全部词条。',
    target: 1,
    reward: 150,
  },
];

/**
 * 生成任务记录。
 * initialProgress 决定演示形态：默认让「上香」已完成可领取、其余进行中或未开始。
 */
export function createTaskRecords(
  userId: string,
  today: Date,
  options: { initialProgress?: Record<string, number>; claimedKeys?: readonly string[] } = {},
): TaskRecord[] {
  const { initialProgress = { incense: 1 }, claimedKeys = [] } = options;
  const weekStart = addDays(today, 6);
  const weeklyExpiry = new Date(`${toDateKey(weekStart)}T23:59:59`).toISOString();

  return TASK_TEMPLATES.map((template) => {
    const claimed = claimedKeys.includes(template.key);
    const progress = Math.min(initialProgress[template.key] ?? 0, template.target);

    return {
      id: `${userId}:task:${template.key}`,
      userId,
      kind: template.kind,
      title: template.title,
      description: template.description,
      progress,
      target: template.target,
      reward: template.reward,
      claimed,
      periodKey: resolvePeriodKey(template.kind, today),
      expiresAt: template.kind === 'weekly' ? weeklyExpiry : null,
    };
  });
}

/** 新用户只有日常与周常，隐藏成就要靠自己挖出来。 */
export function createStarterTaskRecords(userId: string, today: Date): TaskRecord[] {
  return createTaskRecords(userId, today, { initialProgress: {} }).filter(
    (task) => task.kind !== 'hidden',
  );
}

/* ── 消息 ─────────────────────────────────────────────────────────── */

const PEER_NAMES = [
  '持棍的樵夫',
  '黄风岭过客',
  '盘丝岭织者',
  '火焰山挑夫',
  '花果山旧友',
  '小西天沙弥',
  '黑风山猎户',
  '不肯过桥的僧',
] as const;

export interface NotificationSeedOptions {
  seed?: number;
  /** 最近一条消息距今天的小时数，用于让时间线看起来自然。 */
  newestHoursAgo?: number;
}

export function createNotificationRecords(
  userId: string,
  now: Date,
  options: NotificationSeedOptions = {},
): NotificationRecord[] {
  const { seed = 42, newestHoursAgo = 1 } = options;
  faker.seed(seed);

  const hour = 60 * 60 * 1000;
  const templates: readonly Omit<NotificationRecord, 'id' | 'userId' | 'createdAt' | 'read'>[] = [
    {
      category: 'system',
      title: '演示数据每周重置',
      body: '本站所有数据都保存在你自己的浏览器里，演示控制台可随时重置或导出快照。',
      link: null,
    },
    {
      category: 'achievement',
      title: '解锁成就：黑风山初战',
      body: '你在黑风山击退了守关妖王，奖励 120 灵蕴。',
      link: '/user',
    },
    {
      category: 'reply',
      title: `${faker.helpers.arrayElement(PEER_NAMES)} 回复了你的帖子`,
      body: '「这套配装我也在用，棍势接得挺顺。」',
      link: '/forum',
    },
    {
      category: 'like',
      title: `${faker.helpers.arrayElement(PEER_NAMES)} 赞了你的配装`,
      body: '《黑风山速通：棍势与定身术的取舍》获得 1 个赞。',
      link: '/build-lab',
    },
    {
      category: 'follow',
      title: `${faker.helpers.arrayElement(PEER_NAMES)} 关注了你`,
      body: '对方说：以后一起走黄风岭。',
      link: '/user',
    },
    {
      category: 'system',
      title: '影神图词条已更新',
      body: '黄风岭新增 3 个词条，去百科看看有没有漏掉的妖王。',
      link: '/wiki',
    },
    {
      category: 'achievement',
      title: '连续上香 5 天',
      body: '土地公记住了你的名字，奖励 80 灵蕴。',
      link: '/user',
    },
    {
      category: 'reply',
      title: `${faker.helpers.arrayElement(PEER_NAMES)} 在你的攻略下追问`,
      body: '「第二阶段的定身术时机能不能再细说？」',
      link: '/guide',
    },
    {
      category: 'like',
      title: `${faker.helpers.arrayElement(PEER_NAMES)} 等 3 人赞了你的帖子`,
      body: '《不杀一人通关黑风山可行吗》热度上升中。',
      link: '/forum',
    },
    {
      category: 'system',
      title: '灵蕴商城上新预告',
      body: '勋章与头像框将在活动季开放兑换，先去攒灵蕴。',
      link: '/shop',
    },
  ];

  return templates.map((template, index) => ({
    ...template,
    id: `${userId}:notification:${index}`,
    userId,
    createdAt: new Date(now.getTime() - (newestHoursAgo + index * 7) * hour).toISOString(),
    // 前四条未读、其余已读：让「未读红点」与「仅未读」筛选都有内容
    read: index >= 4,
  }));
}

/** 新用户的欢迎消息。 */
export function createWelcomeNotification(
  userId: string,
  now: Date,
  displayName: string,
): NotificationRecord {
  return {
    id: `${userId}:notification:welcome`,
    userId,
    category: 'system',
    title: `欢迎来到粉丝站，${displayName}`,
    body: '去土地庙上第一炷香，连续签到可以拿到更多灵蕴。',
    createdAt: now.toISOString(),
    read: false,
    link: '/user',
  };
}
