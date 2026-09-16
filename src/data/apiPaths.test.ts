import { describe, expect, it } from 'vitest';

import { API_PATHS, fillPath } from '@/data/apiPaths';
import { HttpError } from '@/data/HttpError';
import { digestPassword, verifyPassword } from '@/data/mocks/passwordDigest';

describe('fillPath', () => {
  it('填充具名参数', () => {
    expect(fillPath('/api/growth/tasks/:taskId/claim', { taskId: 't-1' })).toBe(
      '/api/growth/tasks/t-1/claim',
    );
    expect(fillPath('/api/notifications/:notificationId/read', { notificationId: 'n-9' })).toBe(
      '/api/notifications/n-9/read',
    );
  });

  it('对参数做 URL 编码（避免路径注入）', () => {
    expect(fillPath('/api/x/:id', { id: 'a/b c' })).toBe('/api/x/a%2Fb%20c');
  });

  it('缺少参数时保留占位符，让错误显形而不是请求错地址', () => {
    expect(fillPath('/api/x/:id/y')).toBe('/api/x/:id/y');
    expect(fillPath('/api/x/:id/y', { other: '1' })).toBe('/api/x/:id/y');
  });

  it('没有占位符时原样返回', () => {
    expect(fillPath(API_PATHS.growth.tasks)).toBe('/api/growth/tasks');
  });

  it('一次填充多个占位符', () => {
    expect(fillPath('/a/:x/b/:y', { x: '1', y: '2' })).toBe('/a/1/b/2');
  });
});

describe('passwordDigest（演示用，非安全实现）', () => {
  it('同一输入产生同一摘要（确定性）', () => {
    expect(digestPassword('hmw-demo')).toBe(digestPassword('hmw-demo'));
  });

  it('不同口令产生不同摘要', () => {
    expect(digestPassword('hmw-demo')).not.toBe(digestPassword('hmw-demo2'));
    expect(digestPassword('')).not.toBe(digestPassword(' '));
  });

  it('加盐不同则摘要不同（同一口令）', () => {
    expect(digestPassword('abc', 'salt-a')).not.toBe(digestPassword('abc', 'salt-b'));
  });

  it('摘要是 16 位十六进制', () => {
    expect(digestPassword('whatever')).toMatch(/^[0-9a-f]{16}$/);
  });

  it('verifyPassword 校验正确与错误口令', () => {
    const digest = digestPassword('hmw-demo');
    expect(verifyPassword('hmw-demo', digest)).toBe(true);
    expect(verifyPassword('wrong', digest)).toBe(false);
  });

  it('超长口令不会抛错（边界）', () => {
    const long = 'x'.repeat(5000);
    expect(digestPassword(long)).toMatch(/^[0-9a-f]{16}$/);
  });
});

describe('HttpError', () => {
  it('status 0 表示断网，并保留 cause', () => {
    const cause = new Error('boom');
    const error = new HttpError(0, '网络已断开', { cause, code: 'DEMO_OFFLINE' });

    expect(error.isOffline).toBe(true);
    expect(error.isServerError).toBe(false);
    expect(error.code).toBe('DEMO_OFFLINE');
    expect(error.cause).toBe(cause);
    expect(error).toBeInstanceOf(Error);
  });

  it('5xx 判定为服务端错误', () => {
    expect(new HttpError(500, '灵蕴紊乱').isServerError).toBe(true);
    expect(new HttpError(404, '不存在').isServerError).toBe(false);
  });

  it('未传 code 时为 null', () => {
    expect(new HttpError(401, '未登录').code).toBeNull();
  });
});
