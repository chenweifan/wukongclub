import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { routes } from '@/app/router';
import { TOUR_COPY, TOUR_SUMMARY } from '@/demo/fixtures/tourCopy';
import { DEMO_TOURS, findDemoTour } from '@/demo/tours';
import { DEMO_TOUR_IDS, tourSelector } from '@/demo/tours/types';
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

/** 把 src 下所有 tsx 源码拼起来：用于核对 data-tour 锚点是否真的存在。 */
function readSourceBundle(): string {
  const root = resolve(process.cwd(), 'src');

  function walk(directory: string): string[] {
    const entries = readdirSync(directory, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      const full = join(directory, entry.name);
      if (entry.isDirectory()) {
        files.push(...walk(full));
      } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
        files.push(readFileSync(full, 'utf8'));
      }
    }

    return files;
  }

  return walk(root).join('\n');
}

const sourceBundle = readSourceBundle();

describe('引导剧本', () => {
  it('注册表与类型契约一致', () => {
    expect(DEMO_TOURS.map((tour) => tour.id)).toEqual([...DEMO_TOUR_IDS]);
  });

  it('每个剧本都有摘要文案（下拉里要显示）', () => {
    for (const tour of DEMO_TOURS) {
      const summary = TOUR_SUMMARY[tour.id];
      expect(summary.name.length).toBeGreaterThan(0);
      expect(summary.description.length).toBeGreaterThan(5);
      expect(tour.name).toBe(summary.name);
    }
  });

  it('每个步骤都有对应文案：文案与步骤分离，但不允许漏', () => {
    for (const tour of DEMO_TOURS) {
      for (const step of tour.steps) {
        const copy = TOUR_COPY[step.id];
        expect(copy, `步骤 ${step.id} 缺少文案`).toBeDefined();
        expect(copy?.title.length ?? 0).toBeGreaterThan(0);
        expect(copy?.description.length ?? 0).toBeGreaterThan(5);
      }
    }
  });

  it('TOUR_COPY 里没有孤儿文案（删步骤时记得删文案）', () => {
    const usedIds = new Set(DEMO_TOURS.flatMap((tour) => tour.steps.map((step) => step.id)));

    for (const key of Object.keys(TOUR_COPY)) {
      expect(usedIds, `文案 ${key} 没有被任何步骤使用`).toContain(key);
    }
  });

  it('步骤 id 全局唯一（否则文案会互相覆盖）', () => {
    const ids = DEMO_TOURS.flatMap((tour) => tour.steps.map((step) => step.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('选择器统一使用 data-tour 约定，不依赖易变的类名', () => {
    for (const tour of DEMO_TOURS) {
      for (const step of tour.steps) {
        expect(step.selector).toMatch(/^\[data-tour="[a-z0-9-]+"\]$/);
      }
    }
  });

  it('每个 data-tour 锚点在源码里真实存在（防止改名后引导静默失效）', () => {
    for (const tour of DEMO_TOURS) {
      for (const step of tour.steps) {
        const anchorName = step.selector.replace(/^\[data-tour="|"\]$/g, '');
        // 锚点有两种写法：直接写在元素上（data-tour="x"），
        // 或由 ConsoleSection 这类壳组件转发（tourId="x" -> data-tour）。
        const declared =
          sourceBundle.includes(`data-tour="${anchorName}"`) ||
          sourceBundle.includes(`tourId="${anchorName}"`);

        expect(declared, `找不到锚点 ${anchorName}`).toBe(true);
      }
    }
  });

  it('步骤路由都真实存在', () => {
    for (const tour of DEMO_TOURS) {
      for (const step of tour.steps) {
        const normalized = step.route === '/' ? '/' : step.route.replace(/^\//, '');
        expect(routePaths, `步骤 ${step.id} 指向了不存在的路由 ${step.route}`).toContain(
          normalized,
        );
      }
    }
  });

  it('起始路由与首步路由一致（否则启动瞬间会先跳一次）', () => {
    for (const tour of DEMO_TOURS) {
      expect(tour.startRoute).toBe(tour.steps[0]?.route);
    }
  });

  it('首次到访包含跨页步骤（协议要求跨页自动跳转）', () => {
    const tour = findDemoTour('first-visit');
    const routesInTour = new Set(tour?.steps.map((step) => step.route));

    expect(routesInTour.size).toBeGreaterThan(1);
  });

  it('控制台导览声明需要先展开控制台', () => {
    expect(findDemoTour('console-guide')?.opensConsole).toBe(true);
  });

  it('未知剧本返回 undefined（由运行器提示并清空参数）', () => {
    expect(findDemoTour('nope')).toBeUndefined();
  });

  it('tourSelector 生成的选择器与步骤里写的一致', () => {
    expect(tourSelector('gourd')).toBe('[data-tour="gourd"]');
    expect(findDemoTour('first-visit')?.steps[0]?.selector).toBe(tourSelector('brand'));
  });
});
