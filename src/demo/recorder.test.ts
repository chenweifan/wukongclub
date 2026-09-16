import { beforeEach, describe, expect, it } from 'vitest';

import {
  MAX_RECORDED_EVENTS,
  buildRecordingFile,
  clearRecordedEvents,
  countRecordedEvents,
  describeClickTarget,
  isRecordingActive,
  isRecordingEnabled,
  listRecordedEvents,
  recordEvent,
  resetRecorder,
  setRecordingEnabled,
} from '@/demo/recorder';

describe('isRecordingEnabled', () => {
  it('识别 record=1 / true / on', () => {
    expect(isRecordingEnabled('?demo=1&record=1')).toBe(true);
    expect(isRecordingEnabled('?record=true')).toBe(true);
    expect(isRecordingEnabled('?record=ON')).toBe(true);
  });

  it('缺省或关闭时为 false', () => {
    expect(isRecordingEnabled('')).toBe(false);
    expect(isRecordingEnabled('?demo=1')).toBe(false);
    expect(isRecordingEnabled('?record=0')).toBe(false);
    expect(isRecordingEnabled('?record=maybe')).toBe(false);
  });
});

describe('describeClickTarget', () => {
  it('优先使用 aria-label（无障碍名称最准确）', () => {
    const button = document.createElement('button');
    button.setAttribute('aria-label', '打开演示控制台');
    button.textContent = '葫芦';

    expect(describeClickTarget(button)).toBe('打开演示控制台');
  });

  it('其次使用可见文本，并压缩空白', () => {
    const link = document.createElement('a');
    link.textContent = '  影神图 \n 百科  ';

    expect(describeClickTarget(link)).toBe('影神图 百科');
  });

  it('超长文本截断到 48 字，避免录制文件被一行正文淹没', () => {
    const button = document.createElement('button');
    button.textContent = '妖'.repeat(200);

    expect(describeClickTarget(button)).toHaveLength(48);
  });

  it('无文本时退回 title，再退回标签名', () => {
    const withTitle = document.createElement('button');
    withTitle.setAttribute('title', '关闭');
    expect(describeClickTarget(withTitle)).toBe('关闭');

    const empty = document.createElement('div');
    expect(describeClickTarget(empty)).toBe('<div>');
  });

  it('null 目标返回 unknown（录制点击了非元素节点时不崩）', () => {
    expect(describeClickTarget(null)).toBe('unknown');
  });
});

describe('录制缓冲', () => {
  beforeEach(() => {
    resetRecorder();
  });

  it('未开启录制时 recordEvent 是空操作（调用点不必各自判断开关）', () => {
    recordEvent('click', '不该被记录');

    expect(isRecordingActive()).toBe(false);
    expect(countRecordedEvents()).toBe(0);
  });

  it('开启后按顺序记录，并可清空', () => {
    setRecordingEnabled(true);
    recordEvent('click', '打开控制台', '2026-01-01T00:00:00.000Z');
    recordEvent('navigate', '/wiki');

    expect(countRecordedEvents()).toBe(2);
    expect(listRecordedEvents()[0]).toEqual({
      at: '2026-01-01T00:00:00.000Z',
      kind: 'click',
      target: '打开控制台',
    });

    clearRecordedEvents();
    expect(countRecordedEvents()).toBe(0);
  });

  it('超过上限时丢弃最旧记录（内存缓冲不能无限增长）', () => {
    setRecordingEnabled(true);
    for (let index = 0; index < MAX_RECORDED_EVENTS + 25; index += 1) {
      recordEvent('click', `第 ${index} 次点击`);
    }

    const events = listRecordedEvents();
    expect(events).toHaveLength(MAX_RECORDED_EVENTS);
    expect(events[0]?.target).toBe('第 25 次点击');
    expect(events.at(-1)?.target).toBe(`第 ${MAX_RECORDED_EVENTS + 24} 次点击`);
  });
});

describe('buildRecordingFile', () => {
  it('组装带版本号与导出时间的文件（时间注入便于断言）', () => {
    setRecordingEnabled(true);
    recordEvent('console', '数据 → 导出快照', '2026-01-01T00:00:00.000Z');

    const file = buildRecordingFile(listRecordedEvents(), '2026-01-02T00:00:00.000Z');

    expect(file.version).toBe(1);
    expect(file.exportedAt).toBe('2026-01-02T00:00:00.000Z');
    expect(file.events).toHaveLength(1);
  });
});
