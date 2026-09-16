/** 把 JSON 数据下载为文件。浏览器专属能力，测试里不调用（jsdom 不实现 createObjectURL）。 */
export function downloadJson(fileName: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });

  if (typeof URL.createObjectURL !== 'function') {
    throw new Error('当前环境不支持文件下载（URL.createObjectURL 不可用）');
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = 'noopener';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
