import { describe, expect, it } from 'vitest';

import { DEMO_SCENARIO_IDS, DEMO_SCENARIOS, findDemoScenario } from '@/demo/scenarios/index';
import { DEMO_STATE_KEYS } from '@/demo/types';
import { DEMO_TOURS } from '@/demo/tours';
import { isDeliveredRoute } from '@/app/navigation';
import { routes } from '@/app/router';
import type { RouteObject } from 'react-router-dom';

/** 收集路由表里的全部 path，用来校验场景/引导指向的页面真的存在。 */
function collectPaths(routeObjects: readonly RouteObject[]): string[] {
  const paths: string[] = [];

  for (const route of routeObjects) {
    if (typeof route.path === 'string') {
      paths.push(route.path);
    }
    if (route.children !== undefined) {
      paths.push(...collectPaths(route.children));
    }
  }

  return paths;
}

/**
 * 路由表里既有相对 path（'wiki'）也有绝对 path（'/admin'），
 * 因此两侧都要归一化再比较 —— 否则绝对路径会被误判成「不存在」。
 */
function normalizePath(path: string): string {
  return path === '/' ? '/' : path.replace(/^\//, '');
}

const routePaths = collectPaths(routes).map(normalizePath);

function isKnownRoute(path: string): boolean {
  const normalized = normalizePath(path);
  return normalized === '/' || routePaths.includes(normalized);
}

describe('预设场景', () => {
  it('七个场景齐备且顺序与协议一致', () => {
    expect(DEMO_SCENARIOS.map((scenario) => scenario.id)).toEqual([...DEMO_SCENARIO_IDS]);
  });

  it('协议点名的七个 id 一个不少', () => {
    for (const id of [
      'first-visit',
      'spoiler-free',
      'build-master',
      'moderate-flow',
      'empty-launch',
      'chaos',
      'event-season',
    ]) {
      expect(findDemoScenario(id)).toBeDefined();
    }
  });

  it('每个场景都有名称、描述与非空 patch', () => {
    for (const scenario of DEMO_SCENARIOS) {
      expect(scenario.name.length).toBeGreaterThan(0);
      expect(scenario.description.length).toBeGreaterThan(10);
      expect(Object.keys(scenario.patch).length).toBeGreaterThan(0);
    }
  });

  it('patch 的键必须是 DemoState 的合法字段（拼错字段名会静默失效，必须挡住）', () => {
    for (const scenario of DEMO_SCENARIOS) {
      for (const key of Object.keys(scenario.patch)) {
        expect(DEMO_STATE_KEYS).toContain(key);
      }
    }
  });

  it('route 必须指向真实存在的路由', () => {
    for (const scenario of DEMO_SCENARIOS) {
      expect(isKnownRoute(scenario.route), `场景 ${scenario.id} 指向了不存在的路由`).toBe(true);
    }
  });

  it('场景落点要么是已交付模块，要么是刻意演示守卫/占位的页面', () => {
    // 剩余模块已终止开发：场景不该把评审丢到一个「什么都做不了」的占位页上。
    // 唯一例外是后台 —— 那个场景演示的正是角色守卫（403），已写在场景描述里。
    const intentionallyNotDelivered = new Set(['/admin']);

    for (const scenario of DEMO_SCENARIOS) {
      if (intentionallyNotDelivered.has(scenario.route)) {
        continue;
      }

      expect(
        isDeliveredRoute(scenario.route),
        `场景 ${scenario.id} 落在未交付的 ${scenario.route}`,
      ).toBe(true);
    }
  });

  it('tourId 必须能对应到已注册的引导剧本', () => {
    for (const scenario of DEMO_SCENARIOS) {
      if (scenario.tourId === undefined) {
        continue;
      }
      expect(DEMO_TOURS.map((tour) => tour.id)).toContain(scenario.tourId);
    }
  });

  it('混沌场景真的把异常态压满（断网 + 封禁 + 高对比）', () => {
    const chaos = findDemoScenario('chaos');
    expect(chaos?.patch.uiState).toBe('offline');
    expect(chaos?.patch.role).toBe('banned');
    expect(chaos?.patch.theme).toBe('contrast');
  });

  it('空数据场景声明了 seedData 且界面状态为 empty', () => {
    const empty = findDemoScenario('empty-launch');
    expect(empty?.patch.uiState).toBe('empty');
    expect(typeof empty?.seedData).toBe('function');
  });

  it('未知场景 id 返回 undefined（由调用方提示）', () => {
    expect(findDemoScenario('not-a-scenario')).toBeUndefined();
  });
});
