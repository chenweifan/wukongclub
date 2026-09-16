import type { Meta, StoryObj } from '@storybook/react-vite';

import { NewsTimeline } from '@/features/news/components/NewsTimeline';
import { createNewsSeed } from '@/data/seeds/news.seed';
import { applyNewsQuery, groupNewsByDay } from '@/utils/newsRules';
import type { SpoilerContext } from '@/utils/newsRules';

const NOW = new Date('2026-02-14T12:00:00.000Z');
const articles = createNewsSeed(NOW);

const maskedContext: SpoilerContext = { spoilerVisible: false, revealedIds: [] };
const revealedContext: SpoilerContext = { spoilerVisible: true, revealedIds: [] };

/**
 * 时间线：按天分组（今天 / 昨天 / 具体日期）。
 * 组标题让读者先看到「今天发生了什么」，而不是一串无时间语境的列表。
 */
const meta = {
  title: '业务组件/NewsTimeline',
  component: NewsTimeline,
  tags: ['autodocs'],
  args: {
    groups: groupNewsByDay(applyNewsQuery(articles, { sort: 'latest' })),
    spoilerContext: maskedContext,
    expandedIds: [],
    now: NOW,
    onToggleExpand: () => undefined,
    onReveal: () => undefined,
    onOpenSource: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="bg-bg max-w-3xl p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NewsTimeline>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认（剧透遮罩开启）' };

export const SpoilerVisible: Story = {
  name: '剧透全开',
  args: { spoilerContext: revealedContext },
};

export const SingleDay: Story = {
  name: '只有今天（首屏形态）',
  args: { groups: groupNewsByDay(applyNewsQuery(articles, { sort: 'latest' })).slice(0, 1) },
};

export const Empty: Story = {
  name: '空结果（页面会替换成统一空态）',
  args: { groups: [] },
};

export const HighContrast: Story = {
  name: '高对比主题',
  globals: { theme: 'contrast' },
};
