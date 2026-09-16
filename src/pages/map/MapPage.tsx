import { PagePlaceholder } from '@/components/ui/PagePlaceholder';
import { COPY } from '@/utils/copy';

/** 互动地图：章节切换、图层开关、点位聚合与收集进度（阶段 3 交付）。 */
export function MapPage() {
  return (
    <PagePlaceholder pageName={COPY.nav.map} phase="阶段 3" description={COPY.navDescription.map} />
  );
}
