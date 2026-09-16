import { describe, expect, it } from 'vitest';

import { describeUnknownError, readErrorStatus } from '@/utils/errorMessage';

describe('describeUnknownError', () => {
  it('优先返回 Error 实例的 message', () => {
    expect(describeUnknownError(new Error('灵蕴紊乱'))).toBe('灵蕴紊乱');
  });

  it('接受字符串错误', () => {
    expect(describeUnknownError('网络已断开')).toBe('网络已断开');
  });

  it('从类 Error 的普通对象上取 message', () => {
    expect(describeUnknownError({ message: 'HttpError(500)', status: 500 })).toBe('HttpError(500)');
  });

  it('空 message 的 Error 回落到未知错误文案（边界：空字符串）', () => {
    expect(describeUnknownError(new Error(''))).toBe('发生了未知错误');
  });

  it('全空白字符串回落到未知错误文案（边界：超长空白）', () => {
    expect(describeUnknownError('   '.repeat(500))).toBe('发生了未知错误');
  });

  it('null / undefined / number / 无 message 对象均回落到未知错误文案', () => {
    expect(describeUnknownError(null)).toBe('发生了未知错误');
    expect(describeUnknownError(undefined)).toBe('发生了未知错误');
    expect(describeUnknownError(500)).toBe('发生了未知错误');
    expect(describeUnknownError({ code: 'E_NET' })).toBe('发生了未知错误');
  });

  it('对象 message 非字符串时回落到未知错误文案', () => {
    expect(describeUnknownError({ message: 123 })).toBe('发生了未知错误');
  });

  it('超长错误信息原样返回，不做截断（截断属于展示层职责）', () => {
    const long = '妖'.repeat(5000);
    expect(describeUnknownError(new Error(long))).toHaveLength(5000);
  });
});

describe('readErrorStatus', () => {
  it('读取数字型 status', () => {
    expect(readErrorStatus({ status: 0 })).toBe(0);
    expect(readErrorStatus({ status: 500 })).toBe(500);
  });

  it('无 status / 非数字 / 非对象时返回 null', () => {
    expect(readErrorStatus(new Error('boom'))).toBeNull();
    expect(readErrorStatus({ status: '500' })).toBeNull();
    expect(readErrorStatus(null)).toBeNull();
    expect(readErrorStatus(Number.NaN as unknown)).toBeNull();
  });
});
