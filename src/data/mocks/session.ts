import { AUTH_HEADER } from '@/data/authToken';
import { HMW_DEMO_TOKEN_PREFIX } from '@/data/mocks/token';

/**
 * 会话解析（mock 后端的「鉴权中间件」）。
 * 令牌形如 `hmw-demo-token:<userId>:<issuedAt>`；真实后端会换成签名 JWT，
 * 因此这里刻意只暴露「取 userId」这一件事，替换实现时调用点不用改。
 */
export function readBearerToken(request: Request): string | null {
  const header = request.headers.get(AUTH_HEADER);
  if (header === null) {
    return null;
  }

  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || token === undefined || token === '') {
    return null;
  }

  return token;
}

export function parseUserIdFromToken(token: string): string | null {
  if (!token.startsWith(HMW_DEMO_TOKEN_PREFIX)) {
    return null;
  }

  const rest = token.slice(HMW_DEMO_TOKEN_PREFIX.length);
  const userId = rest.split(':')[0];

  return userId === undefined || userId === '' ? null : userId;
}

/** 从请求里解出 userId；返回 null 表示未登录（handler 据此返回 401）。 */
export function resolveUserId(request: Request): string | null {
  const token = readBearerToken(request);
  return token === null ? null : parseUserIdFromToken(token);
}
