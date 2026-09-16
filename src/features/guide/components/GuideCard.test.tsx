import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { GuideArticle } from '@/data/contracts/guide';
import { CHAPTER_NAMES } from '@/data/contracts/encyclopedia';
import { createGuideSeed } from '@/data/seeds/guide.seed';
import { GuideCard } from '@/features/guide/components/GuideCard';
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

// 整体 0 级、最后一步 1 级：卡片应提示「1 步含剧透」
const MIXED_GUIDE = requireGuide('guide-build-burst');
// 整体 2 级
const SPOILER_GUIDE = requireGuide('guide-ending-secret');

function renderCard(guide: GuideArticle, overrides: Partial<Parameters<typeof GuideCard>[0]> = {}) {
  const handlers = {
    onOpen: vi.fn(),
    onToggleLike: vi.fn(),
  };

  const view = render(
    <GuideCard guide={guide} liked={false} spoilerContext={VISIBLE} {...handlers} {...overrides} />,
  );

  return { ...handlers, ...view };
}

describe('GuideCard', () => {
  it('展示标题、分类、难度、章节与耗时', () => {
    const { container } = renderCard(MIXED_GUIDE);

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(MIXED_GUIDE.title);
    // 用整卡文本断言：分类与标签可能同字（「配装」既是分类也是标签），逐个查会命中多个
    expect(container).toHaveTextContent(COPY.guide.kind[MIXED_GUIDE.kind]);
    expect(container).toHaveTextContent(COPY.guide.difficulty[MIXED_GUIDE.difficulty]);
    expect(container).toHaveTextContent(COPY.guide.card.minutes(MIXED_GUIDE.durationMinutes));
    expect(container).toHaveTextContent(COPY.guide.card.steps(MIXED_GUIDE.steps.length));
  });

  it('展示章节名与作者', () => {
    const { container } = renderCard(MIXED_GUIDE);

    expect(container).toHaveTextContent(
      COPY.guide.chapterLabel(MIXED_GUIDE.chapter, CHAPTER_NAMES[MIXED_GUIDE.chapter]),
    );
    expect(container).toHaveTextContent(COPY.guide.card.author(MIXED_GUIDE.author));
  });

  it('剧透标记取「攻略 + 步骤」里的最高级别（列表上就能看出会不会被剧透）', () => {
    const { container } = renderCard(MIXED_GUIDE, { spoilerContext: HIDDEN });

    // 攻略本身 0 级，但有一级剧透步骤 → 卡片必须标出来
    expect(container).toHaveTextContent(COPY.spoiler.levels[1]);
    expect(container).toHaveTextContent(COPY.guide.card.maskedSteps(1));
  });

  it('整体剧透的攻略：遮罩步数按级别统计', () => {
    const { container } = renderCard(SPOILER_GUIDE, { spoilerContext: HIDDEN });

    expect(container).toHaveTextContent(COPY.guide.card.maskedSteps(SPOILER_GUIDE.steps.length));
  });

  it('剧透开关打开后不再提示遮罩', () => {
    const { container } = renderCard(MIXED_GUIDE, { spoilerContext: VISIBLE });

    expect(container).toHaveTextContent(COPY.spoiler.levels[1]);
    expect(container).not.toHaveTextContent(COPY.guide.card.maskedSteps(1));
  });

  it('点击标题与「阅读攻略」都打开抽屉', () => {
    const { onOpen } = renderCard(MIXED_GUIDE);

    fireEvent.click(screen.getByRole('button', { name: MIXED_GUIDE.title }));
    fireEvent.click(screen.getByRole('button', { name: COPY.guide.detail.open }));

    expect(onOpen).toHaveBeenCalledTimes(2);
    expect(onOpen).toHaveBeenCalledWith(MIXED_GUIDE.id);
  });

  it('点赞按钮暴露 aria-pressed 状态', () => {
    const { onToggleLike } = renderCard(MIXED_GUIDE, { liked: true });

    const likeButton = screen.getByRole('button', {
      name: COPY.guide.like.liked(MIXED_GUIDE.likes),
    });
    expect(likeButton).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(likeButton);
    expect(onToggleLike).toHaveBeenCalledWith(MIXED_GUIDE.id);
  });

  it('点赞进行中时按钮禁用（防止重复提交）', () => {
    renderCard(MIXED_GUIDE, { likePending: true });

    expect(
      screen.getByRole('button', { name: COPY.guide.like.liked(MIXED_GUIDE.likes) }),
    ).toBeDisabled();
  });

  it('标签渲染成中文文案', () => {
    const { container } = renderCard(MIXED_GUIDE);

    for (const tag of MIXED_GUIDE.tags) {
      expect(container).toHaveTextContent(COPY.guide.tag[tag]);
    }
  });

  it('封面图对读屏隐藏（纯装饰，标题已表意）', () => {
    const { container } = renderCard(MIXED_GUIDE);
    const image = container.querySelector('img');

    expect(image).not.toBeNull();
    expect(image).toHaveAttribute('aria-hidden', 'true');
    expect(image?.getAttribute('src')?.startsWith('data:image/svg+xml')).toBe(true);
  });

  it('极端长文本不崩（超长标题、摘要与长作者名）', () => {
    renderCard({
      ...MIXED_GUIDE,
      title: '一个被刻意写得很长的攻略标题用来验证换行与布局稳定性'.repeat(3),
      summary: '很长的摘要：'.repeat(60),
      author: '一位名字特别长的社区作者'.repeat(4),
    });

    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });
});
