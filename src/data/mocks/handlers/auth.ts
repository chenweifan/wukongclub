import { HttpResponse, http } from 'msw';

import { API_PATHS } from '@/data/apiPaths';
import {
  isAuthResult,
  validatePassword,
  validateRegisterInput,
  validateUsername,
} from '@/data/contracts/user';
import type { LoginInput, RegisterInput } from '@/data/contracts/user';
import { isRecord } from '@/data/contracts/common';
import { ensureGrowthProvisioned } from '@/data/db/growthData';
import { toPublicUser } from '@/data/db/records';
import type { UserRecord } from '@/data/db/records';
import { authenticate, ensureDemoUser, findUserById, registerUser } from '@/data/db/userData';
import { HttpError } from '@/data/HttpError';
import { mockDelay, mockError, toMockResponse } from '@/data/mocks/mockControl';
import { resolveUserId } from '@/data/mocks/session';
import { createSessionToken } from '@/data/mocks/token';

/** 供单测直接断言响应形状（避免只测到「没有抛错」）。 */
export const AUTH_RESPONSE_GUARD = isAuthResult;

function buildAuthResult(record: UserRecord, now: Date) {
  return {
    user: toPublicUser(record),
    session: {
      token: createSessionToken(record.id, now),
      userId: record.id,
      issuedAt: now.toISOString(),
    },
  };
}

/** 请求体解析：JSON 解析失败与非对象一律 400，而不是让 handler 抛异常崩掉。 */
async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  let parsed: unknown;

  try {
    parsed = await request.json();
  } catch {
    throw new HttpError(400, '请求体不是合法 JSON', { code: 'INVALID_BODY' });
  }

  if (!isRecord(parsed)) {
    throw new HttpError(400, '请求体必须是对象', { code: 'INVALID_BODY' });
  }

  return parsed;
}

function readLoginInput(body: Record<string, unknown>): LoginInput {
  const username = typeof body.username === 'string' ? body.username : '';
  const password = typeof body.password === 'string' ? body.password : '';

  const usernameCheck = validateUsername(username);
  if (!usernameCheck.ok) {
    throw new HttpError(400, usernameCheck.message, { code: 'INVALID_INPUT' });
  }

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.ok) {
    throw new HttpError(400, passwordCheck.message, { code: 'INVALID_INPUT' });
  }

  return { username, password };
}

function readRegisterInput(body: Record<string, unknown>): RegisterInput {
  const username = typeof body.username === 'string' ? body.username : '';
  const displayName = typeof body.displayName === 'string' ? body.displayName : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const passwordConfirm =
    typeof body.passwordConfirm === 'string' ? body.passwordConfirm : password;

  // 与登录页共用同一套规则：前端过了后端必然也过，不会出现「明明填对了却被拒」
  const check = validateRegisterInput({ username, displayName, password, passwordConfirm });
  if (!check.ok) {
    throw new HttpError(400, check.message, { code: 'INVALID_INPUT' });
  }

  return { username, displayName: displayName.trim(), password };
}

/**
 * 鉴权接口。
 * 每个 handler 都先 mockError() 再 await mockDelay()（协议 1.3），
 * 因此演示控制台切到断网/错误态时登录注册也会一起失败 —— 这正是要演示的。
 */
export const authHandlers = [
  http.post(API_PATHS.auth.login, async ({ request }) => {
    try {
      mockError();
      await mockDelay();

      const input = readLoginInput(await readJsonBody(request));
      const now = new Date();
      const user = await authenticate(input);
      await ensureGrowthProvisioned(user.id, now);

      return HttpResponse.json(buildAuthResult(user, now));
    } catch (error) {
      return toMockResponse(error);
    }
  }),

  http.post(API_PATHS.auth.register, async ({ request }) => {
    try {
      mockError();
      await mockDelay();

      const input = readRegisterInput(await readJsonBody(request));
      const now = new Date();
      const user = await registerUser(input, now);
      await ensureGrowthProvisioned(user.id, now);

      return HttpResponse.json(buildAuthResult(user, now));
    } catch (error) {
      return toMockResponse(error);
    }
  }),

  // 演示专用：不传凭据直接以演示账号登录，让「分享一条已登录的链接」成为可能
  http.post(API_PATHS.auth.demoLogin, async () => {
    try {
      mockError();
      await mockDelay();

      const now = new Date();
      const user = await ensureDemoUser(now);
      await ensureGrowthProvisioned(user.id, now);

      return HttpResponse.json(buildAuthResult(user, now));
    } catch (error) {
      return toMockResponse(error);
    }
  }),

  /**
   * 登出：演示环境里令牌就是 userId 的封装，服务端没有可吊销的状态，
   * 因此只需返回成功，由客户端丢弃令牌。接真实后端时替换这一段即可。
   */
  http.post(API_PATHS.auth.logout, async () => {
    try {
      mockError();
      await mockDelay();
      return new HttpResponse(null, { status: 204 });
    } catch (error) {
      return toMockResponse(error);
    }
  }),

  http.get(API_PATHS.auth.me, async ({ request }) => {
    try {
      mockError();
      await mockDelay();

      const userId = resolveUserId(request);
      if (userId === null) {
        throw new HttpError(401, '尚未登录', { code: 'UNAUTHORIZED' });
      }

      const record = await findUserById(userId);

      if (record === null) {
        // 令牌有效但用户已被清空（例如演示数据被重置）：按未登录处理
        throw new HttpError(401, '会话已失效，请重新登录', { code: 'SESSION_INVALID' });
      }

      return HttpResponse.json(toPublicUser(record));
    } catch (error) {
      return toMockResponse(error);
    }
  }),
];
