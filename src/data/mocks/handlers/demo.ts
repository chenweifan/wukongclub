import { HttpResponse, http } from 'msw';

import type { Paginated } from '@/data/contracts/common';
import type { DemoProbe } from '@/data/contracts/demoProbe';
import { readAllProbes } from '@/data/db/demoData';
import { hmwDb } from '@/data/db/hmwDb';
import { mockDelay, mockError, toMockResponse } from '@/data/mocks/mockControl';

export const DEMO_PROBES_PATH = '/api/demo/probes';

/**
 * 演示探针接口（阶段 1 专用）。
 * 两个 handler 都**必须**先 mockError() 再 await mockDelay()（协议 1.3）——
 * 演示控制台切到断网/错误态时，所有列表立刻统一失败。
 */
export const demoHandlers = [
  http.get(DEMO_PROBES_PATH, async () => {
    try {
      mockError();
      await mockDelay();

      const items = await readAllProbes();
      const payload: Paginated<DemoProbe> = {
        items,
        total: items.length,
        page: 1,
        pageSize: Math.max(items.length, 1),
      };

      return HttpResponse.json(payload);
    } catch (error) {
      return toMockResponse(error);
    }
  }),

  http.patch(`${DEMO_PROBES_PATH}/:id`, async ({ params }) => {
    try {
      mockError();
      await mockDelay();

      const id = typeof params.id === 'string' ? params.id : '';
      const existing = await hmwDb.probes.get(id);

      if (existing === undefined) {
        return HttpResponse.json({ message: '探针不存在' }, { status: 404 });
      }

      const updated: DemoProbe = { ...existing, collected: !existing.collected };
      await hmwDb.probes.put(updated);

      return HttpResponse.json(updated);
    } catch (error) {
      return toMockResponse(error);
    }
  }),
];
