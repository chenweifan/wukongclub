import { useCallback } from 'react';

import { pushToast } from '@/stores/toastStore';
import { COPY } from '@/utils/copy';

/**
 * 复制当前地址栏链接（演示的核心卖点：一条 URL 复现任意状态）。
 * 剪贴板 API 在非安全上下文/旧浏览器里可能不存在，这里显式兜底并提示手动复制。
 */
export function useCopyDemoLink(): () => void {
  return useCallback(() => {
    const copy = async () => {
      if (typeof navigator === 'undefined' || navigator.clipboard === undefined) {
        throw new Error('clipboard unavailable');
      }
      await navigator.clipboard.writeText(window.location.href);
    };

    void copy().then(
      () => {
        pushToast(COPY.demo.linkCopied, 'success');
      },
      () => {
        pushToast(COPY.demo.linkCopyFailed, 'danger');
      },
    );
  }, []);
}
