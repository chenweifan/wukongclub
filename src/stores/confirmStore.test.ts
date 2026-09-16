import { beforeEach, describe, expect, it } from 'vitest';

import { requestConfirm, useConfirmStore } from '@/stores/confirmStore';

describe('confirmStore', () => {
  beforeEach(() => {
    useConfirmStore.setState({ pending: null });
  });

  it('确认后 resolve(true)', async () => {
    const promise = requestConfirm({ title: '清空数据？', tone: 'danger' });
    expect(useConfirmStore.getState().pending?.title).toBe('清空数据？');

    useConfirmStore.getState().settle(true);

    await expect(promise).resolves.toBe(true);
    expect(useConfirmStore.getState().pending).toBeNull();
  });

  it('取消后 resolve(false)', async () => {
    const promise = requestConfirm({ title: '重置？' });
    useConfirmStore.getState().settle(false);

    await expect(promise).resolves.toBe(false);
  });

  it('同时发起第二个请求时，先前的请求按「取消」结算（避免 await 永远悬着）', async () => {
    const first = requestConfirm({ title: '第一个' });
    const second = requestConfirm({ title: '第二个' });

    await expect(first).resolves.toBe(false);
    expect(useConfirmStore.getState().pending?.title).toBe('第二个');

    useConfirmStore.getState().settle(true);
    await expect(second).resolves.toBe(true);
  });

  it('没有待确认请求时 settle 是空操作', () => {
    expect(() => {
      useConfirmStore.getState().settle(true);
    }).not.toThrow();
    expect(useConfirmStore.getState().pending).toBeNull();
  });

  it('每次请求都有唯一 id（便于测试与调试定位）', () => {
    void requestConfirm({ title: 'A' });
    const firstId = useConfirmStore.getState().pending?.id;
    useConfirmStore.getState().settle(false);

    void requestConfirm({ title: 'B' });
    const secondId = useConfirmStore.getState().pending?.id;

    expect(firstId).not.toBe(secondId);
    useConfirmStore.getState().settle(false);
  });
});
