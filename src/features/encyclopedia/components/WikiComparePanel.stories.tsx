import type { Meta, StoryObj } from '@storybook/react-vite';

import { WikiComparePanel } from '@/features/encyclopedia/components/WikiComparePanel';
import { createWikiSeed } from '@/data/seeds/encyclopedia.seed';

const entries = createWikiSeed();
const picks = entries.filter((entry) =>
  ['wiki-heifengshan', 'wiki-heixiongjing', 'wiki-huoyanshan'].includes(entry.id),
);

/**
 * 词条对比（最多 3 条）。
 * 少于 2 条时只显示提示 —— 一条词条没什么可对比的。
 */
const meta = {
  title: '业务组件/WikiComparePanel',
  component: WikiComparePanel,
  tags: ['autodocs'],
  args: {
    entries: picks,
    onRemove: () => undefined,
    onClear: () => undefined,
    onOpen: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="bg-bg p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WikiComparePanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ThreeEntries: Story = { name: '三条对比' };

export const TwoEntries: Story = {
  name: '两条对比',
  args: { entries: picks.slice(0, 2) },
};

export const SingleEntry: Story = {
  name: '仅一条（只给提示）',
  args: { entries: picks.slice(0, 1) },
};

export const NothingSelected: Story = {
  name: '未选择（整块不渲染）',
  args: { entries: [] },
};

export const LongText: Story = {
  name: '极端长文本',
  args: {
    entries: [
      { ...picks[0]!, description: '极长简介：'.repeat(40) },
      { ...picks[1]!, drops: Array.from({ length: 12 }, (_, index) => `掉落物·${index}`) },
    ],
  },
};
