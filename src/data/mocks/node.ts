import { setupServer } from 'msw/node';

import { handlers } from '@/data/mocks/handlers';

/**
 * Node 端 Mock server：Vitest 里复用与浏览器**完全相同**的 handler，
 * 因此「Repository → MSW → Dexie」这条链路在单测里是真实跑通的，
 * 而不是被 mock 掉的假链路。
 */
export const server = setupServer(...handlers);
