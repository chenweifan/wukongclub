import { PagePlaceholder } from '@/components/ui/PagePlaceholder';
import { COPY } from '@/utils/copy';

/** 论坛：版块、帖子流、编辑器与嵌套评论（未交付：原计划阶段 2）。 */
export function ForumPage() {
  return (
    <PagePlaceholder
      pageName={COPY.nav.forum}
      phase="原计划 · 阶段 2"
      description={COPY.navDescription.forum}
    />
  );
}
