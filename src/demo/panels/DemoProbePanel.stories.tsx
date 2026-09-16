import { useEffect, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { clearAllData, fillDemoData } from '@/data/db/demoData';
import { DemoProbePanel } from '@/demo/panels/DemoProbePanel';

/**
 * 演示探针自检面板。
 *
 * 这是唯一需要真实后端的 story：它走 Repository → MSW → IndexedDB 全链路
 * （decorators.tsx 里的 withMockBackend 负责起 worker）。
 * 因此每个 story 先用 harness 把库准备成目标状态，再渲染面板。
 */
const meta = {
  title: '演示系统/DemoProbePanel',
  component: DemoProbePanel,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '阶段 1 的验收实物：勾选可持久化、可被快照还原，并跟着界面状态展示五态。阶段 2 起被真实业务列表取代。',
      },
    },
  },
} satisfies Meta<typeof DemoProbePanel>;

export default meta;

type Story = StoryObj<typeof meta>;

type Prep = 'baseline' | 'filled' | 'empty';

/** 渲染前把本地库准备成目标状态；准备完成前先显示占位，避免闪一帧旧数据。 */
function ProbeHarness({ prep }: { prep: Prep }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const prepare = async () => {
      if (prep === 'empty') {
        await clearAllData();
      } else {
        await fillDemoData(prep === 'filled' ? 60 : 12);
      }
    };

    void prepare().then(() => {
      if (!cancelled) {
        setReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [prep]);

  if (!ready) {
    return <p className="text-content-muted text-xs">准备演示数据…</p>;
  }

  return <DemoProbePanel />;
}

export const WithData: Story = {
  name: '有数据（12 条基线）',
  render: () => <ProbeHarness prep="baseline" />,
};

export const Filled: Story = {
  name: '填满（60 条）',
  render: () => <ProbeHarness prep="filled" />,
};

export const Empty: Story = {
  name: '空数据（含「填满」出口）',
  render: () => <ProbeHarness prep="empty" />,
};

export const LoadingOverride: Story = {
  name: '加载中（演示状态覆盖）',
  render: () => <ProbeHarness prep="baseline" />,
  parameters: { demo: { state: { enabled: true, uiState: 'loading' } } },
};

export const ErrorOverride: Story = {
  name: '错误（演示状态覆盖）',
  render: () => <ProbeHarness prep="baseline" />,
  parameters: { demo: { state: { enabled: true, uiState: 'error' } } },
};

export const OfflineOverride: Story = {
  name: '断网（演示状态覆盖）',
  render: () => <ProbeHarness prep="baseline" />,
  parameters: { demo: { state: { enabled: true, uiState: 'offline' } } },
};

export const SlowNetwork: Story = {
  name: '慢速网络（延迟 3–5s 后真正返回）',
  render: () => <ProbeHarness prep="baseline" />,
  parameters: { demo: { state: { enabled: true, uiState: 'slow' } } },
};
