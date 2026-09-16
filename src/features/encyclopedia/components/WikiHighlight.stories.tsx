import type { Meta, StoryObj } from '@storybook/react-vite';

import { WikiHighlight } from '@/features/encyclopedia/components/WikiHighlight';

/**
 * 命中片段高亮。
 * 拼音命中会映射回汉字：传 pinyin 后，搜 'hfs' 标出的是「黑风山」而不是拼音。
 */
const meta = {
  title: '业务组件/WikiHighlight',
  component: WikiHighlight,
  tags: ['autodocs'],
  args: { text: '黑风山', term: '黑风', pinyin: 'hei feng shan' },
} satisfies Meta<typeof WikiHighlight>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NameMatch: Story = { name: '中文命中' };

export const PinyinInitials: Story = {
  name: '拼音首字母命中（映射回汉字）',
  args: { term: 'hfs' },
};

export const FullPinyin: Story = {
  name: '全拼命中',
  args: { term: 'heifeng' },
};

export const NoMatch: Story = {
  name: '未命中（原样输出）',
  args: { term: '火焰山' },
};

export const LongText: Story = {
  name: '极端长文本',
  args: {
    text: '盘踞黑风山的妖王，一身玄铁般的皮毛，力沉而不失灵巧。守着山门，也守着自己那点讲究。'.repeat(
      6,
    ),
    term: '黑风山',
  },
};

export const EmptyTerm: Story = {
  name: '空关键词（不高亮）',
  args: { term: '' },
};
