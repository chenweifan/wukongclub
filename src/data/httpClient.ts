import { buildAuthHeaders } from '@/data/authToken';
import { buildDeviceHeaders } from '@/data/deviceId';
import { HttpError } from '@/data/HttpError';
import { isApiErrorBody } from '@/data/contracts/common';

/**
 * 全项目**唯一**允许出现 fetch 的地方（协议架构铁律 1）。
 * 业务代码只能依赖 src/data/repositories 暴露的接口。
 *
 * 返回 unknown 而非泛型 T：运行期拿不到类型信息，把「解析」这件事交给
 * 各契约自己的类型守卫，而不是用 `as` 断言糊过去（协议铁律 9）。
 *
 * 会话令牌在这里统一注入：只有一处拼请求头，就不会出现
 * 「某个 repo 忘了带 token」这类只在联调时才暴露的问题。
 */
export async function requestJson(url: string, init?: RequestInit): Promise<unknown> {
  let response: Response;

  const headers = new Headers(init?.headers);
  for (const [key, value] of Object.entries(buildAuthHeaders())) {
    headers.set(key, value);
  }
  // 设备标识始终带上：未登录时的收藏等「设备级」数据靠它归属
  for (const [key, value] of Object.entries(buildDeviceHeaders())) {
    headers.set(key, value);
  }

  try {
    response = await fetch(url, { ...init, headers });
  } catch (error) {
    // 断网 / worker 未就绪 / CORS：统一收敛成 status 0，UI 据此展示断网态
    throw new HttpError(0, '请求未能到达服务端', { code: 'NETWORK_ERROR', cause: error });
  }

  if (!response.ok) {
    throw new HttpError(response.status, await readErrorMessage(response), {
      code: `HTTP_${response.status}`,
    });
  }

  // 204 / 空响应体没有 JSON 可解析（例如 POST /api/auth/logout）：
  // 直接返回 null，而不是抛「响应不是合法 JSON」这种误导性错误。
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null;
  }

  try {
    return await response.json();
  } catch (error) {
    throw new HttpError(response.status, '响应不是合法 JSON', {
      code: 'INVALID_JSON',
      cause: error,
    });
  }
}

/** 尽量从错误响应体里取出服务端给的 message，取不到再退回状态码文案。 */
async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (isApiErrorBody(body)) {
      return body.message;
    }
  } catch {
    // 响应体不是 JSON 时忽略，用状态码兜底
  }

  return `请求失败（HTTP ${response.status}）`;
}
