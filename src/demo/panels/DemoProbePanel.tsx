import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { StateBoundary } from '@/components/ui/StateBoundary';
import { fillDemoData } from '@/data/db/demoData';
import { demoProbeRepo } from '@/data/repositories';
import { useDemoStore } from '@/demo/demoStore';
import { pushToast } from '@/stores/toastStore';
import { cn } from '@/utils/cn';
import { describeUnknownError } from '@/utils/errorMessage';
import { COPY } from '@/utils/copy';

export const DEMO_PROBES_QUERY_KEY = ['demo', 'probes'] as const;

/**
 * 演示探针自检面板（阶段 1 专用，阶段 2 起被真实业务列表取代）。
 *
 * 它是协议 1.3 验收标准的「实物证据」：
 * - 走 Repository → MSW → IndexedDB 全链路，不 mock 掉任何一层；
 * - 被 <StateBoundary> 包裹，因此控制台切到 空/加载/错误/断网/慢速 时这里都会跟着变；
 * - 勾选是写操作，会持久化到 IndexedDB，快照导出/导入能把它一起还原。
 */
export function DemoProbePanel() {
  const seed = useDemoStore((state) => state.seed);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: DEMO_PROBES_QUERY_KEY,
    queryFn: () => demoProbeRepo.list(),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => demoProbeRepo.toggleCollected(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DEMO_PROBES_QUERY_KEY });
    },
    onError: (error) => {
      pushToast(`${COPY.probe.updateFailed}：${describeUnknownError(error)}`, 'danger');
    },
  });

  const handleFill = async () => {
    try {
      const count = await fillDemoData(seed);
      pushToast(COPY.demo.data.seeded(count), 'success');
      void queryClient.invalidateQueries({ queryKey: DEMO_PROBES_QUERY_KEY });
    } catch (error) {
      pushToast(describeUnknownError(error), 'danger');
    }
  };

  return (
    <section data-tour="probe-panel" className="panel-scroll p-6">
      <h2 className="text-lg">{COPY.probe.title}</h2>
      <p className="mt-2 max-w-3xl text-xs leading-relaxed text-content-muted">
        {COPY.probe.description}
      </p>

      <div className="mt-4">
        <StateBoundary
          query={query}
          label={COPY.probe.title}
          isEmpty={(data) => data.items.length === 0}
          emptyAction={
            <button
              type="button"
              onClick={() => {
                void handleFill();
              }}
              className="border-token border-line hover:text-accent mt-4 rounded-scroll border px-3 py-1.5 text-xs"
            >
              {COPY.demo.data.fill}
            </button>
          }
        >
          {(data) => (
            <div>
              <p className="text-xs text-content-muted">{COPY.probe.countLabel(data.total)}</p>

              <ul className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {data.items.map((probe) => (
                  <li key={probe.id}>
                    <button
                      type="button"
                      aria-pressed={probe.collected}
                      aria-label={COPY.probe.toggle(probe.label, probe.collected)}
                      disabled={toggleMutation.isPending}
                      onClick={() => {
                        toggleMutation.mutate(probe.id);
                      }}
                      className={cn(
                        'border-token flex w-full items-center gap-2 rounded-scroll border px-3 py-2 text-left text-xs transition-colors duration-fast disabled:opacity-60',
                        probe.collected
                          ? 'border-accent bg-surface-2 text-content'
                          : 'border-line text-content-muted hover:text-content',
                      )}
                    >
                      <span aria-hidden="true">{probe.collected ? '◆' : '◇'}</span>
                      <span className="min-w-0 flex-1 truncate">{probe.label}</span>
                      <span className="stamp shrink-0">{probe.category}</span>
                      <span className="shrink-0 text-content-muted">{probe.score}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </StateBoundary>
      </div>
    </section>
  );
}
