import { useEffect } from 'react';

import type { ReactNode } from 'react';

import { useDemoStore } from '@/demo/demoStore';
import type { DemoStore } from '@/demo/demoStore';
import {
  RECORDABLE_SELECTOR,
  describeClickTarget,
  isRecordingEnabled,
  recordEvent,
  setRecordingEnabled,
} from '@/demo/recorder';
import { parseDemoQuery, writeDemoStateToUrl } from '@/demo/urlState';
import { readDemoState } from '@/demo/demoStore';
import { readStoredTheme } from '@/app/theme';
import { pushToast } from '@/stores/toastStore';
import { COPY } from '@/utils/copy';

export interface DemoProviderProps {
  children: ReactNode;
}

/**
 * 演示系统的副作用宿主（协议 1.2）。它不渲染任何东西，只做四件事：
 * 1. URL → store 初始化（theme 采用三级优先：URL > localStorage > 默认值）；
 * 2. store → URL 回写（replaceState，绝不新增历史记录，避免「后退」被演示参数塞满）；
 * 3. popstate：浏览器前进/后退时把地址栏重新读回状态；
 * 4. 演示模式下拦截外链跳转 + 按 ?record=1 录制操作路径。
 *
 * 路由跳转相关的引导逻辑不在这里，而在 DemoOverlay（它位于 Router 内部）。
 */
export function DemoProvider({ children }: DemoProviderProps) {
  useEffect(() => {
    const urlPatch = parseDemoQuery(window.location.search);
    const themePatch = urlPatch.theme === undefined ? { theme: readStoredTheme() } : {};

    useDemoStore.getState().patch({ ...themePatch, ...urlPatch });
  }, []);

  useEffect(() => {
    const syncUrl = (state: DemoStore) => {
      const nextSearch = writeDemoStateToUrl(window.location.search, readDemoState(state));
      const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const next = `${window.location.pathname}${nextSearch}${window.location.hash}`;

      if (next !== current) {
        window.history.replaceState(window.history.state, '', next);
      }
    };

    syncUrl(useDemoStore.getState());
    return useDemoStore.subscribe(syncUrl);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      useDemoStore.getState().patch(parseDemoQuery(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // 演示模式下拦截真实外链：演示站不该把评审带到站外，也不该伪装成官方来源
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!useDemoStore.getState().enabled) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      const rawHref = anchor.getAttribute('href');
      if (rawHref === null || rawHref.startsWith('#') || rawHref.startsWith('/')) {
        return;
      }

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      if (url.origin === window.location.origin) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      pushToast(COPY.demo.externalLinkBlocked(url.host));
    };

    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  // 操作路径录制（?record=1）：只写内存，由控制台导出
  useEffect(() => {
    const enabled = isRecordingEnabled(window.location.search);
    setRecordingEnabled(enabled);

    if (!enabled) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      const target =
        event.target instanceof Element ? event.target.closest(RECORDABLE_SELECTOR) : null;
      recordEvent('click', describeClickTarget(target));
    };

    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
      setRecordingEnabled(false);
    };
  }, []);

  return <>{children}</>;
}
