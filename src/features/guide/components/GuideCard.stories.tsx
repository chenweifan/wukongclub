import type { Meta, StoryObj } from '@storybook/react-vite';

import type { GuideArticle } from '@/data/contracts/guide';
import { createGuideSeed } from '@/data/seeds/guide.seed';
import { GuideCard } from '@/features/guide/components/GuideCard';
import type { SpoilerContext } from '@/utils/spoiler';

const seed = createGuideSeed(new Date('2026-02-14T12:00:00.000Z'));

function requireGuide(id: string): GuideArticle {
  const guide = seed.find((item) => item.id === id);
  if (guide === undefined) {
    throw new Error(`story 前置数据缺失：${id}`);
  }
  return guide;
}

const HIDDEN: SpoilerContext = { spoilerVisible: false, revealedIds: [] };
const VISIBLE: SpoilerContext = { spoilerVisible: true, revealedIds: [] };

/** 三类各取一条，另加一条「整体安全但含一级剧透步骤」的配装攻略。 */
const BOSS = requireGuide('guide-heixiongjing');
const MIXED = requireGuide('guide-build-burst');
const SPOILER = requireGuide('guide-ending-secret');

/**
 * 攻略卡片：分类 / 难度 / 章节 / 耗时 / 标签 / 点赞 / 剧透标记。
 * 剧透标记取「攻略 + 步骤」的最高级别 —— 列表上就该看出点进去会不会被剧透。
 */
const meta = {
  title: '业务组件/GuideCard',
  component: GuideCard,
  tags: ['autodocs'],
  args: {
    guide: BOSS,
    liked: false,
    likePending: false,
    spoilerContext: VISIBLE,
    onOpen: () => undefined,
    onToggleLike: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GuideCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const BuildGuide: Story = {
  name: '配装攻略',
  args: { guide: requireGuide('guide-build-control') },
};

export const EndingGuideMasked: Story = {
  name: '结局攻略（含剧透）',
  args: { guide: SPOILER, spoilerContext: HIDDEN },
};

export const StepLevelSpoiler: Story = {
  name: '整体安全但含剧透步骤',
  args: { guide: MIXED, spoilerContext: HIDDEN },
};

export const Liked: Story = {
  name: '已点赞',
  args: { liked: true },
};

export const LikePending: Story = {
  name: '点赞提交中',
  args: { likePending: true },
};

export const LongText: Story = {
  name: '极端长文本',
  args: {
    guide: {
      ...BOSS,
      title: '一个被刻意写得很长的攻略标题，用来验证标题换行、元信息折行与标签换行是否稳定',
      summary: '很长的摘要：'.repeat(40),
      author: '一位名字特别长的社区作者'.repeat(4),
    },
  },
};

export const HighContrast: Story = {
  name: '高对比主题',
  globals: { theme: 'contrast' },
  args: { guide: SPOILER, spoilerContext: HIDDEN },
};
