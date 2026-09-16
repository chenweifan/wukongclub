import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { createGuideSeed } from '@/data/seeds/guide.seed';
import { GuideFilters } from '@/features/guide/components/GuideFilters';
import {
  DEFAULT_GUIDE_SORT,
  type GuideFilters as GuideFiltersValue,
} from '@/features/guide/useGuideFilters';
import { applyGuideQuery, countGuidesByKind } from '@/utils/guideRules';

const guides = createGuideSeed(new Date('2026-02-14T12:00:00.000Z'));
const kindCounts = countGuidesByKind(guides);

const baseFilters: GuideFiltersValue = {
  search: '',
  sort: DEFAULT_GUIDE_SORT,
};

/**
 * 攻略筛选条：分类（带篇数）+ 难度 + 章节 + 搜索（防抖写 URL）+ 排序。
 * story 里自己管状态，交互才有效果（与页面共用同一份筛选语义）。
 */
const meta = {
  title: '业务组件/GuideFilters',
  component: GuideFilters,
  tags: ['autodocs'],
  args: {
    filters: baseFilters,
    kindCounts,
    matchedCount: guides.length,
    totalCount: guides.length,
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
} satisfies Meta<typeof GuideFilters>;

export default meta;

type Story = StoryObj<typeof meta>;

function Harness({ initial }: { initial: GuideFiltersValue }) {
  const [filters, setFilters] = useState(initial);
  const matched = applyGuideQuery(guides, {
    kind: filters.kind,
    difficulty: filters.difficulty,
    chapter: filters.chapter,
    search: filters.search,
    sort: filters.sort,
  });

  return (
    <GuideFilters
      filters={filters}
      kindCounts={kindCounts}
      matchedCount={matched.length}
      totalCount={guides.length}
      hasActiveFilters={matched.length !== guides.length}
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
  name: '有筛选条件',
  render: () => (
    <Harness initial={{ ...baseFilters, kind: 'boss', difficulty: 'challenge', search: '无伤' }} />
  ),
};

export const NoResults: Story = {
  name: '无匹配结果',
  args: {
    filters: { ...baseFilters, search: '不存在的关键词zzz' },
    matchedCount: 0,
    hasActiveFilters: true,
  },
};

export const EmptyCounts: Story = {
  name: '空数据的角标（全是 0）',
  args: {
    kindCounts: { boss: 0, build: 0, ending: 0 },
    matchedCount: 0,
    totalCount: 0,
  },
};

export const HighContrast: Story = {
  name: '高对比主题',
  globals: { theme: 'contrast' },
  render: () => <Harness initial={baseFilters} />,
};
