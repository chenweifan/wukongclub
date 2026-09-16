import { useEffect } from 'react';

import { useLocation } from 'react-router-dom';

import { useDemoStore } from '@/demo/demoStore';
import { DemoBanner } from '@/demo/console/DemoBanner';
import { DemoConsole } from '@/demo/console/DemoConsole';
import { GridOverlay } from '@/demo/panels/GridOverlay';
import { PerfPanel } from '@/demo/panels/PerfPanel';
import { recordEvent } from '@/demo/recorder';
import { useTourRunner } from '@/demo/tours/tourRunner';

/**
 * 演示浮层集合：提示条 + 控制台 + 栅格 + 性能面板 + 引导运行器。
 *
 * 它必须渲染在 Router 内部（引导要跨页跳转，需要 useNavigate），
 * 因此挂在 RootShell 上，而不是 AppProviders 里 —— 见 src/app/RootShell.tsx。
 */
export function DemoOverlay() {
  const enabled = useDemoStore((state) => state.enabled);
  const clean = useDemoStore((state) => state.clean);
  const grid = useDemoStore((state) => state.grid);
  const outline = useDemoStore((state) => state.outline);
  const perfPanel = useDemoStore((state) => state.perfPanel);
  const pathname = useLocation().pathname;

  useTourRunner();

  // 提示条会占据顶部空间：用令牌告诉布局让位（body padding-top + sticky 头部偏移）
  useEffect(() => {
    const bannerHeight = enabled && !clean ? '2.25rem' : '0px';
    document.documentElement.style.setProperty('--hmw-banner-h', bannerHeight);

    return () => {
      document.documentElement.style.setProperty('--hmw-banner-h', '0px');
    };
  }, [enabled, clean]);

  // 组件边界：一条属性 + globals.css 里的规则，比给每个组件加 class 更省事
  useEffect(() => {
    document.documentElement.dataset.demoOutline = outline ? '1' : '0';

    return () => {
      delete document.documentElement.dataset.demoOutline;
    };
  }, [outline]);

  // 录制路由跳转（点击录制在 DemoProvider，那里离 DOM 更近）
  useEffect(() => {
    recordEvent('navigate', pathname);
  }, [pathname]);

  return (
    <>
      <DemoBanner />
      {grid ? <GridOverlay /> : null}
      {perfPanel ? <PerfPanel /> : null}
      <DemoConsole />
    </>
  );
}
