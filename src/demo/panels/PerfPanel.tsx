import { useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { COPY } from '@/utils/copy';

/**
 * 性能面板（工具）：帧率 / DOM 节点数 / Query 缓存条数 / JS 堆。
 * 定位是「快速体检」而不是 profiler：数值每秒刷新一次，够用来确认
 * 切主题、开栅格、跑引导这些操作有没有引起明显的掉帧或缓存泄漏。
 */
export function PerfPanel() {
  const queryClient = useQueryClient();
  const [fps, setFps] = useState(0);
  const [nodes, setNodes] = useState(0);
  const [cacheSize, setCacheSize] = useState(0);

  useEffect(() => {
    let frames = 0;
    let lastSampleAt = performance.now();
    let rafId = 0;

    const loop = () => {
      frames += 1;
      const now = performance.now();
      const elapsed = now - lastSampleAt;

      if (elapsed >= 1000) {
        setFps(Math.round((frames * 1000) / elapsed));
        setNodes(document.querySelectorAll('*').length);
        setCacheSize(queryClient.getQueryCache().getAll().length);
        frames = 0;
        lastSampleAt = now;
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [queryClient]);

  const heapMb = readHeapSizeMb();

  return (
    <aside
      aria-label={COPY.perf.title}
      className="border-token border-line bg-surface shadow-panel fixed left-4 top-[calc(var(--hmw-banner-h)+0.75rem)] z-[var(--hmw-z-console)] rounded-scroll border px-3 py-2 text-[11px]"
    >
      <p className="text-accent mb-1">{COPY.perf.title}</p>
      <dl className="grid grid-cols-[auto_auto] gap-x-3 gap-y-0.5 text-content-muted">
        <dt>{COPY.perf.fps}</dt>
        <dd className="text-right text-content">{fps}</dd>
        <dt>{COPY.perf.domNodes}</dt>
        <dd className="text-right text-content">{nodes}</dd>
        <dt>{COPY.perf.queryCache}</dt>
        <dd className="text-right text-content">{cacheSize}</dd>
        <dt>{COPY.perf.heap}</dt>
        <dd className="text-right text-content">
          {heapMb === null ? COPY.perf.unavailable : `${heapMb} MB`}
        </dd>
      </dl>
    </aside>
  );
}

/**
 * performance.memory 是 Chromium 的非标准扩展，TS 的 DOM 类型里没有它。
 * 按协议铁律 9 用 unknown + 类型守卫取，而不是断言。
 */
function readHeapSizeMb(): number | null {
  const perf: unknown = performance;

  if (typeof perf !== 'object' || perf === null || !('memory' in perf)) {
    return null;
  }

  const memory: unknown = perf.memory;

  if (typeof memory !== 'object' || memory === null || !('usedJSHeapSize' in memory)) {
    return null;
  }

  const used: unknown = memory.usedJSHeapSize;

  return typeof used === 'number' ? Math.round(used / (1024 * 1024)) : null;
}
