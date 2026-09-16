export interface WaitForElementOptions {
  timeoutMs?: number;
  intervalMs?: number;
  /** 便于测试注入；默认在 document 里找。 */
  root?: ParentNode;
}

export const DEFAULT_ELEMENT_TIMEOUT_MS = 2500;
export const DEFAULT_ELEMENT_POLL_MS = 60;

/**
 * 等待某个选择器出现在 DOM 里（跨页引导的关键一环）。
 * 返回 null 表示超时：调用方据此决定是「放弃高亮」还是「照常显示中央气泡」，
 * 而不是让引导卡死。
 */
export function waitForElement(
  selector: string,
  options: WaitForElementOptions = {},
): Promise<Element | null> {
  const root: ParentNode = options.root ?? document;
  const timeoutMs = options.timeoutMs ?? DEFAULT_ELEMENT_TIMEOUT_MS;
  const intervalMs = options.intervalMs ?? DEFAULT_ELEMENT_POLL_MS;

  const immediate = root.querySelector(selector);
  if (immediate !== null) {
    return Promise.resolve(immediate);
  }

  return new Promise<Element | null>((resolve) => {
    const startedAt = Date.now();

    const timer = setInterval(() => {
      const element = root.querySelector(selector);
      const timedOut = Date.now() - startedAt >= timeoutMs;

      if (element !== null || timedOut) {
        clearInterval(timer);
        resolve(element);
      }
    }, intervalMs);
  });
}
