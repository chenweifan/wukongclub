/**
 * 数据基线标记：刻意做成**零依赖**的小模块。
 *
 * 为什么单独拆出来：main.tsx 需要先判断「是否首次访问」，
 * 只有首次才去动态加载带 faker 的种子模块（那是几百 KB）。
 * 如果这个判断放在 demoData.ts 里，就会为了读一个 localStorage 键
 * 而把整个种子/本地库依赖拉进启动路径。
 */
export const DATA_INITIALIZED_KEY = 'hmw:initialized';

export function markDataInitialized(): void {
  try {
    window.localStorage.setItem(DATA_INITIALIZED_KEY, '1');
  } catch {
    // 隐私模式下写不了 localStorage：只是下次会重新播种，不影响本次会话
  }
}

export function isDataInitialized(): boolean {
  try {
    return window.localStorage.getItem(DATA_INITIALIZED_KEY) === '1';
  } catch {
    // 读不到时按「已初始化」处理，避免每次访问都重新播种覆盖用户数据
    return true;
  }
}
