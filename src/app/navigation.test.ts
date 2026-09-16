import { describe, expect, it } from 'vitest';

import {
  DELIVERED_NAV,
  PLANNED_NAV,
  SIDEBAR_NAV,
  TOP_NAV,
  isDeliveredRoute,
} from '@/app/navigation';
import { routes } from '@/app/router';
import type { RouteObject } from 'react-router-dom';

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

const routePaths = collectPaths(routes);

/**
 * 导航的交付状态契约。
 *
 * 剩余模块已终止开发，因此「哪些能走通、哪些只是说明页」必须是**数据**，
 * 而不是散落在各处的注释：导航、首页、占位页与演示场景都读这份清单。
 * 这组测试守的就是它不会被后续改动悄悄改坏（例如把未交付模块放回顶部导航）。
 */
describe('导航交付状态', () => {
  it('每个模块都必须声明交付状态，且只有两种取值', () => {
    for (const item of SIDEBAR_NAV) {
      expect(['delivered', 'planned']).toContain(item.status);
      expect(item.label.length).toBeGreaterThan(0);
      expect(item.description.length).toBeGreaterThan(0);
      expect(item.seal.length).toBeGreaterThan(0);
    }
  });

  it('已交付 + 未交付 = 全部入口（不留没标记的模块）', () => {
    expect([...DELIVERED_NAV, ...PLANNED_NAV]).toHaveLength(SIDEBAR_NAV.length);
    expect(DELIVERED_NAV.some((item) => item.status !== 'delivered')).toBe(false);
    expect(PLANNED_NAV.some((item) => item.status !== 'planned')).toBe(false);
  });

  it('四个已交付模块就是本次交付范围（资讯 / 影神图 / 攻略 / 我的）', () => {
    expect(DELIVERED_NAV.map((item) => item.to)).toEqual([
      '/',
      '/news',
      '/wiki',
      '/guide',
      '/user',
    ]);
  });

  it('导航指向的每个路由都真实存在（占位页也算可达）', () => {
    for (const item of SIDEBAR_NAV) {
      const normalized = item.to === '/' ? '/' : item.to.replace(/^\//, '');
      expect(routePaths, `${item.to} 不在路由表里`).toContain(normalized);
    }
  });

  it('顶部导航只含已交付模块（未交付模块不该出现在「现在可用」的位置）', () => {
    expect(TOP_NAV.length).toBeGreaterThan(2);

    for (const item of TOP_NAV) {
      expect(item.status, `${item.to} 未交付却在顶部导航里`).toBe('delivered');
    }
  });

  it('isDeliveredRoute 判定与清单一致（含未交付与未知路径）', () => {
    for (const item of DELIVERED_NAV) {
      expect(isDeliveredRoute(item.to)).toBe(true);
    }
    for (const item of PLANNED_NAV) {
      expect(isDeliveredRoute(item.to)).toBe(false);
    }
    expect(isDeliveredRoute('/not-a-page')).toBe(false);
  });
});
