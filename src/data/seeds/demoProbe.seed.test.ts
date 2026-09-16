import { describe, expect, it } from 'vitest';

import {
  BASELINE_PROBE_COUNT,
  FILLED_PROBE_COUNT,
  createProbeSeed,
} from '@/data/seeds/demoProbe.seed';

describe('演示探针种子', () => {
  it('数据量与常量一致', () => {
    expect(createProbeSeed(BASELINE_PROBE_COUNT, 42)).toHaveLength(BASELINE_PROBE_COUNT);
    expect(createProbeSeed(FILLED_PROBE_COUNT, 42)).toHaveLength(FILLED_PROBE_COUNT);
  });

  it('同一 seed 完全可复现（协议要求：长尾数据也要确定性）', () => {
    expect(createProbeSeed(20, 42)).toEqual(createProbeSeed(20, 42));
  });

  it('不同 seed 产出不同数据（否则 seed 参数就是摆设）', () => {
    const a = createProbeSeed(20, 42);
    const b = createProbeSeed(20, 777);

    expect(a).not.toEqual(b);
    expect(a.map((probe) => probe.id)).not.toEqual(b.map((probe) => probe.id));
  });

  it('id 唯一且可读（含 seed 与序号，便于快照 diff）', () => {
    const probes = createProbeSeed(FILLED_PROBE_COUNT, 7);
    const ids = new Set(probes.map((probe) => probe.id));

    expect(ids.size).toBe(probes.length);
    expect(probes[0]?.id).toBe('probe-7-000');
  });

  it('createdAt 单调递增（列表按时间排序才稳定）', () => {
    const probes = createProbeSeed(30, 3);
    const timestamps = probes.map((probe) => Date.parse(probe.createdAt));

    for (let index = 1; index < timestamps.length; index += 1) {
      expect(timestamps[index]).toBeGreaterThan(timestamps[index - 1] ?? 0);
    }
  });

  it('边界：0 条与负数不会崩，字段取值都在合法范围', () => {
    expect(createProbeSeed(0, 1)).toEqual([]);
    expect(createProbeSeed(-5, 1)).toEqual([]);

    for (const probe of createProbeSeed(40, 9)) {
      expect(probe.score).toBeGreaterThanOrEqual(1);
      expect(probe.score).toBeLessThanOrEqual(100);
      expect(['alpha', 'beta', 'gamma']).toContain(probe.category);
      expect(probe.label.length).toBeGreaterThan(0);
    }
  });
});
