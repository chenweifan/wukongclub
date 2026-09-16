import { PagePlaceholder } from '@/components/ui/PagePlaceholder';
import { COPY } from '@/utils/copy';

/**
 * 个人主页：名片、成就徽章、发帖/收藏/配装 Tab、关注关系（阶段 2 交付）。
 * 该组件同时服务 `/user` 与 `/user/:userId`：阶段 2 通过 useParams 区分「自己 / 他人」视角。
 */
export function UserPage() {
  return (
    <PagePlaceholder
      pageName={COPY.nav.user}
      phase="阶段 2"
      description={COPY.navDescription.user}
    />
  );
}
