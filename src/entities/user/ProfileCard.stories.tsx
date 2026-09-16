import type { Meta, StoryObj } from '@storybook/react-vite';

import { buildBadges } from '@/data/seeds/user.seed';
import type { User } from '@/data/contracts/user';
import { ProfileCard } from '@/entities/user/ProfileCard';

/** 固定基准时间：story 的截图与 DOM 断言都不该随「今天」漂移。 */
const NOW = new Date('2026-02-14T09:00:00.000Z');

const baseUser: User = {
  id: 'user-story',
  username: 'tianming',
  displayName: '天命人·小圣',
  title: '初入山门',
  avatarGlyph: '悟',
  bio: '非官方粉丝站的第一位天命人，正在把走过的路记成影神图。',
  exp: 640,
  spiritPoints: 320,
  joinedAt: '2025-11-10T00:00:00.000Z',
  badges: buildBadges(4, NOW),
};

/**
 * 天命人名片（领域实体组件，论坛作者卡与个人主页都会复用）。
 * 修行境界由 exp 推导，因此 story 只需调整 exp 就能覆盖各境界。
 */
const meta = {
  title: '业务组件/ProfileCard',
  component: ProfileCard,
  tags: ['autodocs'],
  args: { user: baseUser },
} satisfies Meta<typeof ProfileCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NewUser: Story = {
  name: '刚注册（无徽章 / 凡体）',
  args: {
    user: {
      ...baseUser,
      displayName: '新来的',
      title: '还未开眼的行者',
      avatarGlyph: '新',
      exp: 0,
      spiritPoints: 50,
      badges: [],
      bio: '刚踏进山门，还没想好要去哪座山。',
    },
  },
};

export const MaxRank: Story = {
  name: '最高境界（齐天）',
  args: {
    user: { ...baseUser, exp: 9999, badges: buildBadges(8, NOW) },
  },
};

export const LongText: Story = {
  name: '极端长文本',
  args: {
    user: {
      ...baseUser,
      displayName: '把道号取得特别长以至于需要换行的天命人',
      bio: '这是一段刻意写得很长的自我介绍，用来检查名片在极端文案下的排版：'.repeat(4),
    },
  },
};

export const HighContrast: Story = {
  name: '高对比主题',
  globals: { theme: 'contrast' },
};
