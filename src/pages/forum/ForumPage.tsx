import { PagePlaceholder } from '@/components/ui/PagePlaceholder';
import { COPY } from '@/utils/copy';

/** 论坛：版块、帖子流、TipTap 编辑器、嵌套评论与版主工具条（阶段 2 交付）。 */
export function ForumPage() {
  return (
    <PagePlaceholder
      pageName={COPY.nav.forum}
      phase="阶段 2"
      description={COPY.navDescription.forum}
    />
  );
}
