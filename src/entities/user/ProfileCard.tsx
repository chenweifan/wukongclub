import type { User } from '@/data/contracts/user';
import { resolveUserLevel } from '@/entities/user/level';
import { cn } from '@/utils/cn';
import { COPY } from '@/utils/copy';
import { formatDate } from '@/utils/dateFormat';

export interface ProfileCardProps {
  user: User;
  className?: string;
}

/**
 * 天命人名片（协议阶段 2「用户与成长」交付物）。
 *
 * 它是**领域实体组件**：论坛的作者卡片、个人主页、名片弹窗都会复用，
 * 因此放在 entities/user 而不是某个 feature 里 —— feature 之间不允许互相引用。
 *
 * 无障碍：等级进度用 role="progressbar" 并带 aria-valuenow；
 * 徽章的锁定态不只靠颜色（前面有 ◆/◇ 符号），色盲用户同样能分辨。
 */
export function ProfileCard({ user, className }: ProfileCardProps) {
  const level = resolveUserLevel(user.exp);
  const unlockedCount = user.badges.filter((badge) => badge.unlockedAt !== null).length;
  const progressPercent = Math.round(level.progress * 100);

  return (
    <section
      aria-label={COPY.growth.profile.title}
      className={cn('panel-scroll texture-grain p-6', className)}
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="border-token border-accent font-display text-accent flex h-14 w-14 shrink-0 items-center justify-center rounded-scroll border text-2xl"
        >
          {user.avatarGlyph}
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl text-content">{user.displayName}</h2>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-content-muted">
            <span className="stamp">{user.title}</span>
            <span>@{user.username}</span>
            <span>{COPY.growth.profile.joinedAt(formatDate(user.joinedAt))}</span>
          </p>
          <p className="mt-2 text-sm text-content-muted">{user.bio}</p>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
        <ProfileStat label={COPY.growth.stats.spiritPoints} value={String(user.spiritPoints)} />
        <ProfileStat label={COPY.growth.level.label} value={level.rank.name} />
        <ProfileStat
          label={COPY.growth.stats.badges}
          value={`${unlockedCount} / ${user.badges.length}`}
        />
      </dl>

      <div className="mt-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-content-muted">
          <span>
            {COPY.growth.level.level(level.level)} · {level.rank.blurb}
          </span>
          <span>
            {level.expToNext === null
              ? COPY.growth.level.maxed
              : COPY.growth.level.toNext(level.expToNext)}
          </span>
        </div>

        <div
          role="progressbar"
          aria-label={COPY.growth.level.exp}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPercent}
          className="bg-surface-2 mt-2 h-2 overflow-hidden rounded-full"
        >
          <span className="bg-accent block h-full" style={{ width: `${progressPercent}%` }} />
        </div>

        <p className="mt-1 text-[11px] text-content-muted">
          {COPY.growth.level.expValue(user.exp)}
        </p>
      </div>

      <div className="mt-5">
        <h3 className="text-xs text-content-muted">
          {COPY.growth.badges.title} ·{' '}
          {COPY.growth.badges.unlockedRatio(unlockedCount, user.badges.length)}
        </h3>

        <ul className="mt-2 flex flex-wrap gap-2">
          {user.badges.map((badge) => (
            <li key={badge.id}>
              <span
                title={badge.description}
                className={cn('stamp', badge.unlockedAt === null && 'opacity-60')}
              >
                {badge.unlockedAt === null ? '◇ ' : '◆ '}
                {badge.name}
              </span>
            </li>
          ))}
        </ul>

        {unlockedCount < user.badges.length ? (
          <p className="mt-2 text-[11px] text-content-muted">
            {COPY.growth.badges.lockedBadgeHint}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-token border-line rounded-scroll border px-3 py-2">
      <dt className="text-[11px] text-content-muted">{label}</dt>
      <dd className="mt-1 font-display text-base text-content">{value}</dd>
    </div>
  );
}
