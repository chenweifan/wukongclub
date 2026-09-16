/**
 * 演示用口令摘要。
 *
 * ⚠️ 这不是安全实现：FNV-1a 是非加密散列，加固定盐也挡不住彩虹表。
 * 之所以仍然加一层，是为了**不给「把明文密码写进 IndexedDB」开先例** ——
 * 将来接真实后端时，前端这一侧本来也不该接触口令原文以外的任何东西。
 */
export const MOCK_PASSWORD_SALT = 'hmw-demo-salt-v1';

const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

function fnv1a(input: string, seed: number): string {
  let hash = seed;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, FNV_PRIME) >>> 0;
  }

  return hash.toString(16).padStart(8, '0');
}

/** 双通道散列（正序 + 倒序）拼成 16 位十六进制串，降低短口令的碰撞概率。 */
export function digestPassword(password: string, salt: string = MOCK_PASSWORD_SALT): string {
  const salted = `${salt}:${password}`;
  const reversed = [...salted].reverse().join('');
  return `${fnv1a(salted, FNV_OFFSET_BASIS)}${fnv1a(reversed, FNV_OFFSET_BASIS ^ 0x9e3779b9)}`;
}

export function verifyPassword(password: string, digest: string, salt?: string): boolean {
  return digestPassword(password, salt) === digest;
}
