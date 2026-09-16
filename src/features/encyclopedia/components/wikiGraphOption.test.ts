import { describe, expect, it } from 'vitest';

import type { WikiGraph } from '@/data/contracts/encyclopedia';
import {
  buildGraphOption,
  describeTooltip,
  readClickedNodeId,
} from '@/features/encyclopedia/components/wikiGraphOption';
import type { ChartPalette } from '@/utils/themeTokens';

const palette: ChartPalette = {
  accent: '#c8a96a',
  accentHi: '#e8ce96',
  text: '#ece6d9',
  textMuted: '#9c968a',
  line: '#6b6b6b',
  surface: '#16161a',
  danger: '#c2453f',
  spirit: '#5c9c8b',
};

const graph: WikiGraph = {
  nodes: [
    { id: 'a', name: '黑风山', category: 'location', rarity: 3, isRoot: true },
    { id: 'b', name: '黑熊精', category: 'boss', rarity: 5, isRoot: false },
  ],
  links: [{ source: 'a', target: 'b' }],
};

describe('buildGraphOption', () => {
  it('中心节点比邻居大', () => {
    const option = buildGraphOption(graph, palette);
    const series = Array.isArray(option.series) ? option.series[0] : option.series;
    const data = (series as { data?: { symbolSize?: number }[] }).data ?? [];

    // 第一个节点是 root
    expect(data[0]?.symbolSize ?? 0).toBeGreaterThan(data[1]?.symbolSize ?? 0);
  });

  it('节点颜色来自令牌调色板（稀有度映射）', () => {
    const option = buildGraphOption(graph, palette);
    const series = Array.isArray(option.series) ? option.series[0] : option.series;
    const data = (series as { data?: { itemStyle?: { color?: string } }[] }).data ?? [];

    // 5 星用高亮鎏金，3 星用灵蕴青
    expect(data[1]?.itemStyle?.color).toBe(palette.accentHi);
    expect(data[0]?.itemStyle?.color).toBe(palette.spirit);
  });

  it('连线按 source/target 映射', () => {
    const option = buildGraphOption(graph, palette);
    const series = Array.isArray(option.series) ? option.series[0] : option.series;
    const links = (series as { links?: { source: string; target: string }[] }).links ?? [];

    expect(links).toEqual([{ source: 'a', target: 'b' }]);
  });

  it('空图谱不抛错（边界）', () => {
    expect(() => buildGraphOption({ nodes: [], links: [] }, palette)).not.toThrow();
  });
});

describe('readClickedNodeId / describeTooltip（守卫）', () => {
  it('从 echarts 事件参数里取 id 与 name', () => {
    expect(readClickedNodeId({ data: { id: 'wiki-a', name: '甲' } })).toBe('wiki-a');
    expect(describeTooltip({ data: { id: 'wiki-a', name: '甲' } })).toBe('甲');
  });

  it('形状不对时返回 null / 空串，而不是抛错或透传 undefined', () => {
    expect(readClickedNodeId(null)).toBeNull();
    expect(readClickedNodeId('x')).toBeNull();
    expect(readClickedNodeId({})).toBeNull();
    expect(readClickedNodeId({ data: 'x' })).toBeNull();
    expect(readClickedNodeId({ data: { id: 42 } })).toBeNull();
    expect(describeTooltip({ data: { name: 42 } })).toBe('');
  });
});
