import { transferableAbortController } from 'node:util';

import { configure, cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';

import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

import { server } from '@/data/mocks/node';
import { useDemoStore } from '@/demo/demoStore';
import { resetRecorder } from '@/demo/recorder';
import { useSessionStore } from '@/entities/session';
import { useToastStore } from '@/stores/toastStore';

/**
 * findBy* 的默认等待是 1s。演示浮层（控制台/提示条）是 React.lazy 的，
 * 在并行跑 20+ 个测试文件时，按需编译并求值这个 chunk 偶尔会超过 1s，
 * 于是出现「单独跑通过、全量跑失败」的假阴性。放宽到 5s 消除这类抖动，
 * 真正的失败依旧会明确报错（而不是超时掩盖）。
 */
configure({ asyncUtilTimeout: 5000 });

/**
 * jsdom 会用自己的 AbortController / AbortSignal 覆盖全局，
 * 而 Node（undici）的 Request 只接受 Node 原生 AbortSignal —— 两者不是同一实现，
 * 于是 react-router 的 data router 每次导航构造 Request 时都会抛
 * TypeError: RequestInit: Expected signal to be an instance of AbortSignal。
 *
 * 解决方式：把 Node 原生实现放回全局，使环境内 Request 与 AbortSignal 同源。
 * 只用 transferableAbortController() 取回构造函数，不引入任何新依赖，
 * 也不改动生产代码（生产环境跑在浏览器里，不存在这个错配）。
 */
function isAbortControllerConstructor(value: unknown): value is typeof AbortController {
  return typeof value === 'function';
}

function isAbortSignalConstructor(value: unknown): value is typeof AbortSignal {
  return typeof value === 'function';
}

const nativeAbortController = transferableAbortController();
const nativeControllerConstructor: unknown = nativeAbortController.constructor;
const nativeSignalConstructor: unknown = nativeAbortController.signal.constructor;

if (isAbortControllerConstructor(nativeControllerConstructor)) {
  globalThis.AbortController = nativeControllerConstructor;
}

if (isAbortSignalConstructor(nativeSignalConstructor)) {
  globalThis.AbortSignal = nativeSignalConstructor;
}

/**
 * 全局起 MSW Node server：与浏览器端复用同一份 handler。
 * 于是「Repository → MSW → Dexie」在单测里是真实链路，
 * 配合 fake-indexeddb（jsdom 没有 IndexedDB）就能完整跑通读写。
 */
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  cleanup();
  // 演示状态、会话与提示都是模块级 store，不隔离会让用例互相污染
  useDemoStore.getState().reset();
  useSessionStore.getState().markAnonymous();
  useToastStore.getState().clear();
  resetRecorder();
  window.localStorage.clear();
  window.history.replaceState(null, '', '/');
});

afterAll(() => {
  server.close();
});
