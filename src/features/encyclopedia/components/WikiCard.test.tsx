import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { WikiCard } from '@/features/encyclopedia/components/WikiCard';
import { createWikiSeed } from '@/data/seeds/encyclopedia.seed';
import type { WikiEntry } from '@/data/contracts/encyclopedia';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const heifengshan = createWikiSeed().find((entry) => entry.id === 'wiki-heifengshan');

function requireEntry(entry: WikiEntry | undefined): WikiEntry {
  if (entry === undefined) {
    throw new Error('测试前置数据缺失');
  }
  return entry;
}

const entry = requireEntry(heifengshan);

function renderCard(overrides: Partial<Parameters<typeof WikiCard>[0]> = {}) {
  const handlers = {
    onOpen: vi.fn(),
    onToggleFavorite: vi.fn(),
    onToggleCompare: vi.fn(),
  };

  const view = render(
    <WikiCard
      entry={entry}
      searchTerm=""
      favorited={false}
      selectedForCompare={false}
      compareDisabled={false}
      {...handlers}
      {...overrides}
    />,
  );

  return { ...handlers, ...view };
}

describe('WikiCard', () => {
  it('展示名称、分类、章节与稀有度', () => {
    renderCard();

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('黑风山');
    expect(screen.getByText('地点')).toBeInTheDocument();
    expect(screen.getByText('第1章 · 黑风山')).toBeInTheDocument();
    expect(screen.getAllByTitle('稀有度').length).toBeGreaterThan(0);
  });

  it('命中关键词时高亮（搜 hfs 能看出为什么命中）', () => {
    renderCard({ searchTerm: '黑风' });

    const marks = document.querySelectorAll('mark');
    expect(marks.length).toBeGreaterThan(0);
    expect(marks[0]).toHaveTextContent('黑风');
  });

  it('搜索拼音首字母时高亮仍落在中文文本上', () => {
    renderCard({ searchTerm: 'hfs' });

    const marks = [...document.querySelectorAll('mark')].map((mark) => mark.textContent ?? '');
    expect(marks.join('')).toContain('黑风山');
  });

  it('未收藏时按钮为未按下态，点击后回调被调用', () => {
    const { onToggleFavorite } = renderCard();

    const button = screen.getByRole('button', { name: `收藏：${entry.name}` });
    expect(button).toHaveAttribute('aria-pressed', 'false');

    button.click();
    expect(onToggleFavorite).toHaveBeenCalledWith(entry.id);
  });

  it('已收藏时按钮为按下态并显示取消文案', () => {
    renderCard({ favorited: true });

    const button = screen.getByRole('button', { name: `取消收藏：${entry.name}` });
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('对比已满且未选中该词条时，对比按钮禁用', () => {
    renderCard({ compareDisabled: true });

    expect(screen.getByRole('button', { name: '加入对比' })).toBeDisabled();
  });

  it('已选中的词条即使对比已满也可以移出', () => {
    renderCard({ compareDisabled: true, selectedForCompare: true });

    expect(screen.getByRole('button', { name: '移出对比' })).toBeEnabled();
  });

  it('点击标题与「查看详情」都会打开详情', () => {
    const { onOpen } = renderCard();

    screen.getByRole('button', { name: `黑风山` }).click();
    screen.getByRole('button', { name: '查看详情' }).click();

    expect(onOpen).toHaveBeenCalledTimes(2);
    expect(onOpen).toHaveBeenCalledWith(entry.id);
  });
});

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function Probe({ value }: { value: string }) {
    const debounced = useDebouncedValue(value, 200);
    return <p data-testid="value">{debounced}</p>;
  }

  it('初始值立即可用', () => {
    render(<Probe value="a" />);
    expect(screen.getByTestId('value')).toHaveTextContent('a');
  });

  it('延迟窗口内保持旧值，窗口结束后才更新', () => {
    const view = render(<Probe value="a" />);
    view.rerender(<Probe value="ab" />);

    expect(screen.getByTestId('value')).toHaveTextContent('a');

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByTestId('value')).toHaveTextContent('ab');
  });

  it('连续输入只落最后一次（打字不会被每个字符打断）', () => {
    const view = render(<Probe value="a" />);

    for (const value of ['ab', 'abc', 'abcd']) {
      view.rerender(<Probe value={value} />);
      act(() => {
        vi.advanceTimersByTime(100);
      });
    }

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByTestId('value')).toHaveTextContent('abcd');
  });
});
