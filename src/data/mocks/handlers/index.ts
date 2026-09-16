import { demoHandlers } from '@/data/mocks/handlers/demo';

/**
 * 全部 mock handler 的注册表（协议：新 mock 必须注册进 browser.ts）。
 * 阶段 2 起每个业务模块在这里追加自己的 handler 数组。
 */
export const handlers = [...demoHandlers];
