import { setupWorker } from 'msw/browser';

import { handlers } from '@/data/mocks/handlers';

/**
 * 浏览器端 Mock worker。本项目没有真实后端，因此 worker 在 main.tsx 里
 * 于渲染之前启动（start 完成后再挂载 React，避免首屏请求漏拦截）。
 */
export const worker = setupWorker(...handlers);
