import type { Meta, StoryObj } from '@storybook/react-vite';

import { GourdButton } from '@/demo/console/GourdButton';
import { COPY } from '@/utils/copy';

/**
 * 右下角葫芦按钮：控制台开关。
 * 它是 fixed 定位，因此 story 用 fullscreen 布局才看得见真实位置。
 */
const meta = {
  title: '演示系统/GourdButton',
  component: GourdButton,
  tags: ['autodocs'],
  args: {
    label: COPY.demo.openConsole,
    onClick: () => undefined,
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof GourdButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Expanded: Story = {
  name: '已展开（aria-expanded）',
  args: { expanded: true, label: COPY.demo.closeConsole },
};

export const EnterDemoVariant: Story = {
  name: '进入演示模式',
  args: { label: COPY.demo.enterDemo, hint: COPY.demo.enterDemo },
};

export const HighContrast: Story = {
  name: '高对比主题',
  globals: { theme: 'contrast' },
};
