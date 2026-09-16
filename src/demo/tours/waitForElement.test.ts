import { describe, expect, it } from 'vitest';

import { waitForElement } from '@/demo/tours/waitForElement';

describe('waitForElement', () => {
  it('元素已存在时立即返回，不等待', async () => {
    const container = document.createElement('div');
    container.innerHTML = '<span data-tour="brand"></span>';

    const element = await waitForElement('[data-tour="brand"]', { root: container });

    expect(element).not.toBeNull();
    expect(element?.tagName).toBe('SPAN');
  });

  it('元素稍后出现时能轮询到（模拟跨页渲染延迟）', async () => {
    const container = document.createElement('div');
    const pending = waitForElement('[data-tour="late"]', {
      root: container,
      intervalMs: 5,
      timeoutMs: 200,
    });

    setTimeout(() => {
      container.innerHTML = '<span data-tour="late"></span>';
    }, 20);

    const element = await pending;
    expect(element).not.toBeNull();
  });

  it('超时返回 null，而不是一直挂着（调用方据此跳过高亮）', async () => {
    const container = document.createElement('div');

    const element = await waitForElement('[data-tour="never"]', {
      root: container,
      intervalMs: 5,
      timeoutMs: 30,
    });

    expect(element).toBeNull();
  });

  it('只在传入的 root 内查找，不污染全局 document', async () => {
    document.body.innerHTML = '<span data-tour="global"></span>';
    const container = document.createElement('div');

    const element = await waitForElement('[data-tour="global"]', {
      root: container,
      intervalMs: 5,
      timeoutMs: 20,
    });

    expect(element).toBeNull();
    document.body.innerHTML = '';
  });
});
