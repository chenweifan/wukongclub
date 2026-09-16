import { AnimatePresence, motion } from 'framer-motion';

import { useCopyDemoLink } from '@/demo/console/useCopyDemoLink';
import { GourdButton } from '@/demo/console/GourdButton';
import { DataSection } from '@/demo/console/sections/DataSection';
import { ScenarioSection, TourSection } from '@/demo/console/sections/GuideSection';
import {
  IdentitySection,
  SpoilerSection,
  ThemeSection,
  UiStateSection,
} from '@/demo/console/sections/StateSections';
import { ToolsSection } from '@/demo/console/sections/ToolsSection';
import { useDemoStore } from '@/demo/demoStore';
import { COPY } from '@/utils/copy';

/**
 * 演示控制台（协议 1.4）：右下角葫芦 → 悬浮面板。
 *
 * 渲染规则：
 * - clean=true：控制台与提示条都不渲染（截图用）；
 * - enabled=false：仅在 DEV 下保留一个「进入演示模式」的葫芦，
 *   让评审不必记 URL 参数；生产构建里只有带 demo=1 的链接才会出现控制台。
 */
export function DemoConsole() {
  const enabled = useDemoStore((state) => state.enabled);
  const clean = useDemoStore((state) => state.clean);
  const consoleOpen = useDemoStore((state) => state.consoleOpen);
  const setConsoleOpen = useDemoStore((state) => state.setConsoleOpen);
  const patch = useDemoStore((state) => state.patch);
  const theme = useDemoStore((state) => state.theme);
  const copyLink = useCopyDemoLink();

  if (clean) {
    return null;
  }

  if (!enabled) {
    if (!import.meta.env.DEV) {
      return null;
    }

    return (
      <GourdButton
        label={COPY.demo.enterDemo}
        hint={COPY.demo.enterDemo}
        onClick={() => {
          patch({ enabled: true });
          setConsoleOpen(true);
        }}
      />
    );
  }

  return (
    <>
      <GourdButton
        label={consoleOpen ? COPY.demo.closeConsole : COPY.demo.openConsole}
        expanded={consoleOpen}
        onClick={() => {
          setConsoleOpen(!consoleOpen);
        }}
      />

      <AnimatePresence>
        {consoleOpen ? (
          <motion.aside
            key="demo-console"
            aria-label={COPY.demo.consoleTitle}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="border-token border-line bg-surface shadow-panel fixed bottom-20 right-5 z-[var(--hmw-z-console)] flex max-h-[70vh] w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-scroll border"
          >
            <header className="border-token border-line flex items-center gap-2 border-b px-3 py-2">
              <span className="font-display text-sm">{COPY.demo.consoleTitle}</span>
              <span className="stamp ml-auto">{COPY.theme[theme]}</span>
              <button
                type="button"
                aria-label={COPY.demo.closeConsole}
                onClick={() => {
                  setConsoleOpen(false);
                }}
                className="text-content-muted hover:text-content text-xs"
              >
                ✕
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-3 py-1">
              <IdentitySection />
              <UiStateSection />
              <ThemeSection />
              <SpoilerSection />
              <DataSection />
              <TourSection />
              <ScenarioSection />
              <ToolsSection />
            </div>

            <footer className="border-token border-line flex items-center gap-2 border-t px-3 py-2 text-[11px] text-content-muted">
              <span className="min-w-0 flex-1 leading-relaxed">{COPY.disclaimer.mockData}</span>
              <button
                type="button"
                onClick={copyLink}
                className="border-token border-line hover:text-accent shrink-0 rounded-scroll border px-2 py-0.5"
              >
                {COPY.demo.tools.copyLink}
              </button>
            </footer>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}
