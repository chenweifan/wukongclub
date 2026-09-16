import type { Meta, StoryObj } from '@storybook/react-vite';

import { WikiCardWall } from '@/features/encyclopedia/components/WikiCardWall';
import { createWikiSeed } from '@/data/seeds/encyclopedia.seed';

const entries = createWikiSeed();

/**
 * 卡片墙（按行虚拟化）。
 * 48 条真实词条在 story 里就能看到虚拟化的效果：滚动时只有可视行在 DOM 里。
 */
const meta = {
  title: '业务组件/WikiCardWall',
  component: WikiCardWall,
  tags: ['autodocs'],
  args: {
    entries,
    searchTerm: '',
    favoriteIds: [],
    compareIds: [],
    compareFull: false,
    onOpen: () => undefined,
    onToggleFavorite: () => undefined,
    onToggleCompare: () => undefined,
  },
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="bg-bg p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WikiCardWall>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '全部词条（虚拟滚动）' };

export const WithFavorites: Story = {
  name: '含收藏与已选对比',
  args: {
    favoriteIds: ['wiki-heifengshan', 'wiki-heixiongjing'],
    compareIds: ['wiki-heifengshan', 'wiki-heixiongjing'],
    compareFull: true,
  },
};

export const FilteredBySearch: Story = {
  name: '搜索 hfs 的结果',
  args: { entries: entries.filter((entry) => entry.id === 'wiki-heifengshan'), searchTerm: 'hfs' },
};

export const Empty: Story = {
  name: '空列表（不渲染任何行）',
  args: { entries: [] },
};

export const SingleColumn: Story = {
  name: '少量词条',
  args: { entries: entries.slice(0, 3) },
};
