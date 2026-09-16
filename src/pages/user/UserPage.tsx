import { Link } from 'react-router-dom';

import { useDemoStore } from '@/demo/demoStore';
import { useSession } from '@/entities/session';
import { ProfileCard } from '@/entities/user/ProfileCard';
import { CheckInPanel } from '@/features/growth/components/CheckInPanel';
import { NotificationCenter } from '@/features/growth/components/NotificationCenter';
import { TaskCenter } from '@/features/growth/components/TaskCenter';
import { COPY } from '@/utils/copy';

/**
 * 「我的」页 = 阶段 2 的成长中心（名片 / 上香签到 / 任务 / 消息）。
 * 该组件同时服务 `/user` 与 `/user/:userId`，他人视角在阶段 2 最后一个模块（个人主页）补齐。
 *
 * 为什么在页面层就分流「未登录 / 封禁」，而不是让四个面板各自处理 401：
 * 未登录时连发四个必然失败的请求再逐个报错，是明显的浪费与闪烁来源。
 */
export function UserPage() {
  const { isAuthenticated, isResolving, user } = useSession();
  const role = useDemoStore((state) => state.role);

  if (isResolving) {
    return (
      <section className="panel-scroll p-6" aria-live="polite">
        <p className="text-content-muted text-sm">{COPY.session.resolving}</p>
      </section>
    );
  }

  if (role === 'banned') {
    return <NoticePanel title={COPY.auth.bannedTitle} description={COPY.auth.bannedDescription} />;
  }

  if (!isAuthenticated || user === null) {
    return (
      <section data-tour="growth-need-login" className="panel-scroll texture-grain p-6 text-center">
        <p className="stamp inline-block">{COPY.growth.title}</p>
        <h1 className="mt-4 text-xl">{COPY.auth.needLoginTitle}</h1>
        <p className="mt-3 text-sm text-content-muted">{COPY.auth.needLoginDescription}</p>
        <Link
          to="/login"
          className="bg-accent text-accent-ink mt-5 inline-block rounded-scroll px-4 py-2 text-sm font-medium"
        >
          {COPY.auth.toLogin}
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl">{COPY.growth.title}</h1>
        <p className="mt-1 text-xs text-content-muted">{COPY.growth.description}</p>
      </header>

      <ProfileCard user={user} />
      <CheckInPanel />
      <TaskCenter />
      <NotificationCenter />
    </div>
  );
}

function NoticePanel({ title, description }: { title: string; description: string }) {
  return (
    <section role="alert" className="panel-scroll texture-grain p-6 text-center">
      <h1 className="text-danger text-xl">{title}</h1>
      <p className="mt-3 text-sm text-content-muted">{description}</p>
    </section>
  );
}
