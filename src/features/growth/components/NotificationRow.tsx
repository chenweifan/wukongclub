import type { NotificationItem } from '@/data/contracts/growth';
import { cn } from '@/utils/cn';
import { COPY } from '@/utils/copy';
import { formatRelativeTime } from '@/utils/dateFormat';

export interface NotificationRowProps {
  item: NotificationItem;
  onOpen: (item: NotificationItem) => void;
  onMarkRead: (notificationId: string) => void;
  /** 便于 story/单测固定「现在」。 */
  now?: Date;
}

/**
 * 单条消息。
 *
 * 未读态用三重表达：左侧朱砂圆点 + 标题加粗 + 边框高亮 —— 不依赖单一颜色。
 * 「标为已读」只在未读时出现，避免每行都挂一个用不上的按钮。
 */
export function NotificationRow({ item, onOpen, onMarkRead, now }: NotificationRowProps) {
  return (
    <li
      className={cn(
        'border-token rounded-scroll border p-3',
        item.read ? 'border-line' : 'border-accent',
      )}
    >
      <div className="flex items-start gap-3">
        <span className="stamp shrink-0">{COPY.growth.notifications.category[item.category]}</span>

        <div className="min-w-0 flex-1">
          <p className={cn('text-sm text-content', !item.read && 'font-medium')}>
            {item.read ? null : (
              <span aria-hidden="true" className="text-cinnabar mr-1">
                ●
              </span>
            )}
            {item.title}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-content-muted">{item.body}</p>
          <p className="mt-1 text-[11px] text-content-muted">
            {formatRelativeTime(item.createdAt, now)}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <button
            type="button"
            onClick={() => {
              onOpen(item);
            }}
            className="border-token border-line hover:text-accent rounded-scroll border px-2 py-0.5 text-[11px]"
          >
            {COPY.growth.notifications.openLink}
          </button>

          {item.read ? null : (
            <button
              type="button"
              onClick={() => {
                onMarkRead(item.id);
              }}
              className="text-content-muted hover:text-content text-[11px]"
            >
              {COPY.growth.notifications.markRead}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
