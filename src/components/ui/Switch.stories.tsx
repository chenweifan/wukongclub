import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { SwitchField } from '@/components/ui/Switch';

/**
 * 开关字段（Radix Switch 原语）。
 * 标签与开关通过 htmlFor 绑定，点击文字也能切换；键盘 Space/Enter 可用。
 */
const meta = {
  title: '基础组件/SwitchField',
  component: SwitchField,
  tags: ['autodocs'],
  args: {
    label: '剧透内容',
    checked: false,
    onCheckedChange: () => undefined,
  },
} satisfies Meta<typeof SwitchField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Off: Story = { name: '关闭' };

export const On: Story = {
  name: '开启',
  args: { checked: true },
};

export const WithHint: Story = {
  name: '带说明',
  args: { hint: '开启后展示剧情、结局与隐藏 Boss 信息' },
};

export const Interactive: Story = {
  name: '可交互',
  render: () => {
    const Harness = () => {
      const [checked, setChecked] = useState(false);
      return <SwitchField label="布局栅格" checked={checked} onCheckedChange={setChecked} />;
    };
    return <Harness />;
  },
};

export const LongLabel: Story = {
  name: '极端长文本',
  args: {
    label: '开启后在所有列表与详情页展示剧情、结局、隐藏 Boss 与影神图未解锁词条',
    checked: true,
  },
};
