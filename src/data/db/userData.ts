import { HttpError } from '@/data/HttpError';
import type { LoginInput, RegisterInput } from '@/data/contracts/user';
import { hmwDb } from '@/data/db/hmwDb';
import type { UserRecord } from '@/data/db/records';
import { digestPassword, verifyPassword } from '@/data/mocks/passwordDigest';
import {
  DEMO_USERNAME,
  createDemoUserRecord,
  pickAvatarGlyph,
  pickStarterTitle,
} from '@/data/seeds/user.seed';

/**
 * 用户表的数据操作（mock 后端的「用户服务」）。
 * handler 只做 HTTP 层的翻译，业务规则（唯一性、口令校验、积分发放）都在这里，
 * 因此这些规则可以被单测直接覆盖，不必绕过 HTTP。
 */

export const STARTER_EXP = 0;
export const STARTER_SPIRIT_POINTS = 50;

export async function findUserByUsername(username: string): Promise<UserRecord | null> {
  const record = await hmwDb.users.where('username').equals(username).first();
  return record ?? null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const record = await hmwDb.users.get(id);
  return record ?? null;
}

/** 演示账号：不存在就创建。幂等，可反复调用（重置数据后会重新长出来）。 */
export async function ensureDemoUser(now: Date): Promise<UserRecord> {
  const existing = await findUserByUsername(DEMO_USERNAME);
  if (existing !== null) {
    return existing;
  }

  const record = createDemoUserRecord({ now });
  await hmwDb.users.put(record);
  return record;
}

export async function registerUser(input: RegisterInput, now: Date): Promise<UserRecord> {
  const existing = await findUserByUsername(input.username);
  if (existing !== null) {
    throw new HttpError(409, '该用户名已被占用', { code: 'USERNAME_TAKEN' });
  }

  const record: UserRecord = {
    id: `user-${now.getTime().toString(36)}-${Math.round(Math.random() * 1e6).toString(36)}`,
    username: input.username,
    displayName: input.displayName,
    title: pickStarterTitle(now.getTime() % 9973),
    avatarGlyph: pickAvatarGlyph(input.displayName),
    bio: '刚踏进山门，还没想好要去哪座山。',
    exp: STARTER_EXP,
    spiritPoints: STARTER_SPIRIT_POINTS,
    joinedAt: now.toISOString(),
    badges: [],
    passwordDigest: digestPassword(input.password),
  };

  await hmwDb.users.put(record);
  return record;
}

/** 登录校验：用户不存在与口令错误返回同一文案，避免暴露账号是否存在。 */
export async function authenticate(input: LoginInput): Promise<UserRecord> {
  const record = await findUserByUsername(input.username);

  if (record === null || !verifyPassword(input.password, record.passwordDigest)) {
    throw new HttpError(401, '用户名或密码不正确', { code: 'INVALID_CREDENTIALS' });
  }

  return record;
}

export async function grantRewards(
  userId: string,
  rewards: { spiritPoints?: number; exp?: number },
): Promise<UserRecord> {
  const record = await findUserById(userId);

  if (record === null) {
    throw new HttpError(404, '用户不存在', { code: 'USER_NOT_FOUND' });
  }

  const updated: UserRecord = {
    ...record,
    spiritPoints: record.spiritPoints + (rewards.spiritPoints ?? 0),
    exp: record.exp + (rewards.exp ?? 0),
  };

  await hmwDb.users.put(updated);
  return updated;
}

/** 解锁徽章（重复解锁不会重复写）。 */
export async function unlockBadge(
  userId: string,
  badgeId: string,
  at: Date,
): Promise<UserRecord | null> {
  const record = await findUserById(userId);
  if (record === null) {
    return null;
  }

  const target = record.badges.find((badge) => badge.id === badgeId);
  if (target === undefined || target.unlockedAt !== null) {
    return record;
  }

  const updated: UserRecord = {
    ...record,
    badges: record.badges.map((badge) =>
      badge.id === badgeId ? { ...badge, unlockedAt: at.toISOString() } : badge,
    ),
  };

  await hmwDb.users.put(updated);
  return updated;
}

/** 清空用户表（演示数据的「清空」会调用它）。 */
export async function clearUserTable(): Promise<void> {
  await hmwDb.users.clear();
}
