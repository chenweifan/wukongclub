import { PagePlaceholder } from '@/components/ui/PagePlaceholder';
import { COPY } from '@/utils/copy';

/** 影神图百科：卡片墙、筛选排序、详情抽屉、关联图谱、最多 3 词条对比（阶段 2 交付）。 */
export function WikiPage() {
  return (
    <PagePlaceholder
      pageName={COPY.nav.wiki}
      phase="阶段 2"
      description={COPY.navDescription.wiki}
    />
  );
}
