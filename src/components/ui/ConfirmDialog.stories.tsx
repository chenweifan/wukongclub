import type { Meta, StoryObj } from '@storybook/react-vite';

import { ConfirmDialogHost } from '@/components/ui/ConfirmDialog';
import { useConfirmStore } from '@/stores/confirmStore';
import { COPY } from '@/utils/copy';

/**
 * 二次确认弹窗（Radix Dialog）。
 * 它是 confirmStore 的唯一渲染者，story 直接给 store 塞一个 pending 请求即可。
 */
const meta = {
  title: '基础组件/ConfirmDialogHost',
  component: ConfirmDialogHost,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '破坏性操作统一走 requestConfirm()，调用点写成 `if (!(await requestConfirm({...}))) return;`。',
      },
    },
  },
} satisfies Meta<typeof ConfirmDialogHost>;

export default meta;

type Story = StoryObj<typeof meta>;

function ConfirmPreview({
  title,
  description,
  tone,
}: {
  title: string;
  description?: string;
  tone?: 'default' | 'danger';
}) {
  useConfirmStore.setState({
    pending: {
      id: 'story-confirm',
      title,
      description,
      tone,
      resolve: () => undefined,
    },
  });

  return <ConfirmDialogHost />;
}

export const Default: Story = {
  name: '普通确认',
  render: () => (
    <ConfirmPreview
      title={COPY.demo.data.fillConfirmTitle}
      description={COPY.demo.data.fillConfirmDescription}
    />
  ),
};

export const Danger: Story = {
  name: '危险操作（朱砂描边）',
  render: () => (
    <ConfirmPreview
      title={COPY.demo.data.clearConfirmTitle}
      description={COPY.demo.data.clearConfirmDescription}
      tone="danger"
    />
  ),
};

export const NoDescription: Story = {
  name: '无描述',
  render: () => <ConfirmPreview title={COPY.demo.data.resetConfirmTitle} />,
};

export const LongText: Story = {
  name: '极端长文本',
  render: () => (
    <ConfirmPreview
      title={`${COPY.demo.data.clearConfirmTitle}${'（含本地库、快照与全部偏好设置）'.repeat(6)}`}
      description={COPY.demo.data.clearConfirmDescription.repeat(6)}
      tone="danger"
    />
  ),
};
