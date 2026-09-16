import { PagePlaceholder } from '@/components/ui/PagePlaceholder';
import { COPY } from '@/utils/copy';

/** 活动中心：赛季挑战、报名、榜单与规则折叠（未交付：原计划阶段 3）。 */
export function EventPage() {
  return (
    <PagePlaceholder
      pageName={COPY.nav.event}
      phase="原计划 · 阶段 3"
      description={COPY.navDescription.event}
    />
  );
}
