import { useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { clearAllData, fillDemoData, resetDemoData } from '@/data/db/demoData';
import { ConsoleSection } from '@/demo/console/ConsoleSection';
import { useDemoStore } from '@/demo/demoStore';
import { recordEvent } from '@/demo/recorder';
import { downloadSnapshot, exportSnapshot, importSnapshotFile } from '@/demo/snapshot';
import { requestConfirm } from '@/stores/confirmStore';
import { pushToast } from '@/stores/toastStore';
import { cn } from '@/utils/cn';
import { describeUnknownError } from '@/utils/errorMessage';
import { COPY } from '@/utils/copy';

/**
 * 数据分区（协议 1.4）：重置 / 填满 / 清空 / 导出快照 / 导入快照。
 * 三个破坏性操作都走统一二次确认；导入同时覆盖本地库、localStorage 与 DemoState。
 */
export function DataSection() {
  const seed = useDemoStore((state) => state.seed);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const invalidate = () => {
    void queryClient.invalidateQueries();
  };

  const run = async (task: () => Promise<string>, consoleLabel: string) => {
    if (busy) {
      return;
    }

    setBusy(true);
    try {
      const message = await task();
      pushToast(message, 'success');
      recordEvent('console', consoleLabel);
    } catch (error) {
      pushToast(describeUnknownError(error), 'danger');
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    const confirmed = await requestConfirm({
      title: COPY.demo.data.resetConfirmTitle,
      description: COPY.demo.data.resetConfirmDescription,
      tone: 'danger',
    });
    if (!confirmed) {
      return;
    }

    await run(async () => {
      const count = await resetDemoData(seed);
      invalidate();
      return COPY.demo.data.seeded(count);
    }, '数据 → 重置');
  };

  const handleFill = async () => {
    const confirmed = await requestConfirm({
      title: COPY.demo.data.fillConfirmTitle,
      description: COPY.demo.data.fillConfirmDescription,
      tone: 'danger',
    });
    if (!confirmed) {
      return;
    }

    await run(async () => {
      const count = await fillDemoData(seed);
      invalidate();
      return COPY.demo.data.seeded(count);
    }, '数据 → 填满');
  };

  const handleClear = async () => {
    const confirmed = await requestConfirm({
      title: COPY.demo.data.clearConfirmTitle,
      description: COPY.demo.data.clearConfirmDescription,
      tone: 'danger',
    });
    if (!confirmed) {
      return;
    }

    await run(async () => {
      await clearAllData();
      invalidate();
      return COPY.demo.data.cleared;
    }, '数据 → 清空');
  };

  const handleExport = async () => {
    await run(async () => {
      downloadSnapshot(await exportSnapshot());
      return COPY.demo.data.exported;
    }, '数据 → 导出快照');
  };

  const handleImportFile = async (file: File | undefined) => {
    if (file === undefined) {
      pushToast(COPY.demo.data.importEmpty, 'danger');
      return;
    }

    await run(async () => {
      const result = await importSnapshotFile(file);
      invalidate();
      return COPY.demo.data.imported(result.rows, result.keys);
    }, '数据 → 导入快照');
  };

  return (
    <ConsoleSection
      title={COPY.demo.section.data}
      hint={COPY.demo.sectionHint.data}
      tourId="console-data"
    >
      <div className="grid grid-cols-3 gap-1.5">
        <ConsoleButton label={COPY.demo.data.reset} onClick={handleReset} disabled={busy} danger />
        <ConsoleButton label={COPY.demo.data.fill} onClick={handleFill} disabled={busy} />
        <ConsoleButton label={COPY.demo.data.clear} onClick={handleClear} disabled={busy} danger />
        <ConsoleButton
          label={COPY.demo.data.export}
          onClick={handleExport}
          disabled={busy}
          className="col-span-3"
        />
      </div>

      <ConsoleButton
        label={COPY.demo.data.import}
        disabled={busy}
        onClick={() => {
          fileInputRef.current?.click();
        }}
        className="w-full"
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          void handleImportFile(file);
          // 允许连续导入同一个文件
          event.target.value = '';
        }}
      />

      <p className="text-[11px] leading-relaxed text-content-muted">
        {COPY.demo.data.baselineHint}
      </p>
    </ConsoleSection>
  );
}

interface ConsoleButtonProps {
  label: string;
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  danger?: boolean;
  className?: string;
}

function ConsoleButton({
  label,
  onClick,
  disabled = false,
  danger = false,
  className,
}: ConsoleButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        void onClick();
      }}
      className={cn(
        'border-token rounded-scroll border px-2 py-1.5 text-xs transition-colors duration-fast',
        'disabled:cursor-not-allowed disabled:opacity-50',
        danger ? 'border-danger text-danger' : 'border-line text-content-muted hover:text-accent',
        className,
      )}
    >
      {label}
    </button>
  );
}
