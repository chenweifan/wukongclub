import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { NewsFilters } from '@/features/news/components/NewsFilters';
import { createNewsSeed } from '@/data/seeds/news.seed';
import {
  DEFAULT_NEWS_SORT,
  type NewsFilters as NewsFiltersValue,
} from '@/features/news/useNewsFilters';
import { applyNewsQuery, collectTagCounts, countMaskedArticles } from '@/utils/newsRules';
import type { SpoilerContext } from '@/utils/newsRules';

const NOW = new Date('2026-02-14T12:00:00.000Z');
const articles = createNewsSeed(NOW);
const tagCounts = collectTagCounts(articles);

const spoilerContext: SpoilerContext = { spoilerVisible: false, revealedIds: [] };

const baseFilters: NewsFiltersValue = {
  tags: [],
  search: '',
  sort: DEFAULT_NEWS_SORT,
};

/**
 * 资讯筛选条：搜索（防抖写 URL）+ 类目 + 排序 + 带角标的标签 chip。
 * story 里自己管状态，交互才有效果（与页面共用同一份筛选语义）。
 */
const meta = {
  title: '业务组件/NewsFilters',
  component: NewsFilters,
  tags: ['autodocs'],
  args: {
    filters: baseFilters,
    tagCounts,
    matchedCount: articles.length,
    totalCount: articles.length,
    maskedCount: countMaskedArticles(articles, spoilerContext),
    spoilerVisible: false,
    hasActiveFilters: false,
    onSearchChange: () => undefined,
    onCategoryChange: () => undefined,
    onSortChange: () => undefined,
    onToggleTag: () => undefined,
    onReset: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="bg-bg p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NewsFilters>;

export default meta;

type Story = StoryObj<typeof meta>;

function Harness({ initial }: { initial: NewsFiltersValue }) {
  const [filters, setFilters] = useState(initial);
  const matched = applyNewsQuery(articles, {
    category: filters.category,
    tags: filters.tags,
    search: filters.search,
    sort: filters.sort,
  });

  return (
    <NewsFilters
      filters={filters}
      tagCounts={tagCounts}
      matchedCount={matched.length}
      totalCount={articles.length}
      maskedCount={countMaskedArticles(matched, spoilerContext)}
      spoilerVisible={false}
      hasActiveFilters={matched.length !== articles.length}
      onSearchChange={(value) => {
        setFilters((previous) => ({ ...previous, search: value }));
      }}
      onCategoryChange={(value) => {
        setFilters((previous) => ({ ...previous, category: value }));
      }}
      onSortChange={(value) => {
        setFilters((previous) => ({ ...previous, sort: value }));
      }}
      onToggleTag={(tag) => {
        setFilters((previous) => ({
          ...previous,
          tags: previous.tags.includes(tag)
            ? previous.tags.filter((item) => item !== tag)
            : [...previous.tags, tag],
        }));
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
    <Harness initial={{ ...baseFilters, category: 'community', tags: ['guide'], search: '攻略' }} />
  ),
};

export const SpoilerVisible: Story = {
  name: '剧透保护关闭时',
  args: { spoilerVisible: true, maskedCount: 0 },
};

export const HighContrast: Story = {
  name: '高对比主题',
  globals: { theme: 'contrast' },
  render: () => <Harness initial={baseFilters} />,
};
