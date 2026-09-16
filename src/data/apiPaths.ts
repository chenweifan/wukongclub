/**
 * 接口路径的唯一定义（handler 与 Repository 共用）。
 *
 * 为什么要单独一份：handler 需要带参模板（`:taskId`），Repository 需要填充后的具体 URL。
 * 两边共用同一组常量，就不会出现「改了路径只改了一边」的低级错误；
 * 将来接真实后端时，这份表原样保留。
 */
export const API_PATHS = {
  demoProbes: '/api/demo/probes',
  demoProbeToggle: '/api/demo/probes/:id',
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    demoLogin: '/api/auth/demo-login',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
  },
  growth: {
    checkIn: '/api/growth/check-in',
    tasks: '/api/growth/tasks',
    claimTask: '/api/growth/tasks/:taskId/claim',
    notifications: '/api/notifications',
    readNotification: '/api/notifications/:notificationId/read',
    readAllNotifications: '/api/notifications/read-all',
  },
  wiki: {
    entries: '/api/wiki/entries',
    entry: '/api/wiki/entries/:entryId',
    graph: '/api/wiki/entries/:entryId/graph',
    favorites: '/api/wiki/favorites',
    favorite: '/api/wiki/favorites/:entryId',
  },
  news: {
    articles: '/api/news',
    tags: '/api/news/tags',
    article: '/api/news/:newsId',
  },
  guide: {
    list: '/api/guides',
    counts: '/api/guides/counts',
    likes: '/api/guides/likes',
    detail: '/api/guides/:guideId',
    like: '/api/guides/:guideId/like',
  },
} as const;

/**
 * 填充路径参数（纯函数）。
 * 未提供的参数保持原样，而不是替换成 "undefined" —— 让错误在联调时显形，
 * 而不是变成一个看起来正常、实际请求错地址的 404。
 */
export function fillPath(template: string, params: Record<string, string> = {}): string {
  return template.replace(/:([a-zA-Z0-9_]+)/g, (segment, key: string) => {
    const value = params[key];
    return value === undefined ? segment : encodeURIComponent(value);
  });
}
