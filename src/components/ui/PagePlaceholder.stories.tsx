import type { Meta, StoryObj } from '@storybook/react-vite';

import { PagePlaceholder } from '@/components/ui/PagePlaceholder';

/**
 * 占位页外壳。
 * 该组件没有 loading / empty / error 形态（它本身就是「空」的表达），
 * 因此覆盖 default 与极端长文本两个必要状态。
 */
const meta = {
  title: '基础组件/PagePlaceholder',
  component: PagePlaceholder,
  tags: ['autodocs'],
  args: {
    pageName: '影神图',
    phase: '阶段 2',
  },
  parameters: {
    docs: {
      description: {
        component: '所有尚未交付的路由都用它兜底：阶段标签 + 「{{页面名}} · 建设中」+ 说明文案。',
      },
    },
  },
} satisfies Meta<typeof PagePlaceholder>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongText: Story = {
  name: '极端长文本',
  args: {
    pageName: '影神图百科（妖王 · 人物 · 地点 · 珍玩 · 影神图词条全量索引）',
    description:
      '这是一段刻意写得极长的说明文案，用来检查标题换行、容器不溢出、以及长文本下的行高与留白是否依然成立。'.repeat(
        6,
      ),
  },
};

export const NoPhaseBadge: Story = {
  name: '无阶段标签',
  args: {
    phase: undefined,
    description: undefined,
  },
};
