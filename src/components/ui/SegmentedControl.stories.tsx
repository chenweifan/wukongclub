import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { COPY } from '@/utils/copy';

const THEME_OPTIONS = [
  { value: 'ink', label: COPY.theme.ink, title: '墨黑：默认主题' },
  { value: 'paper', label: COPY.theme.paper, title: '宣纸：浅色阅读' },
  { value: 'contrast', label: COPY.theme.contrast, title: '高对比：无障碍' },
] as const;

/**
 * 分段选择器（原语级组件）。
 * 用 role=group + aria-pressed，所有选项都在 Tab 序里；
 * 长标签与选项数量变化是它最容易出问题的两处，因此各有一条 story。
 */
const meta = {
  title: '基础组件/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
  // meta 里给全必填 props：交互型 story 只写 render，靠这里的默认值兜底
  args: {
    label: '主题',
    value: 'ink',
    options: THEME_OPTIONS,
    onChange: () => undefined,
  },
  parameters: {
    docs: {
      description: {
        component: '演示控制台的身份/界面状态切换、主题切换都基于它。',
      },
    },
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 受控组件在 story 里自己管状态，交互才有效果。 */
function Interactive({ initial = 'ink' as string }) {
  const [value, setValue] = useState<string>(initial);
  return (
    <SegmentedControl
      label="主题"
      value={value}
      options={THEME_OPTIONS}
      onChange={(next) => {
        setValue(next);
      }}
    />
  );
}

export const Default: Story = {
  render: () => <Interactive />,
};

export const SelectedContrast: Story = {
  name: '选中态（高对比）',
  args: { value: 'contrast' },
};

export const SixOptions: Story = {
  name: '六个选项（界面状态）',
  render: () => {
    const UiStateHarness = () => {
      const [value, setValue] = useState('normal');
      return (
        <SegmentedControl
          label={COPY.demo.section.uiState}
          value={value}
          options={[
            { value: 'normal', label: COPY.demo.uiState.normal },
            { value: 'empty', label: COPY.demo.uiState.empty },
            { value: 'loading', label: COPY.demo.uiState.loading },
            { value: 'error', label: COPY.demo.uiState.error },
            { value: 'slow', label: COPY.demo.uiState.slow },
            { value: 'offline', label: COPY.demo.uiState.offline },
          ]}
          onChange={setValue}
        />
      );
    };
    return <UiStateHarness />;
  },
};

export const LongLabels: Story = {
  name: '极端长文本',
  render: () => {
    const LongHarness = () => {
      const [value, setValue] = useState('a');
      return (
        <div className="w-64">
          <SegmentedControl
            label="超长标签"
            value={value}
            options={[
              { value: 'a', label: '新入天命人的第一次到访体验' },
              { value: 'b', label: '活跃天命人（已通关二周目）' },
              { value: 'c', label: '版主值班：审核与举报处理' },
            ]}
            onChange={setValue}
          />
        </div>
      );
    };
    return <LongHarness />;
  },
};
