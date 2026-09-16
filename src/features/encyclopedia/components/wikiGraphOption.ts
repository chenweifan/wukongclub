import type { EChartsCoreOption } from 'echarts/core';

import type { WikiGraph } from '@/data/contracts/encyclopedia';
import { rarityColor, readChartPalette } from '@/utils/themeTokens';
import type { ChartPalette } from '@/utils/themeTokens';

/**
 * 关系图的配置生成（纯函数，可单测）。
 *
 * 单独成文件的原因有两个：一是纯函数不该和组件挤在一起（react-refresh 也会有意见），
 * 二是这样单测不需要引入 echarts-for-react，只验证「配置对不对」。
 *
 * 颜色全部来自设计令牌（见 utils/themeTokens）：canvas 拿不到 CSS 变量，
 * 这是把「令牌是唯一色源」贯彻到图表里的唯一做法。
 */
export const GRAPH_DEFAULT_HEIGHT = 260;

export function buildGraphOption(
  graph: WikiGraph,
  palette: ChartPalette = readChartPalette(),
): EChartsCoreOption {
  return {
    backgroundColor: 'transparent',
    tooltip: {
      show: true,
      backgroundColor: palette.surface,
      borderColor: palette.line,
      textStyle: { color: palette.text, fontSize: 12 },
      formatter: (params: unknown) => describeTooltip(params),
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        roam: true,
        draggable: true,
        data: graph.nodes.map((node) => ({
          id: node.id,
          name: node.name,
          symbolSize: node.isRoot ? 54 : 32,
          itemStyle: {
            color: rarityColor(node.rarity, palette),
            borderColor: palette.surface,
            borderWidth: 2,
          },
          label: { show: true, fontSize: 11 },
        })),
        links: graph.links.map((link) => ({
          source: link.source,
          target: link.target,
        })),
        force: { repulsion: 220, edgeLength: [70, 130], gravity: 0.08 },
        label: { show: true, position: 'right', color: palette.text, fontSize: 11 },
        lineStyle: { color: palette.line, width: 1, curveness: 0.08, opacity: 0.7 },
        emphasis: { focus: 'adjacency', label: { color: palette.accentHi } },
      },
    ],
    animationDuration: 400,
  };
}

/** tooltip 的 formatter 参数是 echarts 的自由形状，按协议铁律 9 用守卫收敛。 */
export function describeTooltip(params: unknown): string {
  const name = readNodeField(params, 'name');
  return name ?? '';
}

/** 从 echarts 的点击事件参数里取出节点 id；不是我们的节点就返回 null。 */
export function readClickedNodeId(params: unknown): string | null {
  return readNodeField(params, 'id');
}

function readNodeField(params: unknown, field: string): string | null {
  if (typeof params !== 'object' || params === null || !('data' in params)) {
    return null;
  }

  const data: unknown = params.data;
  if (typeof data !== 'object' || data === null || !(field in data)) {
    return null;
  }

  const value = (data as Record<string, unknown>)[field];
  return typeof value === 'string' ? value : null;
}
