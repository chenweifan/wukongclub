import { PagePlaceholder } from '@/components/ui/PagePlaceholder';
import { COPY } from '@/utils/copy';

/** 灵蕴商城：勋章/头像框/称号兑换、积分流水与积分不足态（阶段 3 交付）。 */
export function ShopPage() {
  return (
    <PagePlaceholder
      pageName={COPY.nav.shop}
      phase="阶段 3"
      description={COPY.navDescription.shop}
    />
  );
}
