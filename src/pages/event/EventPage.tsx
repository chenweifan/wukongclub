import { PagePlaceholder } from '@/components/ui/PagePlaceholder';
import { COPY } from '@/utils/copy';

/** 活动中心：赛季挑战、报名、榜单与规则折叠，含未开始/进行中/已结束三态（阶段 3 交付）。 */
export function EventPage() {
  return (
    <PagePlaceholder
      pageName={COPY.nav.event}
      phase="阶段 3"
      description={COPY.navDescription.event}
    />
  );
}
