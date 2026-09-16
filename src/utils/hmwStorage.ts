/**
 * `hmw:` 命名空间存储工具（协议：写操作持久化前缀统一 hmw:）。
 * 抽出来是为了让「清理 / 导出 / 导入」三处共用同一套前缀规则，
 * 且可以在单测里用一个假的 Storage 验证，不依赖真实浏览器。
 */
export const HMW_STORAGE_PREFIX = 'hmw:';

export function hasHmwPrefix(key: string): boolean {
  return key.startsWith(HMW_STORAGE_PREFIX);
}

export function collectHmwEntries(storage: Storage): Record<string, string> {
  const entries: Record<string, string> = {};

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key === null || !hasHmwPrefix(key)) {
      continue;
    }
    const value = storage.getItem(key);
    if (value !== null) {
      entries[key] = value;
    }
  }

  return entries;
}

/** 返回被清理的键数量，便于在报告/Toast 里给出确切反馈。 */
export function clearHmwEntries(storage: Storage): number {
  const keys: string[] = [];

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key !== null && hasHmwPrefix(key)) {
      keys.push(key);
    }
  }

  for (const key of keys) {
    storage.removeItem(key);
  }

  return keys.length;
}

export function restoreHmwEntries(storage: Storage, entries: Record<string, string>): number {
  let restored = 0;

  for (const [key, value] of Object.entries(entries)) {
    if (!hasHmwPrefix(key)) {
      // 快照可能被人手改过：只接受 hmw: 命名空间的键，避免污染其他站点数据
      continue;
    }
    storage.setItem(key, value);
    restored += 1;
  }

  return restored;
}
