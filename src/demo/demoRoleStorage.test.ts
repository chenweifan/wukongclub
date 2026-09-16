import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DEMO_ROLE_STORAGE_KEY,
  readStoredDemoRole,
  writeStoredDemoRole,
} from '@/demo/demoRoleStorage';
import { DEFAULT_DEMO_ROLE, DEMO_ROLES, isDemoRole } from '@/demo/types';

describe('isDemoRole', () => {
  it('接受六种合法身份', () => {
    for (const role of DEMO_ROLES) {
      expect(isDemoRole(role)).toBe(true);
    }
  });

  it('拒绝非法值（边界：空串 / 大小写 / 数字 / null / 对象）', () => {
    expect(isDemoRole('')).toBe(false);
    expect(isDemoRole('Admin')).toBe(false);
    expect(isDemoRole(1)).toBe(false);
    expect(isDemoRole(null)).toBe(false);
    expect(isDemoRole({ role: 'admin' })).toBe(false);
  });
});

describe('演示身份临时存储（阶段 1 将删除）', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('未写入时回落到 guest', () => {
    expect(readStoredDemoRole()).toBe(DEFAULT_DEMO_ROLE);
    expect(DEFAULT_DEMO_ROLE).toBe('guest');
  });

  it('写入后可读回，键名带 hmw: 前缀', () => {
    writeStoredDemoRole('admin');
    expect(window.localStorage.getItem(DEMO_ROLE_STORAGE_KEY)).toBe('admin');
    expect(readStoredDemoRole()).toBe('admin');
  });

  it('存储值非法时回落到 guest，不抛错', () => {
    window.localStorage.setItem(DEMO_ROLE_STORAGE_KEY, 'superuser');
    expect(readStoredDemoRole()).toBe(DEFAULT_DEMO_ROLE);
  });

  it('localStorage 不可用时不崩溃', () => {
    vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(readStoredDemoRole()).toBe(DEFAULT_DEMO_ROLE);
    vi.restoreAllMocks();

    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => writeStoredDemoRole('banned')).not.toThrow();
  });
});
