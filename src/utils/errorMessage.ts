/**
 * 把 `unknown` 收敛成可展示的错误文案（协议铁律 9：不确定类型用 unknown + 类型守卫）。
 * 典型来源：react-router 的 useRouteError()、window.onerror、Promise rejection。
 */
export function describeUnknownError(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== '') {
    return error.message;
  }

  if (typeof error === 'string' && error.trim() !== '') {
    return error;
  }

  if (error !== null && typeof error === 'object' && 'message' in error) {
    const { message } = error;
    if (typeof message === 'string' && message.trim() !== '') {
      return message;
    }
  }

  return '发生了未知错误';
}

/** 错误可能带 HTTP 状态码（阶段 1 的 HttpError 会用到），单独提供取值器便于 UI 分级展示。 */
export function readErrorStatus(error: unknown): number | null {
  if (error !== null && typeof error === 'object' && 'status' in error) {
    const { status } = error;
    if (typeof status === 'number' && Number.isFinite(status)) {
      return status;
    }
  }
  return null;
}
