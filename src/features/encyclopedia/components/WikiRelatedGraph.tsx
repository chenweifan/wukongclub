import { useMemo } from 'react';

import { GraphChart } from 'echarts/charts';
import { TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import ReactEChartsCore from 'echarts-for-react/lib/core';

import type { WikiGraph } from '@/data/contracts/encyclopedia';
import {
  GRAPH_DEFAULT_HEIGHT,
  buildGraphOption,
  readClickedNodeId,
} from '@/features/encyclopedia/components/wikiGraphOption';
import { COPY } from '@/utils/copy';

/**
 * 按需注册 ECharts 模块（只引入关系图 + 提示 + Canvas 渲染器）。
 * 全量 `import 'echarts'` 会把地图、折线、饼图等一并打进包，这里用不到。
 * 本组件由详情抽屉 React.lazy 加载，因此 echarts 也不进百科页首屏。
 */
echarts.use([GraphChart, TooltipComponent, CanvasRenderer]);

export interface WikiRelatedGraphProps {
  graph: WikiGraph;
  /** 点击节点切换中心词条。 */
  onSelect: (entryId: string) => void;
  height?: number;
}

export function WikiRelatedGraph({
  graph,
  onSelect,
  height = GRAPH_DEFAULT_HEIGHT,
}: WikiRelatedGraphProps) {
  const option = useMemo(() => buildGraphOption(graph), [graph]);

  const handleClick = (params: unknown) => {
    const id = readClickedNodeId(params);
    // 只接受图谱里真实存在的节点：避免把 echarts 回传的自由形状当成业务数据
    if (id !== null && graph.nodes.some((node) => node.id === id)) {
      onSelect(id);
    }
  };

  if (graph.nodes.length === 0) {
    return <p className="text-xs text-content-muted">{COPY.wiki.detail.graphEmpty}</p>;
  }

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      notMerge
      lazyUpdate
      style={{ height, width: '100%' }}
      onEvents={{ click: handleClick }}
    />
  );
}
