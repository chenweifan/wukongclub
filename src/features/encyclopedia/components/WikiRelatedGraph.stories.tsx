import { useEffect, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { WikiHarness } from '../../../../.storybook/harnesses';
import type { WikiGraph } from '@/data/contracts/encyclopedia';
import { getWikiGraph } from '@/data/db/encyclopediaData';
import { WikiRelatedGraph } from '@/features/encyclopedia/components/WikiRelatedGraph';

/**
 * 关联图谱（ECharts 关系图，按需注册 Graph + Tooltip + Canvas）。
 * 颜色取自设计令牌，因此切主题后节点配色会跟着变。
 */
const meta = {
  title: '业务组件/WikiRelatedGraph',
  component: WikiRelatedGraph,
  tags: ['autodocs'],
  args: {
    graph: { nodes: [], links: [] },
    onSelect: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="bg-bg p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WikiRelatedGraph>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 图谱来自真实数据（一跳邻接），与抽屉里看到的是同一份。 */
function GraphHarness({ rootId }: { rootId: string }) {
  const [graph, setGraph] = useState<WikiGraph | null>(null);

  useEffect(() => {
    let cancelled = false;

    void getWikiGraph(rootId).then((loaded) => {
      if (!cancelled) {
        setGraph(loaded);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [rootId]);

  if (graph === null) {
    return <p className="text-content-muted text-xs">图谱加载中…</p>;
  }

  return <WikiRelatedGraph graph={graph} onSelect={() => undefined} />;
}

export const BossNeighborhood: Story = {
  name: '妖王邻域（黑熊精）',
  render: () => (
    <WikiHarness>
      <GraphHarness rootId="wiki-heixiongjing" />
    </WikiHarness>
  ),
};

export const ChapterHub: Story = {
  name: '章节枢纽（花果山）',
  render: () => (
    <WikiHarness>
      <GraphHarness rootId="wiki-huaguoshan" />
    </WikiHarness>
  ),
};

export const EmptyGraph: Story = {
  name: '空数据（不渲染图表）',
  args: { graph: { nodes: [], links: [] } },
};

export const HighContrast: Story = {
  name: '高对比主题',
  globals: { theme: 'contrast' },
  render: () => (
    <WikiHarness>
      <GraphHarness rootId="wiki-heixiongjing" />
    </WikiHarness>
  ),
};
