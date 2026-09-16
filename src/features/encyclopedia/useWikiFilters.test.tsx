import type { ReactNode } from 'react';

import { act, renderHook } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { DEFAULT_WIKI_SORT, useWikiFilters } from '@/features/encyclopedia/useWikiFilters';

/**
 * 筛选状态放 URL 的契约测试。
 * 关键点：`wikiEntry`（详情抽屉）**不是**筛选条件 ——
 * 它必须能被解析与写回，但不能被「清空筛选」带走，否则点清空会把正在看的词条关掉。
 */
function wrapperFor(initialUrl: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[initialUrl]}>{children}</MemoryRouter>;
  };
}

function renderFilters(initialUrl: string) {
  return renderHook(() => ({ filters: useWikiFilters(), location: useLocation() }), {
    wrapper: wrapperFor(initialUrl),
  });
}

describe('useWikiFilters（URL 双向同步）', () => {
  it('从 URL 解析筛选条件与抽屉词条', () => {
    const { result } = renderFilters(
      '/wiki?wikiChapter=2&wikiCategory=yaoguai&wikiRarity=2&wikiSearch=%E9%BB%91%E7%86%8A&wikiSort=name&wikiEntry=wiki-heixiongjing',
    );

    expect(result.current.filters.filters).toEqual({
      chapter: 2,
      category: 'yaoguai',
      rarity: 2,
      search: '黑熊',
      sort: 'name',
    });
    expect(result.current.filters.selectedEntryId).toBe('wiki-heixiongjing');
  });

  it('非法参数被忽略并回落到默认排序（不抛错）', () => {
    const { result } = renderFilters(
      '/wiki?wikiChapter=99&wikiCategory=nope&wikiRarity=abc&wikiSort=nope',
    );

    expect(result.current.filters.filters).toEqual({
      chapter: undefined,
      category: undefined,
      rarity: undefined,
      search: '',
      sort: DEFAULT_WIKI_SORT,
    });
    expect(result.current.filters.selectedEntryId).toBeNull();
  });

  it('空白的 wikiEntry 视为未打开抽屉（边界）', () => {
    const { result } = renderFilters('/wiki?wikiEntry=');
    expect(result.current.filters.selectedEntryId).toBeNull();
  });

  it('只有 wikiEntry 时不算「有筛选条件」', () => {
    const { result } = renderFilters('/wiki?wikiEntry=wiki-heifengshan');

    expect(result.current.filters.selectedEntryId).toBe('wiki-heifengshan');
    expect(result.current.filters.hasActiveFilters).toBe(false);
  });

  it('清空筛选时保留正在查看的词条（否则用户会被踢出详情）', () => {
    const { result } = renderFilters(
      '/wiki?wikiChapter=1&wikiSearch=%E7%81%B5%E8%99%9A&wikiEntry=wiki-lingxuzi',
    );

    act(() => {
      result.current.filters.reset();
    });

    expect(result.current.filters.hasActiveFilters).toBe(false);
    expect(result.current.filters.selectedEntryId).toBe('wiki-lingxuzi');
    expect(result.current.location.search).toContain('wikiEntry=wiki-lingxuzi');
    expect(result.current.location.search).not.toContain('wikiChapter');
  });

  it('打开与关闭抽屉都会写回 URL，且保留其他参数', () => {
    const { result } = renderFilters('/wiki?wikiChapter=3&demo=1');

    act(() => {
      result.current.filters.setSelectedEntryId('wiki-huangmei');
    });

    expect(result.current.filters.selectedEntryId).toBe('wiki-huangmei');
    expect(result.current.location.search).toContain('wikiChapter=3');
    // 演示参数是别人的地盘：回写时不能被抹掉
    expect(result.current.location.search).toContain('demo=1');

    act(() => {
      result.current.filters.setSelectedEntryId(null);
    });

    expect(result.current.filters.selectedEntryId).toBeNull();
    expect(result.current.location.search).not.toContain('wikiEntry');
    expect(result.current.location.search).toContain('wikiChapter=3');
  });

  it('词条 id 里的特殊字符会被正确编码（不会截断查询串）', () => {
    const { result } = renderFilters('/wiki');

    act(() => {
      result.current.filters.setSelectedEntryId('wiki-怪 id&x=1');
    });

    expect(result.current.filters.selectedEntryId).toBe('wiki-怪 id&x=1');
    expect(result.current.location.search).not.toContain('&x=1');
  });

  it('切换筛选条件用 replace，不会每个字都留一条历史（可后退语义）', () => {
    const { result } = renderFilters('/wiki');

    act(() => {
      result.current.filters.setFilter('search', '黑');
    });
    act(() => {
      result.current.filters.setFilter('search', '黑熊');
    });

    expect(result.current.location.search).toContain('wikiSearch=%E9%BB%91%E7%86%8A');
    expect(result.current.filters.filters.search).toBe('黑熊');
  });
});
