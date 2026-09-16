import { COPY } from '@/utils/copy';

export interface PagePlaceholderProps {
  /** 页面名，用于拼出「{{页面名}} · 建设中」 */
  pageName: string;
  /** 该页计划交付的阶段，方便评审一眼定位进度。 */
  phase?: string;
  /** 覆盖默认说明文案。 */
  description?: string;
}

/**
 * 阶段 0 的统一占位页。
 * 所有路由都指向它，用于验证「路由表 + 布局 + 主题令牌」三件事已经跑通。
 */
export function PagePlaceholder({
  pageName,
  phase = '阶段 2',
  description = COPY.placeholder.hint,
}: PagePlaceholderProps) {
  return (
    <section
      data-tour="page-placeholder"
      className="panel-scroll texture-grain mx-auto max-w-page p-8"
    >
      <p className="stamp inline-block">{phase}</p>
      <h1 className="mt-4 text-2xl md:text-3xl">{COPY.placeholder.default(pageName)}</h1>
      <p className="mt-3 max-w-2xl text-sm text-content-muted">{description}</p>
    </section>
  );
}
