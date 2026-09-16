import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import type { GuideArticle } from '@/data/contracts/guide';
import { createGuideSeed } from '@/data/seeds/guide.seed';
import { GuideDetailDrawer } from '@/features/guide/components/GuideDetailDrawer';

const seed = createGuideSeed(new Date('2026-02-14T12:00:00.000Z'));

function requireGuide(id: string): GuideArticle {
  const guide = seed.find((item) => item.id === id);
  if (guide === undefined) {
    throw new Error(`story 前置数据缺失：${id}`);
  }
  return guide;
}

const MIXED = requireGuide('guide-build-burst');
const SPOILER = requireGuide('guide-ending-secret');

/**
 * 攻略详情抽屉（Radix Dialog）：元信息 + 逐步时间轴 + 关联影神图词条。
 *
 * 关联词条用 `<Link to="/wiki?wikiEntry=<id>">` 跳转 —— 影神图支持从 URL
 * 打开指定词条，因此这里在 story 里也带 Router 上下文（见 .storybook/decorators）。
 */
const meta = {
  title: '业务组件/GuideDetailDrawer',
  component: GuideDetailDrawer,
  tags: ['autodocs'],
  args: {
    guide: MIXED,
    likedIds: [],
    likePending: false,
    spoilerRevealedIds: [],
    onClose: () => undefined,
    onRevealStep: () => undefined,
    onToggleLike: () => undefined,
  },
} satisfies Meta<typeof GuideDetailDrawer>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 抽屉是受控的：story 里用状态驱动，才能真的点开关闭。 */
function Harness({ guide, revealed = [] }: { guide: GuideArticle; revealed?: string[] }) {
  const [openGuide, setOpenGuide] = useState<GuideArticle | null>(guide);
  const [revealedIds, setRevealedIds] = useState<readonly string[]>(revealed);
  const [liked, setLiked] = useState(false);

  return (
    <div className="p-4">
      <button
        type="button"
        onClick={() => {
          setOpenGuide(guide);
        }}
        className="border-token border-line rounded-scroll border px-3 py-1.5 text-xs"
      >
        重新打开攻略详情
      </button>

      <GuideDetailDrawer
        guide={openGuide}
        likedIds={liked ? [guide.id] : []}
        spoilerRevealedIds={revealedIds}
        onClose={() => {
          setOpenGuide(null);
        }}
        onRevealStep={(stepId) => {
          setRevealedIds((previous) =>
            previous.includes(stepId) ? previous : [...previous, stepId],
          );
        }}
        onToggleLike={() => {
          setLiked((previous) => !previous);
        }}
      />
    </div>
  );
}

export const Default: Story = {
  name: '步骤级剧透（可交互）',
  render: () => <Harness guide={MIXED} />,
};

export const AllStepsRevealed: Story = {
  name: '整篇含剧透（全部遮罩）',
  render: () => <Harness guide={SPOILER} />,
};

export const Closed: Story = {
  name: '关闭状态（不渲染内容）',
  args: { guide: null },
};

export const LongText: Story = {
  name: '极端长文本',
  render: () => (
    <Harness
      guide={{
        ...MIXED,
        title: '一个被刻意写得很长的攻略标题，用来验证抽屉标题换行与关闭按钮是否还够点',
        summary: '很长的摘要：'.repeat(40),
      }}
    />
  ),
};

export const HighContrast: Story = {
  name: '高对比主题',
  globals: { theme: 'contrast' },
  render: () => <Harness guide={MIXED} />,
};
