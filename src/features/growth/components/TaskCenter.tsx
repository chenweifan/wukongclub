import { useEffect, useState } from 'react';

import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { StateBoundary } from '@/components/ui/StateBoundary';
import { TASK_KINDS, groupTasksByKind } from '@/data/contracts/growth';
import type { TaskKind } from '@/data/contracts/growth';
import { useTasksQuery } from '@/entities/growth/queries';
import { TaskRow } from '@/features/growth/components/TaskRow';
import { useClaimTaskMutation } from '@/features/growth/mutations';
import { COPY } from '@/utils/copy';

const KIND_OPTIONS = TASK_KINDS.map((kind) => ({
  value: kind,
  label: COPY.growth.tasks[kind],
}));

/**
 * 任务中心：每日 / 周常 / 隐藏成就。
 *
 * 「可领取」的数量会同步到标签上（例如「每日 · 1」），
 * 这样不展开也知道有没有东西可拿 —— 这是任务中心最常见的诉求。
 */
export function TaskCenter() {
  const [kind, setKind] = useState<TaskKind>('daily');
  const query = useTasksQuery();
  const claimMutation = useClaimTaskMutation();
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    if (!claimMutation.isPending) {
      setClaimingId(null);
    }
  }, [claimMutation.isPending]);

  return (
    <section aria-labelledby="growth-tasks" className="panel-scroll p-6">
      <h2 id="growth-tasks" className="text-lg">
        {COPY.growth.tasks.title}
      </h2>

      <div className="mt-4">
        <StateBoundary query={query} label={COPY.growth.tasks.title}>
          {(tasks) => {
            const grouped = groupTasksByKind(tasks);
            const visible = grouped[kind];

            return (
              <div className="space-y-4">
                <SegmentedControl
                  label={COPY.growth.tasks.title}
                  value={kind}
                  options={KIND_OPTIONS.map((option) => {
                    const claimable = grouped[option.value].filter(
                      (task) => task.status === 'claimable',
                    ).length;
                    return {
                      ...option,
                      label: claimable === 0 ? option.label : `${option.label} · ${claimable}`,
                    };
                  })}
                  onChange={setKind}
                />

                {kind === 'hidden' ? (
                  <p className="text-[11px] text-content-muted">{COPY.growth.tasks.hiddenHint}</p>
                ) : null}

                {visible.length === 0 ? (
                  <p className="border-token border-line rounded-scroll border p-4 text-center text-xs text-content-muted">
                    {COPY.growth.tasks.empty}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {visible.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        isClaiming={claimingId === task.id && claimMutation.isPending}
                        onClaim={(taskId) => {
                          setClaimingId(taskId);
                          claimMutation.mutate(taskId);
                        }}
                      />
                    ))}
                  </ul>
                )}
              </div>
            );
          }}
        </StateBoundary>
      </div>
    </section>
  );
}
