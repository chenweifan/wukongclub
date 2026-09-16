import type { Meta, StoryObj } from '@storybook/react-vite';

import { NotificationRow } from '@/features/growth/components/NotificationRow';
import type { NotificationItem } from '@/data/contracts/growth';

const NOW = new Date('2026-02-14T09:00:00.000Z');

const baseItem: NotificationItem = {
  id: 'notification-story',
  category: 'system',
  title: '演示数据每周重置',
  body: '本站所有数据都保存在你自己的浏览器里，演示控制台可随时重置或导出快照。',
  createdAt: '2026-02-14T08:00:00.000Z',
  read: false,
  link: null,
};

/**
 * 单条消息：未读 / 已读 / 各分类 / 极端长文本。
 * 未读态用朱砂圆点 + 标题加粗 + 边框高亮三重表达，不依赖单一颜色。
 */
const meta = {
  title: '业务组件/NotificationRow',
  component: NotificationRow,
  tags: ['autodocs'],
  args: { item: baseItem, now: NOW, onOpen: () => undefined, onMarkRead: () => undefined },
} satisfies Meta<typeof NotificationRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unread: Story = { name: '未读' };

export const Read: Story = {
  name: '已读',
  args: { item: { ...baseItem, read: true } },
};

export const Achievement: Story = {
  name: '成就分类（可跳转）',
  args: {
    item: {
      ...baseItem,
      category: 'achievement',
      title: '解锁成就：黑风山初战',
      body: '你在黑风山击退了守关妖王，奖励 120 灵蕴。',
      link: '/user',
    },
  },
};

export const ReplyJustNow: Story = {
  name: '刚刚（相对时间）',
  args: {
    item: {
      ...baseItem,
      category: 'reply',
      title: '持棍的樵夫 回复了你的帖子',
      body: '「这套配装我也在用，棍势接得挺顺。」',
      createdAt: '2026-02-14T08:58:00.000Z',
      link: '/forum',
    },
  },
};

export const LongText: Story = {
  name: '极端长文本',
  args: {
    item: {
      ...baseItem,
      title: '一条标题被刻意写得很长很长的系统消息，用来测试换行与按钮对齐',
      body: '正文同样写得极长：'.repeat(12),
    },
  },
};
