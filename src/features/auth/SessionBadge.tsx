import { Link } from 'react-router-dom';

import { useSession, useSessionActions } from '@/entities/session';
import { useUnreadNotificationCount } from '@/entities/growth/queries';
import { pushToast } from '@/stores/toastStore';
import { COPY } from '@/utils/copy';

/**
 * 顶栏的会话入口。
 * 未登录 → 登录链接；已登录 → 印章头像 + 道号 + 未读红点 + 退出。
 *
 * 未读数复用消息中心的同一份 Query 缓存（entities/growth/queries），
 * 因此「标为已读」后红点会立刻消失，不需要额外的状态同步。
 */
export function SessionBadge() {
  const { isAuthenticated, user, isResolving } = useSession();
  const { logout, isPending } = useSessionActions();
  const unreadCount = useUnreadNotificationCount();

  if (isResolving) {
    return <span className="text-content-muted text-xs">{COPY.session.resolving}</span>;
  }

  if (!isAuthenticated || user === null) {
    return (
      <Link
        to="/login"
        className="border-token border-line text-content-muted hover:text-accent rounded-scroll border px-3 py-1.5 text-sm transition-colors duration-fast"
      >
        {COPY.session.entry}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        to="/user"
        aria-label={COPY.session.openProfile(user.displayName)}
        className="border-token border-line hover:border-accent flex items-center gap-2 rounded-scroll border px-2 py-1"
      >
        <span
          aria-hidden="true"
          className="font-display text-accent flex h-6 w-6 items-center justify-center rounded-sm text-xs"
        >
          {user.avatarGlyph}
        </span>
        <span className="hidden max-w-24 truncate text-xs text-content sm:inline">
          {user.displayName}
        </span>
        {unreadCount > 0 ? (
          <span
            className="bg-cinnabar flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] text-white"
            title={COPY.growth.notifications.unread(unreadCount)}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </Link>

      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          void logout().then(() => {
            pushToast(COPY.session.logoutDone);
          });
        }}
        className="border-token border-line text-content-muted hover:text-content rounded-scroll border px-2 py-1 text-xs disabled:opacity-60"
      >
        {COPY.session.logout}
      </button>
    </div>
  );
}
