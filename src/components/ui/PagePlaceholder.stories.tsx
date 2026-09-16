import type { Meta, StoryObj } from '@storybook/react-vite';

import { PagePlaceholder } from '@/components/ui/PagePlaceholder';
import { COPY } from '@/utils/copy';

/**
 * 未交付模块的占位页外壳。
 *
 * 它没有 loading / empty / error 形态（本身就是「这个模块还没做」的表达），
 * 因此覆盖 default、自定义说明与极端长文本三个必要状态。
 */
const meta = {
  title: '基础组件/PagePlaceholder',
  component: PagePlaceholder,
  tags: ['autodocs'],
  args: {
    pageName: COPY.nav.forum,
    phase: '原计划 · 阶段 2',
    description: COPY.navDescription.forum,
  },
  parameters: {
    docs: {
      description: {
        component:
          '未交付路由的统一兜底：状态标记 + 「{{页面名}} · 未在本次交付范围内」+ 原计划说明 + 已交付模块入口。',
      },
    },
  },
} satisfies Meta<typeof PagePlaceholder>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Admin: Story = {
  name: '后台（仅 admin 可入）',
  args: {
    pageName: COPY.nav.admin,
    phase: '原计划 · 阶段 3',
    description: COPY.navDescription.admin,
  },
};

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

export const DefaultCopy: Story = {
  name: '默认文案（不传 phase / description）',
  args: {
    phase: undefined,
    description: undefined,
  },
};

export const HighContrast: Story = {
  name: '高对比主题',
  globals: { theme: 'contrast' },
};
