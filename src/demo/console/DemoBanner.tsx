import { useDemoStore } from '@/demo/demoStore';
import { useCopyDemoLink } from '@/demo/console/useCopyDemoLink';
import { COPY } from '@/utils/copy';

/**
 * 顶部演示提示条（协议 1.4：clean=true 时不渲染）。
 * 它同时充当「当前状态摘要」：身份 / 界面状态一眼可见，评审不必展开控制台。
 * 高度由 --hmw-banner-h 统一控制（tokens.css），布局侧据此让出顶部空间。
 */
export function DemoBanner() {
  const enabled = useDemoStore((state) => state.enabled);
  const clean = useDemoStore((state) => state.clean);
  const role = useDemoStore((state) => state.role);
  const uiState = useDemoStore((state) => state.uiState);
  const patch = useDemoStore((state) => state.patch);
  const copyLink = useCopyDemoLink();

  if (!enabled || clean) {
    return null;
  }

  return (
    <div
      role="status"
      className="border-token border-line bg-surface fixed inset-x-0 top-0 z-[var(--hmw-z-banner)] h-9 border-b"
    >
      <div className="mx-auto flex h-full max-w-page items-center gap-3 px-4 text-xs">
        <span className="text-accent whitespace-nowrap">● {COPY.demo.banner}</span>
        <span className="text-content-muted hidden truncate sm:inline">{COPY.demo.bannerHint}</span>

        <span className="ml-auto flex items-center gap-2">
          <span className="stamp hidden md:inline">{COPY.demo.role[role]}</span>
          <span className="stamp hidden md:inline">{COPY.demo.uiState[uiState]}</span>

          <button
            type="button"
            onClick={copyLink}
            className="border-token border-line hover:text-accent rounded-scroll border px-2 py-0.5"
          >
            {COPY.demo.tools.copyLink}
          </button>

          <button
            type="button"
            onClick={() => {
              patch({ clean: true });
            }}
            title={COPY.demo.cleanHint}
            className="border-token border-line hover:text-accent rounded-scroll border px-2 py-0.5"
          >
            {COPY.demo.cleanMode}
          </button>

          <button
            type="button"
            onClick={() => {
              patch({ enabled: false, clean: false, grid: false, tour: null });
            }}
            className="border-token border-line hover:text-accent rounded-scroll border px-2 py-0.5"
          >
            {COPY.demo.exitDemo}
          </button>
        </span>
      </div>
    </div>
  );
}
