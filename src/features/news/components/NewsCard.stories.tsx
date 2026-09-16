import type { Meta, StoryObj } from '@storybook/react-vite';

import { NewsCard } from '@/features/news/components/NewsCard';
import { createNewsSeed } from '@/data/seeds/news.seed';
import type { NewsArticle } from '@/data/contracts/news';

const NOW = new Date('2026-02-14T12:00:00.000Z');
const seed = createNewsSeed(NOW);

function requireArticle(id: string): NewsArticle {
  const article = seed.find((item) => item.id === id);
  if (article === undefined) {
    throw new Error(`story 前置数据缺失：${id}`);
  }
  return article;
}

/** 三种形态各取一条：无剧透、含剧透、站内编辑（无外链）。 */
const SAFE = requireArticle('news-002');
const SPOILER = requireArticle('news-009');
const EDITORIAL = requireArticle('news-006');

/**
 * 资讯卡片：摘要 / 正文、剧透遮罩、来源跳转。
 * 摘要与正文共用同一份可见性判定，不会出现「摘要遮着、正文露着」。
 */
const meta = {
  title: '业务组件/NewsCard',
  component: NewsCard,
  tags: ['autodocs'],
  args: {
    article: SAFE,
    visibility: 'full',
    expanded: false,
    now: NOW,
    onToggleExpand: () => undefined,
    onReveal: () => undefined,
    onOpenSource: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NewsCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Pinned: Story = {
  name: '置顶',
  args: { article: requireArticle('news-000') },
};

export const Expanded: Story = {
  name: '展开正文',
  args: { expanded: true },
};

export const Masked: Story = {
  name: '含剧透（遮罩）',
  args: { article: SPOILER, visibility: 'masked' },
};

export const Revealed: Story = {
  name: '已揭开',
  args: { article: SPOILER, visibility: 'full', expanded: true },
};

export const EditorialSource: Story = {
  name: '站内编辑内容（无外链）',
  args: { article: EDITORIAL },
};

export const LongText: Story = {
  name: '极端长文本',
  args: {
    expanded: true,
    article: {
      ...SAFE,
      title: '一个被刻意写得很长的资讯标题，用来验证换行、置顶标记与元信息折行是否稳定',
      summary: '很长的摘要：'.repeat(40),
      body: ['很长的正文段落：'.repeat(60)],
    },
  },
};

export const HighContrast: Story = {
  name: '高对比主题',
  globals: { theme: 'contrast' },
  args: { article: SPOILER, visibility: 'masked' },
};
