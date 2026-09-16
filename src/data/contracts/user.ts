import { isRecord } from '@/data/contracts/common';

/**
 * 用户与身份契约（协议阶段 2「用户成长与登录」模块）。
 *
 * 设计说明：
 * - 演示站没有真实后端，`User` 是**对外**形状；密码摘要只存在于 mocks 层的
 *   UserRecord 里，绝不进入契约（避免前端任何地方接触到它）。
 * - 修行境界（rank）与等级由 exp 纯函数推导，服务端只返回 exp，
 *   这样境界规则调整时不必回填历史数据。
 */

/** 修行境界：从凡体到齐天，六档（称号与描述均为本项目原创文案）。 */
export const CULTIVATION_RANK_IDS = [
  'mortal',
  'gatekeeper',
  'walker',
  'demonSlayer',
  'greatSage',
  'equalHeaven',
] as const;

export type CultivationRankId = (typeof CULTIVATION_RANK_IDS)[number];

export interface CultivationRank {
  id: CultivationRankId;
  name: string;
  /** 进入该境界所需的最低修为。 */
  minExp: number;
  blurb: string;
}

export const CULTIVATION_RANKS: readonly CultivationRank[] = [
  { id: 'mortal', name: '凡体', minExp: 0, blurb: '尚未踏入山门，先学会握紧棍子。' },
  { id: 'gatekeeper', name: '山门客', minExp: 120, blurb: '守门三日，认得清谁是妖、谁是客。' },
  { id: 'walker', name: '行者', minExp: 480, blurb: '踏遍黑风山与黄风岭，开始记路。' },
  { id: 'demonSlayer', name: '降妖者', minExp: 1200, blurb: '小西天问过禅，盘丝岭上破过茧。' },
  { id: 'greatSage', name: '大圣', minExp: 2600, blurb: '火焰山熄焰之后，影神图已收全大半。' },
  { id: 'equalHeaven', name: '齐天', minExp: 5200, blurb: '花果山归乡，此身已不受约束。' },
];

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  /** 对应章节；null 表示与章节无关的通用成就。 */
  chapter: string | null;
  /** 未解锁为 null。 */
  unlockedAt: string | null;
}

export interface User {
  id: string;
  username: string;
  /** 道号（可重复，展示用）。 */
  displayName: string;
  /** 当前佩戴的称号。 */
  title: string;
  /** 单字印章头像：项目不依赖图片资源，用字 + 令牌色即可。 */
  avatarGlyph: string;
  bio: string;
  exp: number;
  /** 灵蕴积分，用于阶段 3 的商城兑换。 */
  spiritPoints: number;
  joinedAt: string;
  badges: readonly UserBadge[];
}

export interface AuthSession {
  token: string;
  userId: string;
  issuedAt: string;
}

export interface AuthResult {
  user: User;
  session: AuthSession;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  displayName: string;
  password: string;
}

/* ── 运行时守卫：所有响应体都是 unknown，先收敛再使用（协议铁律 9） ────── */

export function isUserBadge(value: unknown): value is UserBadge {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.description === 'string' &&
    (value.chapter === null || typeof value.chapter === 'string') &&
    (value.unlockedAt === null || typeof value.unlockedAt === 'string')
  );
}

export function isUser(value: unknown): value is User {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.username === 'string' &&
    typeof value.displayName === 'string' &&
    typeof value.title === 'string' &&
    typeof value.avatarGlyph === 'string' &&
    typeof value.bio === 'string' &&
    typeof value.exp === 'number' &&
    typeof value.spiritPoints === 'number' &&
    typeof value.joinedAt === 'string' &&
    Array.isArray(value.badges) &&
    value.badges.every((badge) => isUserBadge(badge))
  );
}

export function isAuthSession(value: unknown): value is AuthSession {
  return (
    isRecord(value) &&
    typeof value.token === 'string' &&
    typeof value.userId === 'string' &&
    typeof value.issuedAt === 'string'
  );
}

export function isAuthResult(value: unknown): value is AuthResult {
  return isRecord(value) && isUser(value.user) && isAuthSession(value.session);
}

/* ── 表单校验：UI 与 mock 后端共用同一套规则，避免「前端过了后端不过」 ────── */

export const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,16}$/;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 16;
export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 32;
export const DISPLAY_NAME_MAX_LENGTH = 12;

export type ValidationResult = { ok: true } | { ok: false; message: string };

export const VALIDATION_MESSAGES = {
  username: `用户名需为 ${USERNAME_MIN_LENGTH}–${USERNAME_MAX_LENGTH} 位字母、数字或下划线`,
  displayName: `道号需为 1–${DISPLAY_NAME_MAX_LENGTH} 个字符`,
  password: `密码需为 ${PASSWORD_MIN_LENGTH}–${PASSWORD_MAX_LENGTH} 位`,
  passwordMismatch: '两次输入的密码不一致',
} as const;

export function validateUsername(value: string): ValidationResult {
  return USERNAME_PATTERN.test(value)
    ? { ok: true }
    : { ok: false, message: VALIDATION_MESSAGES.username };
}

export function validateDisplayName(value: string): ValidationResult {
  const trimmed = value.trim();
  return trimmed.length >= 1 && trimmed.length <= DISPLAY_NAME_MAX_LENGTH
    ? { ok: true }
    : { ok: false, message: VALIDATION_MESSAGES.displayName };
}

export function validatePassword(value: string): ValidationResult {
  return value.length >= PASSWORD_MIN_LENGTH && value.length <= PASSWORD_MAX_LENGTH
    ? { ok: true }
    : { ok: false, message: VALIDATION_MESSAGES.password };
}

export function validateRegisterInput(input: {
  username: string;
  displayName: string;
  password: string;
  passwordConfirm: string;
}): ValidationResult {
  const username = validateUsername(input.username);
  if (!username.ok) {
    return username;
  }

  const displayName = validateDisplayName(input.displayName);
  if (!displayName.ok) {
    return displayName;
  }

  const password = validatePassword(input.password);
  if (!password.ok) {
    return password;
  }

  return input.password === input.passwordConfirm
    ? { ok: true }
    : { ok: false, message: VALIDATION_MESSAGES.passwordMismatch };
}
