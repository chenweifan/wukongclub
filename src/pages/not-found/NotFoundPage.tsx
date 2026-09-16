import { Link } from 'react-router-dom';

import { COPY } from '@/utils/copy';

/** 404：渲染在空白布局内，因此不自带满屏容器。 */
export function NotFoundPage() {
  return (
    <section className="panel-scroll texture-grain p-8 text-center">
      <p className="stamp inline-block">404</p>
      <h1 className="mt-4 text-2xl">{COPY.notFound.title}</h1>
      <p className="mt-3 text-sm text-content-muted">{COPY.notFound.hint}</p>
      <Link
        to="/"
        className="border-token border-line mt-6 inline-block rounded-scroll border px-4 py-2 text-sm text-accent"
      >
        {COPY.common.backHome}
      </Link>
    </section>
  );
}
