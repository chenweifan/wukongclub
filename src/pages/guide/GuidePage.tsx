import { PagePlaceholder } from '@/components/ui/PagePlaceholder';
import { COPY } from '@/utils/copy';

/** 攻略库：Boss / 配装 / 结局分类，难度标签与步骤时间轴（阶段 2 交付）。 */
export function GuidePage() {
  return (
    <PagePlaceholder
      pageName={COPY.nav.guide}
      phase="阶段 2"
      description={COPY.navDescription.guide}
    />
  );
}
