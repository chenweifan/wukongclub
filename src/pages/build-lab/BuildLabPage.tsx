import { PagePlaceholder } from '@/components/ui/PagePlaceholder';
import { COPY } from '@/utils/copy';

/** 配装模拟器：槽位拖拽、属性实时计算、分享链接与出图（未交付：原计划阶段 3）。 */
export function BuildLabPage() {
  return (
    <PagePlaceholder
      pageName={COPY.nav.buildLab}
      phase="原计划 · 阶段 3"
      description={COPY.navDescription.buildLab}
    />
  );
}
