import { PagePlaceholder } from '@/components/ui/PagePlaceholder';
import { COPY } from '@/utils/copy';

/** 演示后台：审核队列、数据看板、用户管理（阶段 3 交付，仅 admin 身份可入）。 */
export function AdminPage() {
  return (
    <PagePlaceholder
      pageName={COPY.nav.admin}
      phase="阶段 3"
      description={COPY.navDescription.admin}
    />
  );
}
