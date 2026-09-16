import type { Meta, StoryObj } from '@storybook/react-vite';

import { SpoilerMask } from '@/components/ui/SpoilerMask';
import { COPY } from '@/utils/copy';

/**
 * 剧透遮罩（站级原语，资讯与论坛共用）。
 *
 * 无障碍要点：遮罩层带 aria-hidden —— 读屏用户不应该比视觉用户更容易拿到剧透，
 * 否则「默认不剧透」这个承诺对无障碍用户就是失效的。
 */
const meta = {
  title: '基础组件/SpoilerMask',
  component: SpoilerMask,
  tags: ['autodocs'],
  args: {
    level: 1,
    onReveal: () => undefined,
    children: (
      <p className="text-xs leading-relaxed">
        这一段是含剧透的正文：妖王在第二阶段会切换姿态，此时应保留定身术直到它抬手。
      </p>
    ),
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SpoilerMask>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PlotSpoiler: Story = { name: '含剧情信息（1 级）' };

export const EndingSpoiler: Story = {
  name: '含结局级信息（2 级）',
  args: { level: 2 },
};

export const LongContent: Story = {
  name: '极端长文本',
  args: {
    level: 2,
    children: (
      <p className="text-xs leading-relaxed">
        {'这是一段刻意写得很长的剧透正文，用来检查遮罩在各种高度下的表现：'.repeat(8)}
      </p>
    ),
  },
};

export const HighContrast: Story = {
  name: '高对比主题',
  globals: { theme: 'contrast' },
};

export const CopyReference: Story = {
  name: '文案参考（各级别标签）',
  render: () => (
    <ul className="space-y-1 text-xs">
      {[0, 1, 2].map((level) => (
        <li key={level}>
          {level} → {COPY.spoiler.levels[level as 0 | 1 | 2]}
        </li>
      ))}
    </ul>
  ),
};
