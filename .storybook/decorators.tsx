import { useEffect, useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Decorator } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';

import { DEFAULT_THEME, isTheme } from '@/app/theme';
import { ThemeProvider } from '@/app/ThemeProvider';
import { useDemoStore } from '@/demo/demoStore';
import type { DemoStoreUiFlags } from '@/demo/demoStore';
import { DEFAULT_DEMO_STATE, DEMO_STATE_KEYS } from '@/demo/types';
import type { DemoState } from '@/demo/types';
import { isRecord } from '@/data/contracts/common';
import { COPY } from '@/utils/copy';

/**
 * Storybook 全局装饰器。
 * 目标：story 里渲染的组件与真实页面处在**同一套上下文**里
 * （Query 缓存、主题令牌、路由、演示状态、Mock 后端），
 * 而不是被简化成孤立的静态片段 —— 否则 story 通过、页面照样出问题。
 */

/** story 与 story 之间不能共享缓存，否则「loading → ready」会被上一个 story 污染。 */
function createStoryQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 0, refetchOnWindowFocus: false } },
  });
}

const storyQueryClient = createStoryQueryClient();

export const withProviders: Decorator = (Story) => (
  <QueryClientProvider client={storyQueryClient}>
    <ThemeProvider>
      <MemoryRouter>{<Story />}</MemoryRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

/**
 * 主题工具栏（对应 globalTypes.theme）。
 * 直接写入 demoStore —— 它是主题的唯一状态源，ThemeProvider 随后把
 * data-theme 同步到 <html> 上，因此 toolbar 切换与页面内切换行为完全一致。
 */
export const withTheme: Decorator = (Story, context) => {
  const requested = context.globals.theme;
  useDemoStore.setState({ theme: isTheme(requested) ? requested : DEFAULT_THEME });

  return <Story />;
};

interface DemoParameters {
  state?: Partial<DemoState>;
  ui?: Partial<DemoStoreUiFlags>;
}

function readEnumKeys(value: unknown): Partial<DemoState> {
  if (!isRecord(value)) {
    return {};
  }

  const patch: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if ((DEMO_STATE_KEYS as readonly string[]).includes(key)) {
      patch[key] = entry;
    }
  }

  return patch as Partial<DemoState>;
}

function readUiFlags(value: unknown): Partial<DemoStoreUiFlags> {
  if (!isRecord(value)) {
    return {};
  }

  const flags: Partial<DemoStoreUiFlags> = {};
  for (const key of ['consoleOpen', 'outline', 'perfPanel'] as const) {
    const entry = value[key];
    if (typeof entry === 'boolean') {
      flags[key] = entry;
    }
  }

  return flags;
}

function readDemoParameters(value: unknown): DemoParameters {
  if (!isRecord(value)) {
    return {};
  }

  return { state: readEnumKeys(value.state), ui: readUiFlags(value.ui) };
}

/**
 * 通过 `parameters.demo` 预置演示状态，例如：
 *   parameters: { demo: { state: { enabled: true, uiState: 'offline' } } }
 *
 * 刻意在渲染期同步写入：若放在 effect 里，story 会先用上一个 story 的状态渲染一帧，
 * 快照/视觉回归就会不稳定。theme 会被保留，避免覆盖工具栏的选择。
 */
export const withDemoState: Decorator = (Story, context) => {
  const { state, ui } = readDemoParameters(context.parameters.demo);
  const currentTheme = useDemoStore.getState().theme;

  useDemoStore.setState({
    ...DEFAULT_DEMO_STATE,
    theme: currentTheme,
    consoleOpen: false,
    outline: false,
    perfPanel: false,
    ...state,
    ...ui,
  });

  return <Story />;
};

/**
 * MSW：整个 Storybook 只启动一次浏览器 worker（与 main.tsx 同一套 handler）。
 * 没有它，依赖数据的故事（探针面板、StateBoundary 的真实查询）拿不到 mock 后端。
 * worker 未就绪前先渲染占位，避免首帧请求漏拦截。
 */
let mockWorkerReady: Promise<void> | null = null;

function startMockWorker(): Promise<void> {
  mockWorkerReady ??= import('@/data/mocks/browser').then(async ({ worker }) => {
    await worker.start({ onUnhandledRequest: 'bypass', quiet: true });
  });

  return mockWorkerReady;
}

export const withMockBackend: Decorator = (Story) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void startMockWorker()
      .catch((error: unknown) => {
        // worker 起不来也让 story 渲染：此时数据story会展示统一错误态，
        // 比整页空白更容易发现「Mock 没生效」。
        console.warn('[storybook] MSW worker 启动失败', error);
      })
      .then(() => {
        if (!cancelled) {
          setReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return <p className="text-content-muted p-4 text-xs">{COPY.common.loading}</p>;
  }

  return <Story />;
};
