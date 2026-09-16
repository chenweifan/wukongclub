import { PagePlaceholder } from '@/components/ui/PagePlaceholder';
import { COPY } from '@/utils/copy';

/** 资讯：官方动态聚合、标签筛选、剧透遮罩（阶段 2 交付）。 */
export function NewsPage() {
  return (
    <PagePlaceholder
      pageName={COPY.nav.news}
      phase="阶段 2"
      description={COPY.navDescription.news}
    />
  );
}
