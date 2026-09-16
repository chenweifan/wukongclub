import { PagePlaceholder } from '@/components/ui/PagePlaceholder';
import { COPY } from '@/utils/copy';

/** 二创广场：瀑布流、授权标识、年龄分级与举报入口（未交付：原计划阶段 3）。 */
export function CreationPage() {
  return (
    <PagePlaceholder
      pageName={COPY.nav.creation}
      phase="原计划 · 阶段 3"
      description={COPY.navDescription.creation}
    />
  );
}
