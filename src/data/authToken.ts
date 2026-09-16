/**
 * 会话令牌的存取（传输层）。
 *
 * 为什么放在 data 层而不是实体层：令牌是**请求头的一部分**，
 * httpClient 需要它；而实体层的 session store 只关心「当前是谁」。
 * 这样令牌只有一份，不会出现「store 里有、请求头里没有」的错位。
 */
export const AUTH_TOKEN_STORAGE_KEY = 'hmw:auth-token';

export const AUTH_HEADER = 'Authorization';

export function readAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    return token === null || token === '' ? null : token;
  } catch {
    return null;
  }
}

export function writeAuthToken(token: string | null): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (token === null) {
      window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  } catch {
    // 隐私模式下写不了：本次会话仍可用内存态，只是刷新后需要重新登录
  }
}

export function buildAuthHeaders(): Record<string, string> {
  const token = readAuthToken();
  return token === null ? {} : { [AUTH_HEADER]: `Bearer ${token}` };
}
