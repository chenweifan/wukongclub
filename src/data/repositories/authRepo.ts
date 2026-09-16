import { API_PATHS } from '@/data/apiPaths';
import { writeAuthToken } from '@/data/authToken';
import { HttpError } from '@/data/HttpError';
import { isAuthResult, isUser } from '@/data/contracts/user';
import type { AuthResult, LoginInput, RegisterInput, User } from '@/data/contracts/user';
import { requestJson } from '@/data/httpClient';

/**
 * 鉴权 Repository（协议 6.2：业务代码只依赖这一层）。
 * 令牌的写入点只有这里一处：拿到 AuthResult 即持久化，
 * 登出即清除 —— 因此不存在「界面显示已登录、请求却没带 token」的中间态。
 */
export interface AuthRepository {
  login(input: LoginInput): Promise<AuthResult>;
  register(input: RegisterInput): Promise<AuthResult>;
  /** 演示账号一键登录（站点没有真实用户体系，这是给评审用的快捷入口）。 */
  demoLogin(): Promise<AuthResult>;
  logout(): Promise<void>;
  me(): Promise<User>;
}

function jsonPost(body: unknown): RequestInit {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

async function readAuthResult(url: string, init: RequestInit): Promise<AuthResult> {
  const payload = await requestJson(url, init);

  if (!isAuthResult(payload)) {
    throw new HttpError(500, '鉴权响应不符合契约', { code: 'CONTRACT_MISMATCH' });
  }

  writeAuthToken(payload.session.token);
  return payload;
}

export const authRepo: AuthRepository = {
  login(input) {
    return readAuthResult(API_PATHS.auth.login, jsonPost(input));
  },

  register(input) {
    return readAuthResult(API_PATHS.auth.register, jsonPost(input));
  },

  demoLogin() {
    return readAuthResult(API_PATHS.auth.demoLogin, { method: 'POST' });
  },

  async logout() {
    try {
      await requestJson(API_PATHS.auth.logout, { method: 'POST' });
    } finally {
      // 服务端登出失败也必须清掉本地令牌，否则用户会卡在「登不出去」的状态
      writeAuthToken(null);
    }
  },

  async me() {
    const payload = await requestJson(API_PATHS.auth.me);

    if (!isUser(payload)) {
      throw new HttpError(500, '用户响应不符合契约', { code: 'CONTRACT_MISMATCH' });
    }

    return payload;
  },
};
