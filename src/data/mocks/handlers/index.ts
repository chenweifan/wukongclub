import { demoHandlers } from '@/data/mocks/handlers/demo';
import { authHandlers } from '@/data/mocks/handlers/auth';
import { encyclopediaHandlers } from '@/data/mocks/handlers/encyclopedia';
import { growthHandlers } from '@/data/mocks/handlers/growth';

/**
 * 全部 mock handler 的注册表（协议：新 mock 必须注册进 browser.ts）。
 * 浏览器与 Node 两端都从这里取，因此单测跑的链路与页面完全一致。
 */
export const handlers = [
  ...demoHandlers,
  ...authHandlers,
  ...growthHandlers,
  ...encyclopediaHandlers,
];
