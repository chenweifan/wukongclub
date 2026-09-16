/**
 * 演示令牌的格式约定。
 * 单独成文件是为了避免 session.ts 与 userData.ts 互相 import 造成环形依赖。
 */
export const HMW_DEMO_TOKEN_PREFIX = 'hmw-demo-token:';

export function createSessionToken(userId: string, issuedAt: Date): string {
  return `${HMW_DEMO_TOKEN_PREFIX}${userId}:${issuedAt.toISOString()}`;
}
