import { describe, expect, it } from 'vitest';

import { DEFAULT_DEMO_STATE } from '@/demo/types';
import type { DemoState } from '@/demo/types';
import {
  hasDemoQuery,
  parseDemoBoolean,
  parseDemoQuery,
  readDemoStateFromUrl,
  writeDemoStateToUrl,
} from '@/demo/urlState';

const fullState: DemoState = {
  enabled: true,
  role: 'admin',
  uiState: 'offline',
  theme: 'contrast',
  spoiler: true,
  seed: 777,
  frozenTime: '2026-01-01T00:00:00.000Z',
  tour: 'first-visit',
  clean: true,
  grid: true,
};

describe('parseDemoBoolean', () => {
  it('识别真值写法', () => {
    for (const value of ['1', 'true', 'TRUE', ' yes ', 'on']) {
      expect(parseDemoBoolean(value)).toBe(true);
    }
  });

  it('其余一律为假（不做「非空即真」的猜测）', () => {
    for (const value of ['0', 'false', '', 'no', 'off', '2', 'ink']) {
      expect(parseDemoBoolean(value)).toBe(false);
    }
  });
});

describe('parseDemoQuery', () => {
  it('解析协议示例里的完整链接', () => {
    const patch = parseDemoQuery(
      '?demo=1&role=admin&ui=empty&theme=ink&spoiler=0&seed=42&tour=first-visit&clean=1',
    );

    expect(patch).toEqual({
      enabled: true,
      role: 'admin',
      uiState: 'empty',
      theme: 'ink',
      spoiler: false,
      seed: 42,
      tour: 'first-visit',
      clean: true,
    });
  });

  it('非法值被忽略（保留默认），绝不抛错', () => {
    const patch = parseDemoQuery('?role=superuser&ui=exploded&theme=neon&seed=abc&grid=maybe');

    expect(patch.role).toBeUndefined();
    expect(patch.uiState).toBeUndefined();
    expect(patch.theme).toBeUndefined();
    expect(patch.seed).toBeUndefined();
    expect(patch.grid).toBe(false);
  });

  it('seed 越界或非整数时忽略', () => {
    expect(parseDemoQuery('?seed=-1').seed).toBeUndefined();
    expect(parseDemoQuery('?seed=999999999').seed).toBeUndefined();
    expect(parseDemoQuery('?seed=3.14').seed).toBe(3);
  });

  it('time 非法时忽略，合法时归一化成 ISO', () => {
    expect(parseDemoQuery('?time=not-a-date').frozenTime).toBeUndefined();
    expect(parseDemoQuery('?time=2026-01-01').frozenTime).toBe('2026-01-01T00:00:00.000Z');
  });

  it('只写了 role=admin 也视为进入演示模式（否则参数生效却看不到控制台）', () => {
    expect(parseDemoQuery('?role=admin').enabled).toBe(true);
    expect(parseDemoQuery('?tour=first-visit').enabled).toBe(true);
  });

  it('显式 demo=0 覆盖「有其它演示参数」的推断', () => {
    expect(parseDemoQuery('?demo=0&role=admin').enabled).toBe(false);
  });

  it('空 query 不产生任何覆盖', () => {
    expect(parseDemoQuery('')).toEqual({});
    expect(hasDemoQuery('')).toBe(false);
  });

  it('无关参数不会误触发演示模式', () => {
    expect(hasDemoQuery('?build=abc&from=share')).toBe(false);
    expect(parseDemoQuery('?build=abc').enabled).toBeUndefined();
  });
});

describe('writeDemoStateToUrl', () => {
  it('演示开启时把所有字段显式写进 URL（链接自描述）', () => {
    const search = writeDemoStateToUrl('', fullState);

    expect(search).toContain('demo=1');
    expect(search).toContain('role=admin');
    expect(search).toContain('ui=offline');
    expect(search).toContain('theme=contrast');
    expect(search).toContain('spoiler=1');
    expect(search).toContain('seed=777');
    expect(search).toContain('clean=1');
    expect(search).toContain('grid=1');
    expect(search).toContain('tour=first-visit');
    expect(search).toContain('time=2026-01-01T00%3A00%3A00.000Z');
  });

  it('演示关闭时摘掉全部演示参数，返回空串', () => {
    expect(writeDemoStateToUrl('?demo=1&role=admin&ui=empty', DEFAULT_DEMO_STATE)).toBe('');
  });

  it('保留第三方参数（阶段 3 的配装分享链接不能被吃掉）', () => {
    const search = writeDemoStateToUrl('?build=abc123&from=share&demo=1&role=guest', fullState);

    expect(search).toContain('build=abc123');
    expect(search).toContain('from=share');
    expect(search).toContain('role=admin');
  });

  it('旧值会被完全替换，不残留', () => {
    const search = writeDemoStateToUrl('?ui=empty&seed=1&role=guest&demo=1', fullState);

    expect(search).not.toContain('ui=empty');
    expect(search).not.toContain('seed=1&');
    expect(search.match(/seed=/g)).toHaveLength(1);
  });

  it('frozenTime 与 tour 为空时不写入（避免长噪声参数）', () => {
    const search = writeDemoStateToUrl('', { ...fullState, frozenTime: null, tour: null });

    expect(search).not.toContain('time=');
    expect(search).not.toContain('tour=');
  });
});

describe('幂等性（协议验收：刷新 / 分享后状态完全一致）', () => {
  it('序列化 → 解析 → 合并默认值，得到完全相同的状态', () => {
    const search = writeDemoStateToUrl('?keep=1', fullState);
    const restored = readDemoStateFromUrl(search, DEFAULT_DEMO_STATE);

    expect(restored).toEqual(fullState);
  });

  it('连续两次序列化结果稳定（不会越写越长）', () => {
    const once = writeDemoStateToUrl('', fullState);
    const twice = writeDemoStateToUrl(once, readDemoStateFromUrl(once, DEFAULT_DEMO_STATE));

    expect(twice).toBe(once);
  });

  it('默认状态往返后仍是默认状态', () => {
    const enabledDefaults: DemoState = { ...DEFAULT_DEMO_STATE, enabled: true };
    const search = writeDemoStateToUrl('', enabledDefaults);

    expect(readDemoStateFromUrl(search, DEFAULT_DEMO_STATE)).toEqual(enabledDefaults);
  });
});
