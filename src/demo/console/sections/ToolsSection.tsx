import { useEffect, useState } from 'react';

import { SwitchField } from '@/components/ui/Switch';
import { ConsoleSection } from '@/demo/console/ConsoleSection';
import { useCopyDemoLink } from '@/demo/console/useCopyDemoLink';
import { useDemoStore } from '@/demo/demoStore';
import {
  buildRecordingFile,
  clearRecordedEvents,
  countRecordedEvents,
  isRecordingActive,
  listRecordedEvents,
  RECORDING_FILE_NAME,
} from '@/demo/recorder';
import { pushToast } from '@/stores/toastStore';
import { downloadJson } from '@/utils/download';
import { COPY } from '@/utils/copy';

/** 工具分区：栅格 / 组件边界 / 性能面板 / 复制演示链接 / 操作记录。 */
export function ToolsSection() {
  const grid = useDemoStore((state) => state.grid);
  const outline = useDemoStore((state) => state.outline);
  const perfPanel = useDemoStore((state) => state.perfPanel);
  const patch = useDemoStore((state) => state.patch);
  const setOutline = useDemoStore((state) => state.setOutline);
  const setPerfPanel = useDemoStore((state) => state.setPerfPanel);
  const copyLink = useCopyDemoLink();

  return (
    <ConsoleSection
      title={COPY.demo.section.tools}
      hint={COPY.demo.sectionHint.tools}
      tourId="console-tools"
    >
      <SwitchField
        label={COPY.demo.tools.grid}
        checked={grid}
        onCheckedChange={(next) => {
          patch({ grid: next });
        }}
      />
      <SwitchField label={COPY.demo.tools.outline} checked={outline} onCheckedChange={setOutline} />
      <SwitchField
        label={COPY.demo.tools.perf}
        checked={perfPanel}
        onCheckedChange={setPerfPanel}
      />

      <button
        type="button"
        onClick={copyLink}
        className="border-token border-line hover:text-accent w-full rounded-scroll border px-2 py-1.5 text-xs"
      >
        {COPY.demo.tools.copyLink}
      </button>

      <RecordPanel />
    </ConsoleSection>
  );
}

/**
 * 操作记录面板：只在 ?record=1 时出现。
 * 计数用 1s 轮询刷新 —— 录制是内存缓冲，没有订阅机制，
 * 而每秒一次 setState 的成本远低于为它引入一套事件总线。
 */
function RecordPanel() {
  const recording = isRecordingActive();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!recording) {
      return;
    }

    setCount(countRecordedEvents());
    const timer = window.setInterval(() => {
      setCount(countRecordedEvents());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [recording]);

  if (!recording) {
    return null;
  }

  return (
    <div className="border-token border-line mt-1 space-y-1.5 rounded-scroll border border-dashed p-2">
      <p className="text-[11px] text-accent">{COPY.demo.record.enabled}</p>
      <p className="text-[11px] text-content-muted">{COPY.demo.record.count(count)}</p>

      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => {
            downloadJson(
              RECORDING_FILE_NAME,
              buildRecordingFile(listRecordedEvents(), new Date().toISOString()),
            );
            pushToast(COPY.demo.record.exported, 'success');
          }}
          className="border-token border-line hover:text-accent flex-1 rounded-scroll border px-2 py-1 text-xs"
        >
          {COPY.demo.record.export}
        </button>
        <button
          type="button"
          onClick={() => {
            clearRecordedEvents();
            setCount(0);
            pushToast(COPY.demo.record.cleared);
          }}
          className="border-token border-line text-content-muted hover:text-content flex-1 rounded-scroll border px-2 py-1 text-xs"
        >
          {COPY.demo.record.clear}
        </button>
      </div>
    </div>
  );
}
