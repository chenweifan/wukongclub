import { PagePlaceholder } from '@/components/ui/PagePlaceholder';
import { COPY } from '@/utils/copy';

/** 登录：注册登录与天命人名片（阶段 2 交付，渲染在空白布局内）。 */
export function LoginPage() {
  return (
    <PagePlaceholder
      pageName={COPY.nav.login}
      phase="阶段 2"
      description="注册登录与天命人名片将在此交付。"
    />
  );
}
