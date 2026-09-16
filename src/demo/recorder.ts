/**
 * 操作路径录制（协议 1.8）：`?demo=1&clean=1&record=1` 时把用户操作记到**内存**，
 * 结束后可导出 JSON 做可用性分析。
 */

export type RecordedEventKind = 'click' | 'navigate' | 'console';

export interface RecordedEvent {
  at: string;
  kind: RecordedEventKind;
  /** 人类可读的操作目标：优先 aria-label，其次可见文本。 */
  target: string;
}

export interface RecordingFile {
  version: number;
  exportedAt: string;
  events: readonly RecordedEvent[];
}

export const RECORDING_QUERY_PARAM = 'record';
export const RECORDING_VERSION = 1;
export const RECORDING_FILE_NAME = 'hmw-demo-recording.json';

/** 上限：录制是内存缓冲，不能无限增长（超限丢最旧的记录）。 */
export const MAX_RECORDED_EVENTS = 500;

export const RECORDABLE_SELECTOR = 'button, a, [role="button"], summary, input, select';

let buffer: RecordedEvent[] = [];
let recordingEnabled = false;

/** URL 上是否开启了录制。 */
export function isRecordingEnabled(search: string): boolean {
  const params = new URLSearchParams(search);
  const value = params.get(RECORDING_QUERY_PARAM);
  if (value === null) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'on';
}

/**
 * 由 DemoProvider 在启动时置位；未开启录制时 recordEvent 直接变成空操作，
 * 于是控制台里各处调用点不必各自判断开关。
 */
export function setRecordingEnabled(enabled: boolean): void {
  recordingEnabled = enabled;
}

export function isRecordingActive(): boolean {
  return recordingEnabled;
}

/**
 * 把 DOM 元素描述成一行可读文本。
 * 优先 aria-label（无障碍名称通常最准确），其次可见文本，最后退化成标签名 ——
 * 这样导出的录制文件即使不看截图也能读懂。
 */
export function describeClickTarget(element: Element | null): string {
  if (element === null) {
    return 'unknown';
  }

  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel !== null && ariaLabel.trim() !== '') {
    return ariaLabel.trim();
  }

  const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim();
  if (text !== '') {
    return text.slice(0, 48);
  }

  const title = element.getAttribute('title');
  if (title !== null && title.trim() !== '') {
    return title.trim();
  }

  return `<${element.tagName.toLowerCase()}>`;
}

export function recordEvent(kind: RecordedEventKind, target: string, at?: string): void {
  if (!recordingEnabled) {
    return;
  }

  buffer = [...buffer, { at: at ?? new Date().toISOString(), kind, target }].slice(
    -MAX_RECORDED_EVENTS,
  );
}

export function listRecordedEvents(): readonly RecordedEvent[] {
  return buffer;
}

export function clearRecordedEvents(): void {
  buffer = [];
}

/** 测试用：把开关与缓冲一起复位，避免用例之间互相污染。 */
export function resetRecorder(): void {
  buffer = [];
  recordingEnabled = false;
}

export function countRecordedEvents(): number {
  return buffer.length;
}

/** 纯函数：组装可下载的录制文件（时间注入，便于测试）。 */
export function buildRecordingFile(
  events: readonly RecordedEvent[],
  exportedAt: string,
): RecordingFile {
  return { version: RECORDING_VERSION, exportedAt, events };
}
