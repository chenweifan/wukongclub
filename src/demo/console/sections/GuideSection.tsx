import { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { ConsoleSection } from '@/demo/console/ConsoleSection';
import { useDemoStore } from '@/demo/demoStore';
import { recordEvent } from '@/demo/recorder';
import { applyDemoScenario } from '@/demo/scenarios/applyScenario';
import { DEMO_SCENARIOS } from '@/demo/scenarios/index';
import { DEMO_TOURS } from '@/demo/tours';
import { pushToast } from '@/stores/toastStore';
import { COPY } from '@/utils/copy';

/** 场景分区：一键切到典型演示现场（状态 + 数据 + 路由 + 引导）。 */
export function ScenarioSection() {
  const [selectedId, setSelectedId] = useState<string>(DEMO_SCENARIOS[0]?.id ?? '');
  const [busy, setBusy] = useState(false);
  const patch = useDemoStore((state) => state.patch);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const selected = DEMO_SCENARIOS.find((scenario) => scenario.id === selectedId);

  const handleApply = async () => {
    if (busy) {
      return;
    }

    setBusy(true);
    try {
      await applyDemoScenario(selectedId, {
        patch,
        navigate,
        notify: (message) => {
          pushToast(message);
        },
        invalidate: () => {
          void queryClient.invalidateQueries();
        },
        unknownMessage: COPY.demo.scenario.unknown,
        appliedMessage: (scenario) => COPY.demo.scenario.applied(scenario.name),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <ConsoleSection
      title={COPY.demo.section.scenario}
      hint={COPY.demo.sectionHint.scenario}
      tourId="console-scenario"
    >
      <select
        aria-label={COPY.demo.scenario.label}
        value={selectedId}
        onChange={(event) => {
          setSelectedId(event.target.value);
        }}
        className="border-token border-line bg-surface-2 w-full rounded-scroll border px-2 py-1.5 text-xs text-content"
      >
        {DEMO_SCENARIOS.map((scenario) => (
          <option key={scenario.id} value={scenario.id}>
            {scenario.name}
          </option>
        ))}
      </select>

      {selected === undefined ? null : (
        <p className="text-[11px] leading-relaxed text-content-muted">{selected.description}</p>
      )}

      <button
        type="button"
        disabled={busy}
        onClick={() => {
          void handleApply();
        }}
        className="bg-accent text-accent-ink w-full rounded-scroll px-2 py-1.5 text-xs font-medium disabled:opacity-50"
      >
        {COPY.demo.scenario.apply}
      </button>
    </ConsoleSection>
  );
}

/**
 * 引导分区：选择剧本并启动。
 * 启动方式是把 tour id 写进 DemoState —— 于是它同时进入 URL，
 * 「启动引导」与「分享一条带引导的链接」变成同一件事。
 */
export function TourSection() {
  const [selectedId, setSelectedId] = useState<string>(DEMO_TOURS[0]?.id ?? '');
  const setTour = useDemoStore((state) => state.setTour);

  const selected = DEMO_TOURS.find((tour) => tour.id === selectedId);

  return (
    <ConsoleSection title={COPY.demo.section.guide} hint={COPY.demo.sectionHint.guide}>
      <select
        aria-label={COPY.demo.tour.label}
        value={selectedId}
        onChange={(event) => {
          setSelectedId(event.target.value);
        }}
        className="border-token border-line bg-surface-2 w-full rounded-scroll border px-2 py-1.5 text-xs text-content"
      >
        {DEMO_TOURS.map((tour) => (
          <option key={tour.id} value={tour.id}>
            {tour.name}
          </option>
        ))}
      </select>

      {selected === undefined ? null : (
        <p className="text-[11px] leading-relaxed text-content-muted">{selected.description}</p>
      )}

      <button
        type="button"
        onClick={() => {
          setTour(selectedId);
          recordEvent('console', `引导 → ${selected?.name ?? selectedId}`);
        }}
        className="border-token border-line hover:text-accent w-full rounded-scroll border px-2 py-1.5 text-xs"
      >
        {COPY.demo.tour.start}
      </button>
    </ConsoleSection>
  );
}
