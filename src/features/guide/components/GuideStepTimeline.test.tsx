import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { GuideArticle, GuideStep } from '@/data/contracts/guide';
import { createGuideSeed } from '@/data/seeds/guide.seed';
import { GuideStepTimeline } from '@/features/guide/components/GuideStepTimeline';
import { COPY } from '@/utils/copy';
import type { SpoilerContext } from '@/utils/spoiler';

const seed = createGuideSeed(new Date('2026-02-14T12:00:00.000Z'));

const HIDDEN: SpoilerContext = { spoilerVisible: false, revealedIds: [] };
const VISIBLE: SpoilerContext = { spoilerVisible: true, revealedIds: [] };

function requireGuide(id: string): GuideArticle {
  const guide = seed.find((item) => item.id === id);
  if (guide === undefined) {
    throw new Error(`测试前置数据缺失：${id}`);
  }
  return guide;
}

function requireStep(guide: GuideArticle, predicate: (step: GuideStep) => boolean): GuideStep {
  const step = guide.steps.find(predicate);
  if (step === undefined) {
    throw new Error(`测试前置数据缺失：${guide.id} 里没有符合条件的步骤`);
  }
  return step;
}

// 整体 0 级、最后一步 1 级：用来验证「只遮那一步」
const MIXED_GUIDE = requireGuide('guide-build-burst');
const SPOILER_STEP = requireStep(MIXED_GUIDE, (step) => step.spoilerLevel > 0);
const SAFE_STEP = requireStep(MIXED_GUIDE, (step) => step.spoilerLevel === 0);

function renderTimeline(
  steps: readonly GuideStep[],
  spoilerContext: SpoilerContext,
  onRevealStep = vi.fn(),
) {
  render(
    <GuideStepTimeline steps={steps} spoilerContext={spoilerContext} onRevealStep={onRevealStep} />,
  );

  return onRevealStep;
}

describe('GuideStepTimeline', () => {
  it('用有序列表渲染步骤，读屏能念出「第 N 步」', () => {
    renderTimeline(MIXED_GUIDE.steps, VISIBLE);

    expect(screen.getByRole('list').tagName).toBe('OL');

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(MIXED_GUIDE.steps.length);

    for (const [index, step] of MIXED_GUIDE.steps.entries()) {
      expect(items[index]).toHaveTextContent(COPY.guide.detail.stepLabel(index + 1));
      expect(items[index]).toHaveTextContent(step.title);
    }
  });

  it('展示每步耗时与提示块', () => {
    const withTip = requireStep(
      MIXED_GUIDE,
      (step) => step.tip !== undefined && step.minutes !== undefined,
    );

    renderTimeline(MIXED_GUIDE.steps, VISIBLE);

    expect(
      screen.getAllByText(COPY.guide.detail.stepMinutes(withTip.minutes ?? 0)).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(`${COPY.guide.detail.tip}：`).length).toBeGreaterThan(0);
  });

  it('只遮含剧透的那一步，其余步骤照常可读', () => {
    renderTimeline(MIXED_GUIDE.steps, HIDDEN);

    // 恰好一个遮罩：不是整篇挡掉
    expect(screen.getAllByRole('group', { name: COPY.spoiler.title })).toHaveLength(1);

    // 遮罩层里的正文对读屏隐藏（否则剧透保护形同虚设）
    expect(screen.getByText(SPOILER_STEP.detail).closest('[aria-hidden="true"]')).not.toBeNull();

    // 无剧透步骤的正文照常可读，同时仍然提示「含剧透」
    expect(screen.getByText(SAFE_STEP.detail)).toBeInTheDocument();
    expect(screen.getAllByText(COPY.spoiler.levels[1]).length).toBeGreaterThan(0);
  });

  it('遮罩步骤不渲染提示块（提示本身也是剧透信息）', () => {
    const tip = SPOILER_STEP.tip;
    expect(tip).toBeDefined();

    renderTimeline(MIXED_GUIDE.steps, HIDDEN);

    expect(screen.queryAllByText(tip ?? '不该为空的提示')).toHaveLength(0);
    // 未遮罩步骤的提示照常渲染
    const safeTip = requireStep(
      MIXED_GUIDE,
      (step) => step.spoilerLevel === 0 && step.tip !== undefined,
    );
    expect(screen.getByText(safeTip.tip ?? '不该为空的提示')).toBeInTheDocument();
  });

  it('点击「揭开这一条」回传的是那一步的 id（只揭开一步）', () => {
    const onRevealStep = renderTimeline(MIXED_GUIDE.steps, HIDDEN);

    fireEvent.click(screen.getByRole('button', { name: COPY.spoiler.reveal }));

    expect(onRevealStep).toHaveBeenCalledTimes(1);
    expect(onRevealStep).toHaveBeenCalledWith(SPOILER_STEP.id);
  });

  it('已揭开的步骤按普通步骤渲染（不再有遮罩）', () => {
    renderTimeline(MIXED_GUIDE.steps, {
      spoilerVisible: false,
      revealedIds: [SPOILER_STEP.id],
    });

    expect(screen.queryByRole('group', { name: COPY.spoiler.title })).not.toBeInTheDocument();
    expect(screen.getByText(SPOILER_STEP.detail)).toBeInTheDocument();
  });

  it('全局剧透开关打开时全部步骤可见', () => {
    renderTimeline(MIXED_GUIDE.steps, VISIBLE);

    expect(screen.queryByRole('group', { name: COPY.spoiler.title })).not.toBeInTheDocument();
    expect(screen.getByText(SPOILER_STEP.detail)).toBeInTheDocument();
  });

  it('没有步骤时渲染空列表而不是报错（边界）', () => {
    renderTimeline([], VISIBLE);

    expect(screen.getByRole('list').children).toHaveLength(0);
  });

  it('超长正文与超多步骤不崩（边界）', () => {
    const manySteps: GuideStep[] = Array.from({ length: 60 }, (_value, index) => ({
      id: `step-${index}`,
      title: `步骤 ${index}：${'很长的标题'.repeat(10)}`,
      detail: '很长的正文：'.repeat(80),
      tip: '很长的提示：'.repeat(20),
      minutes: 3,
      spoilerLevel: 0,
    }));

    renderTimeline(manySteps, HIDDEN);

    expect(screen.getAllByRole('listitem')).toHaveLength(60);
    expect(screen.queryByRole('group', { name: COPY.spoiler.title })).not.toBeInTheDocument();
  });
});
