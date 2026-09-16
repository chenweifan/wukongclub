import type { Meta, StoryObj } from '@storybook/react-vite';

import { WikiCard } from '@/features/encyclopedia/components/WikiCard';
import { createWikiSeed } from '@/data/seeds/encyclopedia.seed';

const entries = createWikiSeed();
const boss = entries.find((entry) => entry.id === 'wiki-heixiongjing');
const location = entries.find((entry) => entry.id === 'wiki-heifengshan');

function requireEntry(entry: typeof boss) {
  if (entry === undefined) {
    throw new Error('story 前置数据缺失');
  }
  return entry;
}

/**
 * 影神图卡片：印章封面 + 稀有度 + 收藏 / 对比 / 详情三个动作。
 * 卡片本身不是按钮，避免内部按钮嵌套 —— 标题按钮负责打开详情。
 */
const meta = {
  title: '业务组件/WikiCard',
  component: WikiCard,
  tags: ['autodocs'],
  args: {
    entry: requireEntry(boss),
    searchTerm: '',
    favorited: false,
    selectedForCompare: false,
    compareDisabled: false,
    onOpen: () => undefined,
    onToggleFavorite: () => undefined,
    onToggleCompare: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WikiCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Favorited: Story = {
  name: '已收藏',
  args: { favorited: true },
};

export const SelectedForCompare: Story = {
  name: '已加入对比',
  args: { selectedForCompare: true },
};

export const CompareFull: Story = {
  name: '对比已满（按钮禁用）',
  args: { compareDisabled: true },
};

export const SearchHighlight: Story = {
  name: '搜索高亮（拼音首字母）',
  args: { searchTerm: 'hxj' },
};

export const Location: Story = {
  name: '地点词条',
  args: { entry: requireEntry(location) },
};

export const LongText: Story = {
  name: '极端长文本',
  args: {
    entry: {
      ...requireEntry(boss),
      name: '一个被刻意写得非常长的词条名称用来验证换行与省略',
      description: '这是一段刻意写得很长的简介，用来检查卡片在极端文案下的高度与省略行为：'.repeat(
        4,
      ),
    },
  },
};

export const HighContrast: Story = {
  name: '高对比主题',
  globals: { theme: 'contrast' },
};
