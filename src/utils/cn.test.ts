import { describe, expect, it } from 'vitest';

import { cn } from '@/utils/cn';

describe('cn', () => {
  it('按顺序拼接多个类名', () => {
    expect(cn('block', 'text-sm', 'bg-surface')).toBe('block text-sm bg-surface');
  });

  it('空输入返回空字符串（边界：无参数 / 空数组）', () => {
    expect(cn()).toBe('');
    expect(cn(...[])).toBe('');
  });

  it('过滤掉 false / null / undefined / 空字符串', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b');
  });

  it('全部为假值时返回空字符串', () => {
    expect(cn(false, null, undefined, '')).toBe('');
  });

  it('保留单个类名内部的多空格，不做额外归一化（只负责拼接）', () => {
    expect(cn('a  b', 'c')).toBe('a  b c');
  });

  it('支持超长类名列表而不丢失任何一项', () => {
    const many = Array.from({ length: 200 }, (_, index) => `c-${index}`);
    expect(cn(...many).split(' ')).toHaveLength(200);
  });
});
