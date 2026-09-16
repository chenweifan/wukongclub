import { HttpError } from '@/data/HttpError';
import { isPaginatedProbes, isDemoProbe } from '@/data/contracts/demoProbe';
import type { DemoProbe } from '@/data/contracts/demoProbe';
import type { Paginated } from '@/data/contracts/common';
import { requestJson } from '@/data/httpClient';
import { DEMO_PROBES_PATH } from '@/data/mocks/handlers/demo';

/**
 * 演示探针 Repository（协议 6.2：业务代码只依赖这一层，未来接真实后端只需换实现）。
 * 注意它是**唯一**知道 URL 与响应形状的地方：解析失败一律抛 HttpError，
 * 绝不用类型断言把 unknown 硬掰成契约类型。
 */
export interface DemoProbeRepository {
  list(): Promise<Paginated<DemoProbe>>;
  toggleCollected(id: string): Promise<DemoProbe>;
}

export const demoProbeRepo: DemoProbeRepository = {
  async list(): Promise<Paginated<DemoProbe>> {
    const payload = await requestJson(DEMO_PROBES_PATH);

    if (!isPaginatedProbes(payload)) {
      throw new HttpError(500, '探针列表响应不符合契约', { code: 'CONTRACT_MISMATCH' });
    }

    return payload;
  },

  async toggleCollected(id: string): Promise<DemoProbe> {
    const payload = await requestJson(`${DEMO_PROBES_PATH}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
    });

    if (!isDemoProbe(payload)) {
      throw new HttpError(500, '探针响应不符合契约', { code: 'CONTRACT_MISMATCH' });
    }

    return payload;
  },
};
