import { COPY } from '@/utils/copy';

export interface UnofficialDisclaimerProps {
  /** compact 用于后台等次级页面：只保留最关键的非官方声明。 */
  variant?: 'full' | 'compact';
}

/**
 * 非官方声明与版权说明（协议第九节自检项：含非官方声明与剧透提示）。
 * 放在布局层而不是页面层，确保任何路由都不会漏掉合规声明。
 */
export function UnofficialDisclaimer({ variant = 'full' }: UnofficialDisclaimerProps) {
  return (
    <div className="space-y-1 text-xs leading-relaxed text-content-muted">
      <p>{COPY.disclaimer.unofficial}</p>
      {variant === 'full' ? (
        <>
          <p>{COPY.disclaimer.copyright}</p>
          <p>{COPY.disclaimer.mockData}</p>
          <p>{COPY.disclaimer.spoiler}</p>
        </>
      ) : null}
    </div>
  );
}
