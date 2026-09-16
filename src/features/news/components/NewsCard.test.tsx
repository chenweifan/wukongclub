import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SpoilerMask } from '@/components/ui/SpoilerMask';
import { NewsCard } from '@/features/news/components/NewsCard';
import { createNewsSeed } from '@/data/seeds/news.seed';
import type { NewsArticle } from '@/data/contracts/news';
import { COPY } from '@/utils/copy';

const NOW = new Date('2026-02-14T12:00:00.000Z');
const seed = createNewsSeed(NOW);

function requireArticle(id: string): NewsArticle {
  const article = seed.find((item) => item.id === id);
  if (article === undefined) {
    throw new Error(`测试前置数据缺失：${id}`);
  }
  return article;
}

const SAFE_ARTICLE = requireArticle('news-002');
const SPOILER_ARTICLE = requireArticle('news-009');
const EDITORIAL_ARTICLE = requireArticle('news-006');

function renderCard(article: NewsArticle, overrides: Partial<Parameters<typeof NewsCard>[0]> = {}) {
  const handlers = {
    onToggleExpand: vi.fn(),
    onReveal: vi.fn(),
    onOpenSource: vi.fn(),
  };

  render(
    <NewsCard
      article={article}
      visibility="full"
      expanded={false}
      now={NOW}
      {...handlers}
      {...overrides}
    />,
  );

  return handlers;
}

describe('SpoilerMask（站级原语）', () => {
  it('被遮罩的内容对读屏隐藏（否则无障碍用户绕过剧透保护）', () => {
    render(
      <SpoilerMask level={2} onReveal={() => undefined}>
        <p>这一段是结局剧透</p>
      </SpoilerMask>,
    );

    // 视觉层带 aria-hidden，因此读屏拿不到这段文字
    const hidden = screen.getByText('这一段是结局剧透');
    expect(hidden.closest('[aria-hidden="true"]')).not.toBeNull();

    expect(screen.getByRole('group', { name: COPY.spoiler.title })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: COPY.spoiler.reveal })).toBeInTheDocument();
  });

  it('点击「揭开这一条」触发回调', () => {
    const onReveal = vi.fn();
    render(
      <SpoilerMask level={1} onReveal={onReveal}>
        <p>剧透内容</p>
      </SpoilerMask>,
    );

    fireEvent.click(screen.getByRole('button', { name: COPY.spoiler.reveal }));
    expect(onReveal).toHaveBeenCalledTimes(1);
  });

  it('展示剧透级别文案', () => {
    render(
      <SpoilerMask level={2} onReveal={() => undefined}>
        <p>结局</p>
      </SpoilerMask>,
    );

    expect(screen.getByText(COPY.spoiler.levels[2])).toBeInTheDocument();
  });
});

describe('NewsCard', () => {
  it('展示标题、类目、来源与时间', () => {
    renderCard(SAFE_ARTICLE);

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(SAFE_ARTICLE.title);
    expect(screen.getByText(COPY.news.category[SAFE_ARTICLE.category])).toBeInTheDocument();
    expect(screen.getByText(SAFE_ARTICLE.source.name)).toBeInTheDocument();
  });

  it('置顶条目带置顶标记', () => {
    renderCard(requireArticle('news-000'));
    expect(screen.getByText(COPY.news.pinned)).toBeInTheDocument();
  });

  it('含剧透条目遮罩摘要，且「展开正文」被禁用', () => {
    renderCard(SPOILER_ARTICLE, { visibility: 'masked' });

    expect(screen.getByRole('group', { name: COPY.spoiler.title })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: COPY.news.expand })).toBeDisabled();
    // 剧透级别会同时出现在元信息与遮罩上，这里只要求它确实被标出来了
    expect(
      screen.getAllByText(COPY.spoiler.levels[SPOILER_ARTICLE.spoilerLevel]).length,
    ).toBeGreaterThan(0);
  });

  it('已揭开的含剧透条目：摘要可见、可以展开正文', () => {
    renderCard(SPOILER_ARTICLE, { visibility: 'full', expanded: true });

    expect(screen.queryByRole('group', { name: COPY.spoiler.title })).not.toBeInTheDocument();
    expect(screen.getByText(SPOILER_ARTICLE.body[0] ?? '')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: COPY.news.collapse })).toBeEnabled();
  });

  it('站内编辑内容用按钮（没有外链），外部来源用真链接', () => {
    const { unmount } = render(
      <NewsCard
        article={EDITORIAL_ARTICLE}
        visibility="full"
        expanded={false}
        now={NOW}
        onToggleExpand={vi.fn()}
        onReveal={vi.fn()}
        onOpenSource={vi.fn()}
      />,
    );
    expect(EDITORIAL_ARTICLE.source.url).toBeNull();
    expect(screen.queryByRole('link', { name: COPY.news.openSource })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: COPY.news.openSource })).toBeInTheDocument();
    unmount();

    renderCard(SAFE_ARTICLE);
    const link = screen.getByRole('link', { name: COPY.news.openSource });
    expect(link).toHaveAttribute('href', SAFE_ARTICLE.source.url ?? '');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('展开 / 收起触发回调', () => {
    const { onToggleExpand } = renderCard(SAFE_ARTICLE);

    fireEvent.click(screen.getByRole('button', { name: COPY.news.expand }));
    expect(onToggleExpand).toHaveBeenCalledWith(SAFE_ARTICLE.id);
  });

  it('极端长文本不崩（标题、摘要与正文都很长）', () => {
    renderCard(
      {
        ...SAFE_ARTICLE,
        title: '一个被刻意写得很长的资讯标题用来验证换行与布局稳定性'.repeat(3),
        summary: '很长的摘要：'.repeat(60),
        body: ['很长的正文段落：'.repeat(80)],
      },
      { expanded: true },
    );

    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });
});
