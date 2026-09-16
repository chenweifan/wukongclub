import { useEffect, useRef } from 'react';

import type { Config, DriveStep, Driver } from 'driver.js';
import { useNavigate } from 'react-router-dom';

import { useDemoStore } from '@/demo/demoStore';
import { TOUR_COPY } from '@/demo/fixtures/tourCopy';
import { findDemoTour } from '@/demo/tours';
import type { DemoTour } from '@/demo/tours/types';
import { waitForElement } from '@/demo/tours/waitForElement';
import { pushToast } from '@/stores/toastStore';
import { COPY } from '@/utils/copy';

/**
 * driver.js 只在真正启动引导时才动态加载（含它的样式），
 * 这样控制台常驻也不会给首屏增加依赖体积。
 * 上面的 Config / DriveStep / Driver 都是 `import type`，编译后完全擦除，不产生运行时引用。
 */
type DriverFactory = (config?: Config) => Driver;

interface TourDeps {
  navigate: (to: string) => void;
  finish: () => void;
}

/**
 * URL 驱动的引导运行器（协议 1.6）。
 *
 * 为什么以「URL 上的 tour 参数」为唯一入口，而不是暴露一个 start() 函数：
 * 这样 `?demo=1&tour=first-visit` 既是分享链接也是启动指令，
 * 场景系统只要把 tour 写进状态即可，无需关心引导组件挂在哪。
 * 结束/退出时把 tour 置回 null，链接也就自动「用完即弃」，刷新不会反复弹。
 *
 * 键盘 ← / → / Esc 由 driver.js 的 allowKeyboardControl 提供；
 * 跨页跳转则在 onHighlightStarted 里拦截（键盘与按钮都会经过它，两条路径行为一致）。
 */
export function useTourRunner(): void {
  const tourId = useDemoStore((state) => state.tour);
  const navigate = useNavigate();
  const driverRef = useRef<Driver | null>(null);
  const startedRef = useRef<string | null>(null);

  useEffect(() => {
    if (tourId === null) {
      driverRef.current?.destroy();
      driverRef.current = null;
      startedRef.current = null;
      return;
    }

    if (startedRef.current === tourId) {
      return;
    }

    const tour = findDemoTour(tourId);
    if (tour === undefined) {
      pushToast(COPY.demo.tour.unknown, 'danger');
      useDemoStore.getState().setTour(null);
      return;
    }

    startedRef.current = tourId;
    let cancelled = false;

    if (tour.opensConsole === true) {
      useDemoStore.getState().setConsoleOpen(true);
    }

    const finish = () => {
      startedRef.current = null;
      driverRef.current = null;
      if (useDemoStore.getState().tour !== null) {
        useDemoStore.getState().setTour(null);
      }
    };

    void (async () => {
      if (window.location.pathname !== tour.startRoute) {
        navigate(tour.startRoute);
        await waitForElement(tour.steps[0]?.selector ?? 'body');
      }

      if (cancelled) {
        return;
      }

      const [driverModule] = await Promise.all([
        import('driver.js'),
        import('driver.js/dist/driver.css'),
      ]);

      if (cancelled) {
        return;
      }

      const instance = createTourDriver(driverModule.driver, tour, { navigate, finish });
      driverRef.current = instance;
      instance.drive();
    })();

    return () => {
      cancelled = true;
    };
  }, [tourId, navigate]);
}

function createTourDriver(driver: DriverFactory, tour: DemoTour, deps: TourDeps): Driver {
  const steps: DriveStep[] = tour.steps.map((step) => {
    const copy = TOUR_COPY[step.id];

    return {
      element: step.selector,
      popover: {
        title: copy?.title ?? '',
        description: copy?.description ?? '',
        side: step.side ?? 'bottom',
      },
    };
  });

  /** 已经为某一步做过跨页跳转：避免 moveTo 触发的二次回调里重复导航。 */
  const navigatedSteps = new Set<number>();
  let instance: Driver | null = null;

  const config: Config = {
    showProgress: true,
    progressText: COPY.demo.tour.progress,
    nextBtnText: COPY.demo.tour.next,
    prevBtnText: COPY.demo.tour.previous,
    doneBtnText: COPY.demo.tour.done,
    showButtons: ['next', 'previous', 'close'],
    allowClose: true,
    allowKeyboardControl: true,
    overlayColor: 'var(--hmw-overlay)',
    popoverClass: 'hmw-tour-popover',
    steps,
    onHighlightStarted: (_element, _step, options) => {
      const index = options.state.activeIndex;

      if (typeof index !== 'number') {
        return;
      }

      const tourStep = tour.steps[index];

      if (tourStep === undefined || instance === null) {
        return;
      }

      if (tourStep.route === window.location.pathname) {
        navigatedSteps.delete(index);
        return;
      }

      if (navigatedSteps.has(index)) {
        return;
      }

      navigatedSteps.add(index);
      deps.navigate(tourStep.route);

      void waitForElement(tourStep.selector).then((element) => {
        if (element === null) {
          pushToast(COPY.demo.tour.missingElement, 'danger');
        }
        // 路由已切换、元素已就绪：重新高亮同一步，这次能正确挖出目标
        instance?.moveTo(index);
      });
    },
    onCloseClick: () => {
      instance?.destroy();
    },
    onDestroyed: () => {
      deps.finish();
    },
  };

  instance = driver(config);
  return instance;
}
