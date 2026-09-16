/**
 * 设备标识：给「未登录也能收藏」用的稳定匿名身份。
 *
 * 为什么需要它：收藏是设备级/账号级二象性的功能 —— 登录了就跟着账号走，
 * 没登录也该能在本机收藏。服务端（mock backend）只认一个 ownerId，
 * 由客户端把 userId 或 deviceId 送上来，规则简单且可测。
 */
export const DEVICE_ID_STORAGE_KEY = 'hmw:device-id';
export const DEVICE_ID_HEADER = 'X-Device-Id';

/** 生成一个足够随机的设备 id（演示用途，不追求密码学强度）。 */
export function createDeviceId(random: () => number = Math.random): string {
  const part = (): string => Math.floor(random() * 0xffffffff).toString(36);
  return `device-${part()}${part()}`;
}

export function readDeviceId(): string {
  if (typeof window === 'undefined') {
    return 'device-server';
  }

  try {
    const existing = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);
    if (existing !== null && existing !== '') {
      return existing;
    }

    const created = createDeviceId();
    window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, created);
    return created;
  } catch {
    // 隐私模式：本次会话用一个临时 id，收藏不会跨刷新保留
    return 'device-ephemeral';
  }
}

export function buildDeviceHeaders(): Record<string, string> {
  return { [DEVICE_ID_HEADER]: readDeviceId() };
}
