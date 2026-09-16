import { beforeEach, describe, expect, it } from 'vitest';

import { AUTH_TOKEN_STORAGE_KEY, readAuthToken } from '@/data/authToken';
import { clearAllData } from '@/data/db/demoData';
import { HttpError } from '@/data/HttpError';
import { authRepo } from '@/data/repositories';
import { DEMO_CREDENTIALS } from '@/data/seeds/user.seed';
import { useDemoStore } from '@/demo/demoStore';

/**
 * 鉴权 Repository 的集成测试：真实走 MSW + Dexie（fake-indexeddb）。
 * 断言的既有 HTTP 语义（401/409），也有「令牌只在成功后写入」这类容易写错的行为。
 */
describe('authRepo', () => {
  beforeEach(async () => {
    await clearAllData();
  });

  it('demoLogin 返回用户并持久化令牌，且响应不含密码摘要', async () => {
    const result = await authRepo.demoLogin();

    expect(result.user.username).toBe(DEMO_CREDENTIALS.username);
    expect(result.user.displayName.length).toBeGreaterThan(0);
    expect(result.session.token).toContain(result.user.id);
    expect(readAuthToken()).toBe(result.session.token);
    // toPublicUser 必须剥掉服务端字段：少一个字段就少一条泄漏路径
    expect(Object.keys(result.user)).not.toContain('passwordDigest');
  });

  it('me 在登录后返回当前用户', async () => {
    const loggedIn = await authRepo.demoLogin();
    const me = await authRepo.me();

    expect(me.id).toBe(loggedIn.user.id);
    expect(me.spiritPoints).toBe(loggedIn.user.spiritPoints);
  });

  it('me 在未登录时返回 401（前端据此展示登录引导）', async () => {
    await expect(authRepo.me()).rejects.toMatchObject({ status: 401 });
  });

  it('register 创建新用户并自动登录', async () => {
    const result = await authRepo.register({
      username: 'newcomer',
      displayName: '新来的',
      password: 'hmw-demo',
    });

    expect(result.user.username).toBe('newcomer');
    expect(result.user.exp).toBe(0);
    expect(result.user.badges).toEqual([]);
    expect(readAuthToken()).not.toBeNull();

    const me = await authRepo.me();
    expect(me.displayName).toBe('新来的');
  });

  it('register 遇到重名返回 409', async () => {
    await authRepo.demoLogin();

    await expect(
      authRepo.register({
        username: DEMO_CREDENTIALS.username,
        displayName: '冒名者',
        password: 'hmw-demo',
      }),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('login 使用演示账号可以登录；密码错误返回 401', async () => {
    await authRepo.demoLogin();
    await authRepo.logout();

    const loggedIn = await authRepo.login(DEMO_CREDENTIALS);
    expect(loggedIn.user.username).toBe(DEMO_CREDENTIALS.username);

    await authRepo.logout();
    await expect(
      authRepo.login({ username: DEMO_CREDENTIALS.username, password: 'wrong-password' }),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('login 对不存在的用户同样返回 401（不暴露账号是否存在）', async () => {
    await expect(
      authRepo.login({ username: 'nobodyhere', password: 'hmw-demo' }),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('login 对不合规的用户名返回 400（格式校验先于查库）', async () => {
    await expect(
      authRepo.login({ username: 'bad name!', password: 'hmw-demo' }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('logout 清掉本地令牌', async () => {
    await authRepo.demoLogin();
    expect(readAuthToken()).not.toBeNull();

    await authRepo.logout();

    expect(readAuthToken()).toBeNull();
    expect(window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('logout 即使服务端失败也必须本地登出（finally 语义）', async () => {
    await authRepo.demoLogin();
    useDemoStore.getState().patch({ uiState: 'offline' });

    await expect(authRepo.logout()).rejects.toBeInstanceOf(HttpError);

    expect(readAuthToken()).toBeNull();
  });

  it('断网态下所有接口都是 HttpError(0)', async () => {
    useDemoStore.getState().patch({ uiState: 'offline' });

    const error = await authRepo.demoLogin().catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(HttpError);
    expect((error as HttpError).isOffline).toBe(true);
  });

  it('错误态下返回 500 与「灵蕴紊乱」', async () => {
    useDemoStore.getState().patch({ uiState: 'error' });

    await expect(authRepo.demoLogin()).rejects.toMatchObject({ status: 500 });
  });

  it('清空数据后旧令牌失效（会话不再指向幽灵账号）', async () => {
    await authRepo.demoLogin();
    await clearAllData();

    await expect(authRepo.me()).rejects.toMatchObject({ status: 401 });
  });
});
