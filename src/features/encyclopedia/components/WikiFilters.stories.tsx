import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { CHAPTERS } from '@/data/contracts/encyclopedia';
import { WikiFilters } from '@/features/encyclopedia/components/WikiFilters';
import { DEFAULT_WIKI_SORT } from '@/features/encyclopedia/useWikiFilters';
import type { WikiFilters as WikiFiltersValue } from '@/features/encyclopedia/useWikiFilters';

const baseFilters: WikiFiltersValue = {
  search: '',
  sort: DEFAULT_WIKI_SORT,
};

/**
 * 筛选条：搜索（防抖写 URL）+ 章节 / 类型 / 稀有度 + 排序。
 * story 里自己管状态，交互才有效果。
 */
const meta = {
  title: '业务组件/WikiFilters',
  component: WikiFilters,
  tags: ['autodocs'],
  args: {
    filters: baseFilters,
    matchedCount: 48,
    totalCount: 48,
    spoilerVisible: false,
    hasActiveFilters: false,
    onChange: () => undefined,
    onReset: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="bg-bg p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WikiFilters>;

export default meta;

type Story = StoryObj<typeof meta>;

function Harness({ initial }: { initial: WikiFiltersValue }) {
  const [filters, setFilters] = useState(initial);
  const matched = filters.search === '' && filters.chapter === undefined ? 48 : 6;

  return (
    <WikiFilters
      filters={filters}
      matchedCount={matched}
      totalCount={48}
      spoilerVisible={false}
      hasActiveFilters={matched !== 48}
      onChange={(key, value) => {
        setFilters((previous) => ({ ...previous, [key]: value }));
      }}
      onReset={() => {
        setFilters(baseFilters);
      }}
    />
  );
}

export const Default: Story = {
  render: () => <Harness initial={baseFilters} />,
};

export const WithActiveFilters: Story = {
  name: '有筛选条件（显示清空按钮与命中数）',
  render: () => (
    <Harness
      initial={{
        chapter: CHAPTERS[0],
        category: 'boss',
        search: '黑风',
        sort: 'rarity',
      }}
    />
  ),
};

export const SearchOnly: Story = {
  name: '仅搜索',
  render: () => <Harness initial={{ ...baseFilters, search: 'hfs' }} />,
};

export const HighContrast: Story = {
  name: '高对比主题',
  globals: { theme: 'contrast' },
  render: () => <Harness initial={baseFilters} />,
};
