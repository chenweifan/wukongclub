import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import type { GuideArticle, GuideStep } from '@/data/contracts/guide';
import { createGuideSeed } from '@/data/seeds/guide.seed';
import { GuideStepTimeline } from '@/features/guide/components/GuideStepTimeline';
import type { SpoilerContext } from '@/utils/spoiler';

const seed = createGuideSeed(new Date('2026-02-14T12:00:00.000Z'));

function requireGuide(id: string): GuideArticle {
  const guide = seed.find((item) => item.id === id);
  if (guide === undefined) {
    throw new Error(`story 前置数据缺失：${id}`);
  }
  return guide;
}

// 整体 0 级、最后一步 1 级：步骤级遮罩的演示数据
const MIXED = requireGuide('guide-build-burst');
// 整体 2 级
const SPOILER = requireGuide('guide-ending-secret');

const HIDDEN: SpoilerContext = { spoilerVisible: false, revealedIds: [] };

/**
 * 步骤时间轴：有序列表 + 每步耗时 / 提示块 + **步骤级**剧透遮罩。
 * 一条攻略可以整体安全，但其中某一步含结局信息 —— 那就只遮那一步。
 */
const meta = {
  title: '业务组件/GuideStepTimeline',
  component: GuideStepTimeline,
  tags: ['autodocs'],
  args: {
    steps: MIXED.steps,
    spoilerContext: HIDDEN,
    onRevealStep: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="bg-bg max-w-2xl p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GuideStepTimeline>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 自己管「揭开」状态：story 里点一下就能看到遮罩消失，和页面行为一致。 */
function Harness({ steps, revealed = [] }: { steps: readonly GuideStep[]; revealed?: string[] }) {
  const [revealedIds, setRevealedIds] = useState<readonly string[]>(revealed);

  return (
    <GuideStepTimeline
      steps={steps}
      spoilerContext={{ spoilerVisible: false, revealedIds }}
      onRevealStep={(stepId) => {
        setRevealedIds((previous) =>
          previous.includes(stepId) ? previous : [...previous, stepId],
        );
      }}
    />
  );
}

export const InteractiveReveal: Story = {
  name: '可交互（点开单步）',
  render: () => <Harness steps={MIXED.steps} />,
};

export const AllStepsMasked: Story = {
  name: '整篇含剧透',
  args: { steps: SPOILER.steps },
};

export const SpoilerVisible: Story = {
  name: '剧透保护关闭时',
  args: { spoilerContext: { spoilerVisible: true, revealedIds: [] } },
};

export const NoSteps: Story = {
  name: '没有步骤（边界）',
  args: { steps: [] },
};

export const LongText: Story = {
  name: '极端长文本',
  args: {
    steps: [
      {
        id: 'story-step-1',
        title: `步骤标题：${'很长的标题'.repeat(10)}`,
        detail: '很长的正文：'.repeat(80),
        tip: '很长的提示：'.repeat(20),
        minutes: 3,
        spoilerLevel: 0,
      },
    ],
  },
};

export const HighContrast: Story = {
  name: '高对比主题',
  globals: { theme: 'contrast' },
  render: () => <Harness steps={MIXED.steps} />,
};
