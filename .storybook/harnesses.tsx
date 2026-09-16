import { useEffect, useState } from 'react';

import type { ReactNode } from 'react';

import { seedDemoGrowth } from '@/data/db/growthData';
import { clearWikiTables, seedWikiEntries } from '@/data/db/encyclopediaData';
import { toPublicUser } from '@/data/db/records';
import type { UserRecord } from '@/data/db/records';
import { authRepo } from '@/data/repositories';
import { useSessionStore } from '@/entities/session';
import { useDemoStore } from '@/demo/demoStore';
import { COPY } from '@/utils/copy';

/**
 * Storybook 专用的数据准备壳。
 *
 * 阶段 2 的成长域组件依赖「已登录 + 有签到/任务/消息数据」才能展示真实形态。
 * 与其把数据塞成 props（那样 story 通过、页面照样出问题），
 * 不如走与页面相同的路径：先登录拿令牌，再让 mock 后端把数据种上，
 * 然后渲染真实组件 —— 组件内部的 useQuery 会自己把数据取回来。
 */
type Prep = 'demo' | 'fresh' | 'anonymous';

function usePreparedSession(prep: Prep): boolean {
  const [ready, setReady] = useState(prep === 'anonymous');

  useEffect(() => {
    if (prep === 'anonymous') {
      useSessionStore.getState().markAnonymous();
      return;
    }

    let cancelled = false;

    void (async () => {
      const result = await authRepo.demoLogin();
      const record = result.user as UserRecord;

      if (prep === 'demo') {
        // 富数据：42 天签到历史 + 全部任务 + 10 条消息
        await seedDemoGrowth(record.id, new Date());
      }

      if (!cancelled) {
        useSessionStore.getState().markAuthenticated(toPublicUser(record));
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [prep]);

  return ready;
}

export interface GrowthHarnessProps {
  prep?: Prep;
  children: ReactNode;
}

export function GrowthHarness({ prep = 'demo', children }: GrowthHarnessProps) {
  const ready = usePreparedSession(prep);

  if (!ready) {
    return <p className="text-content-muted p-4 text-xs">{COPY.common.loading}</p>;
  }

  return <>{children}</>;
}

/** 只设置会话（不碰数据），用于顶栏徽章这类不查数据的组件。 */
export function SessionHarness({ children }: { children: ReactNode }) {
  const ready = usePreparedSession('fresh');

  if (!ready) {
    return <p className="text-content-muted p-4 text-xs">{COPY.common.loading}</p>;
  }

  return <>{children}</>;
}

/** 把演示身份一并摆好（成长中心的封禁态等 story 需要）。 */
export function withDemoRole(
  role: 'guest' | 'newbie' | 'active' | 'moderator' | 'admin' | 'banned',
) {
  useDemoStore.setState({ enabled: true, role });
}

/**
 * 百科数据准备：影神图词条是**内容数据**，与登录态无关，
 * 因此这里只负责把词条种进本地库（清表后重种，保证 story 之间互不影响）。
 */
export function WikiHarness({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      await clearWikiTables();
      await seedWikiEntries();

      if (!cancelled) {
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return <p className="text-content-muted p-4 text-xs">{COPY.common.loading}</p>;
  }

  return <>{children}</>;
}
