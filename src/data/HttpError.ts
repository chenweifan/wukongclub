import { COPY } from '@/utils/copy';

/**
 * 跨层统一错误类型（协议 6.3 的 HttpError）。
 * status === 0 表示「请求根本没到达服务端」：断网、DNS 失败、worker 拦截失败等。
 * 数据层只产出**技术性**错误信息，面向用户的文案由 UI 层（StateBoundary 的 slot）决定。
 */
export class HttpError extends Error {
  readonly status: number;
  readonly code: string | null;

  constructor(status: number, message: string, options?: { code?: string; cause?: unknown }) {
    super(message, options?.cause === undefined ? undefined : { cause: options.cause });
    this.name = 'HttpError';
    this.status = status;
    this.code = options?.code ?? null;
  }

  /** 断网：status 0 是业界约定（fetch 失败没有状态码）。 */
  get isOffline(): boolean {
    return this.status === 0;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }
}

/** 给 UI 用的兜底文案：无错误对象时不要显示空字符串。 */
export function fallbackErrorMessage(): string {
  return COPY.error.unknown;
}
