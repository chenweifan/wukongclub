import { describe, expect, it } from 'vitest';

import {
  DISPLAY_NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  isAuthResult,
  isAuthSession,
  isUser,
  isUserBadge,
  validateDisplayName,
  validatePassword,
  validateRegisterInput,
  validateUsername,
} from '@/data/contracts/user';
import type { User } from '@/data/contracts/user';

const validUser: User = {
  id: 'user-1',
  username: 'tianming',
  displayName: '天命人·小圣',
  title: '初入山门',
  avatarGlyph: '悟',
  bio: '',
  exp: 0,
  spiritPoints: 50,
  joinedAt: '2026-01-01T00:00:00.000Z',
  badges: [],
};

describe('用户契约守卫', () => {
  it('接受合法用户', () => {
    expect(isUser(validUser)).toBe(true);
  });

  it('拒绝缺字段 / 错类型 / badges 内含脏数据', () => {
    expect(isUser({ ...validUser, exp: '640' })).toBe(false);
    expect(isUser({ ...validUser, badges: [{ id: 'x' }] })).toBe(false);
    expect(isUser({ ...validUser, id: undefined })).toBe(false);
    expect(isUser(null)).toBe(false);
    expect(isUser([])).toBe(false);
  });

  it('徽章允许 chapter / unlockedAt 为 null', () => {
    expect(
      isUserBadge({
        id: 'badge-1',
        name: '不杀一人',
        description: '隐藏成就',
        chapter: null,
        unlockedAt: null,
      }),
    ).toBe(true);
  });

  it('会话与登录结果守卫', () => {
    expect(isAuthSession({ token: 't', userId: 'u', issuedAt: 'i' })).toBe(true);
    expect(isAuthSession({ token: 't' })).toBe(false);
    expect(
      isAuthResult({
        user: validUser,
        session: { token: 't', userId: 'u', issuedAt: 'i' },
      }),
    ).toBe(true);
    expect(isAuthResult({ user: validUser })).toBe(false);
  });
});

describe('表单校验（前后端共用）', () => {
  it('用户名：3–16 位字母数字下划线', () => {
    expect(validateUsername('abc').ok).toBe(true);
    expect(validateUsername('a_b_c_1234567890').ok).toBe(true);

    expect(validateUsername('ab').ok).toBe(false);
    expect(validateUsername('a'.repeat(17)).ok).toBe(false);
    expect(validateUsername('中文用户名').ok).toBe(false);
    expect(validateUsername('with space').ok).toBe(false);
    expect(validateUsername('').ok).toBe(false);
  });

  it('道号：去空格后 1–12 字符', () => {
    expect(validateDisplayName('小圣').ok).toBe(true);
    expect(validateDisplayName('  ').ok).toBe(false);
    expect(validateDisplayName('道'.repeat(12)).ok).toBe(true);
    expect(validateDisplayName('道'.repeat(DISPLAY_NAME_MAX_LENGTH + 1)).ok).toBe(false);
  });

  it('密码：6–32 位', () => {
    expect(validatePassword('123456').ok).toBe(true);
    expect(validatePassword('12345').ok).toBe(false);
    expect(validatePassword('a'.repeat(PASSWORD_MAX_LENGTH + 1)).ok).toBe(false);
    expect(validatePassword('').ok).toBe(false);
  });

  it('注册整体校验：逐项短路并给出具体原因', () => {
    const base = {
      username: 'tianming',
      displayName: '小圣',
      password: 'hmw-demo',
      passwordConfirm: 'hmw-demo',
    };

    expect(validateRegisterInput(base).ok).toBe(true);

    const badUsername = validateRegisterInput({ ...base, username: 'x' });
    expect(badUsername.ok).toBe(false);
    expect(badUsername.ok ? '' : badUsername.message).toContain('用户名');

    const mismatch = validateRegisterInput({ ...base, passwordConfirm: 'other' });
    expect(mismatch.ok).toBe(false);
    expect(mismatch.ok ? '' : mismatch.message).toContain('不一致');
  });

  it('超长输入不会抛错（边界）', () => {
    expect(validateUsername('a'.repeat(10_000)).ok).toBe(false);
    expect(validatePassword('x'.repeat(10_000)).ok).toBe(false);
  });
});
