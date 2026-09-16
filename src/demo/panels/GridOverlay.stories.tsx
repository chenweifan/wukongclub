import type { Meta, StoryObj } from '@storybook/react-vite';

import { GridOverlay } from '@/demo/panels/GridOverlay';

/**
 * 布局栅格（12 列参考线）。
 * 它是 fixed 满屏覆盖层，所以 fullscreen 布局下看到的才是真实效果；
 * 半透明色用 color-mix 表达（Tailwind v3 无法为 var() 颜色生成透明度类）。
 */
const meta = {
  title: '演示系统/GridOverlay',
  component: GridOverlay,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'aria-hidden + pointer-events-none：对读屏与鼠标完全透明，只服务于对齐检查。',
      },
    },
  },
} satisfies Meta<typeof GridOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 垫一层内容，栅格与版心的关系才看得出来。 */
function WithContent() {
  return (
    <div className="mx-auto max-w-page p-4">
      <div className="border-token border-line rounded-scroll border p-6">
        <p className="text-sm">栅格应与版心（max-w-page）对齐，共 12 列。</p>
      </div>
      <GridOverlay />
    </div>
  );
}

export const Default: Story = { render: () => <WithContent /> };

export const HighContrast: Story = {
  name: '高对比主题',
  globals: { theme: 'contrast' },
  render: () => <WithContent />,
};

export const PaperTheme: Story = {
  name: '宣纸主题',
  globals: { theme: 'paper' },
  render: () => <WithContent />,
};
