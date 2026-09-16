import type { UserBadge } from '@/data/contracts/user';
import type { UserRecord } from '@/data/db/records';
import { digestPassword } from '@/data/mocks/passwordDigest';
import {
  DEMO_AVATAR_GLYPH,
  DEMO_DISPLAY_NAME,
  DEMO_PASSWORD,
  DEMO_TITLE,
  DEMO_USER_ID,
  DEMO_USERNAME,
} from '@/data/seeds/demoAccount';

/**
 * 演示账号种子（协议：种子数据基于黑神话真实内容）。
 * 昵称、称号都是本项目原创文案；章节名取自游戏内真实地名。
 *
 * 常量住在 demoAccount.ts（零依赖）：登录页只需要账号口令，
 * 不该为了两个字符串把本模块（连同 faker）拉进它的 chunk。
 */
export {
  DEMO_AVATAR_GLYPH,
  DEMO_CREDENTIALS,
  DEMO_DISPLAY_NAME,
  DEMO_PASSWORD,
  DEMO_TITLE,
  DEMO_USER_ID,
  DEMO_USERNAME,
} from '@/data/seeds/demoAccount';

/** 六个章节徽章 + 两个隐藏成就（隐藏成就 chapter 为 null）。 */
export const BADGE_TEMPLATES: readonly Omit<UserBadge, 'unlockedAt'>[] = [
  {
    id: 'badge-heifeng',
    name: '黑风山初战',
    description: '初次击退黑风山的守关妖王。',
    chapter: '黑风山',
  },
  {
    id: 'badge-huangfeng',
    name: '黄风岭定风',
    description: '在黄风岭取下定风珠，止住漫天黄沙。',
    chapter: '黄风岭',
  },
  {
    id: 'badge-xiaoxitian',
    name: '小西天问禅',
    description: '在小西天听完一段禅机，仍未参透。',
    chapter: '小西天',
  },
  {
    id: 'badge-pansi',
    name: '盘丝岭破茧',
    description: '从盘丝岭的蛛网中脱身。',
    chapter: '盘丝岭',
  },
  {
    id: 'badge-huoyan',
    name: '火焰山熄焰',
    description: '熄灭火焰山的山火，借来一柄好扇。',
    chapter: '火焰山',
  },
  {
    id: 'badge-huaguo',
    name: '花果山归乡',
    description: '回到花果山，见旧时石座。',
    chapter: '花果山',
  },
  {
    id: 'badge-pacifist',
    name: '不杀一人',
    description: '隐藏成就：一整章不取一条性命。',
    chapter: null,
  },
  {
    id: 'badge-collector',
    name: '影神图藏家',
    description: '隐藏成就：集齐一个章节的全部词条。',
    chapter: null,
  },
];

const DAY_MS = 24 * 60 * 60 * 1000;

/** 前 unlockedCount 个徽章视为已解锁，时间按顺序往前排，保证「越早越靠前」。 */
export function buildBadges(unlockedCount: number, now: Date): UserBadge[] {
  const safeCount = Math.min(Math.max(0, Math.floor(unlockedCount)), BADGE_TEMPLATES.length);

  return BADGE_TEMPLATES.map((template, index) => ({
    ...template,
    unlockedAt:
      index < safeCount
        ? new Date(now.getTime() - (safeCount - index) * 3 * DAY_MS).toISOString()
        : null,
  }));
}

export interface DemoUserOptions {
  now: Date;
  exp?: number;
  spiritPoints?: number;
  unlockedBadges?: number;
}

export function createDemoUserRecord(options: DemoUserOptions): UserRecord {
  const { now, exp = 640, spiritPoints = 320, unlockedBadges = 4 } = options;

  return {
    id: DEMO_USER_ID,
    username: DEMO_USERNAME,
    displayName: DEMO_DISPLAY_NAME,
    title: DEMO_TITLE,
    avatarGlyph: DEMO_AVATAR_GLYPH,
    bio: '非官方粉丝站的第一位天命人，正在把走过的路记成影神图。',
    exp,
    spiritPoints,
    joinedAt: new Date(now.getTime() - 96 * DAY_MS).toISOString(),
    badges: buildBadges(unlockedBadges, now),
    passwordDigest: digestPassword(DEMO_PASSWORD),
  };
}

/** 注册新用户时的默认头像字：从道号里取第一个字，取不到就用固定字。 */
export function pickAvatarGlyph(displayName: string): string {
  const first = [...displayName.trim()][0];
  return first ?? '悟';
}

/** 新用户初始称号池：让「刚注册」也有点身份感。 */
export const STARTER_TITLES = ['初入山门', '山门客', '持棍的旅人', '还未开眼的行者'] as const;

/**
 * 按 seed 稳定挑选初始称号。
 * 刻意不用 faker：4 选 1 不属于「长尾数据」，而本模块被注册流程静态引用，
 * 拉进 faker 会让它在启动路径上平白多出几百 KB。
 */
export function pickStarterTitle(seed: number): string {
  const index = Math.abs(Math.floor(seed)) % STARTER_TITLES.length;
  return STARTER_TITLES[index] ?? STARTER_TITLES[0];
}
