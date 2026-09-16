import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { WikiHarness } from '../../../../.storybook/harnesses';
import { WikiEntryDrawer } from '@/features/encyclopedia/components/WikiEntryDrawer';

/**
 * 词条详情抽屉（Radix Dialog 承载，Esc / 焦点陷阱由原语保证）。
 * 详情与图谱都由组件内部自己查（与页面一致），因此这里只需要把本地库种上词条。
 */
const meta = {
  title: '业务组件/WikiEntryDrawer',
  component: WikiEntryDrawer,
  tags: ['autodocs'],
  args: {
    entryId: 'wiki-heixiongjing',
    favoriteIds: [],
    compareIds: [],
    compareFull: false,
    onClose: () => undefined,
    onSelect: () => undefined,
    onToggleFavorite: () => undefined,
    onToggleCompare: () => undefined,
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof WikiEntryDrawer>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 抽屉内部的「点击关联词条 / 图谱节点」需要能切换中心词条，story 里也照做。 */
function DrawerHarness({ initialEntryId }: { initialEntryId: string }) {
  const [entryId, setEntryId] = useState<string | null>(initialEntryId);

  return (
    <div className="bg-bg min-h-screen p-6">
      {entryId === null ? (
        <button
          type="button"
          onClick={() => {
            setEntryId(initialEntryId);
          }}
          className="border-token border-line text-content rounded-scroll border px-3 py-1.5 text-sm"
        >
          重新打开抽屉
        </button>
      ) : null}

      <WikiEntryDrawer
        entryId={entryId}
        favoriteIds={['wiki-heifengshan']}
        compareIds={[]}
        compareFull={false}
        onClose={() => {
          setEntryId(null);
        }}
        onSelect={setEntryId}
        onToggleFavorite={() => undefined}
        onToggleCompare={() => undefined}
      />
    </div>
  );
}

export const Open: Story = {
  name: '打开（含关联图谱）',
  render: () => (
    <WikiHarness>
      <DrawerHarness initialEntryId="wiki-heixiongjing" />
    </WikiHarness>
  ),
};

export const LocationEntry: Story = {
  name: '地点词条',
  render: () => (
    <WikiHarness>
      <DrawerHarness initialEntryId="wiki-huaguoshan" />
    </WikiHarness>
  ),
};

export const BrokenEntry: Story = {
  name: '词条不存在（统一错误态）',
  render: () => (
    <WikiHarness>
      <DrawerHarness initialEntryId="wiki-does-not-exist" />
    </WikiHarness>
  ),
  args: { entryId: 'wiki-does-not-exist' },
};

export const HighContrast: Story = {
  name: '高对比主题',
  globals: { theme: 'contrast' },
  render: () => (
    <WikiHarness>
      <DrawerHarness initialEntryId="wiki-heixiongjing" />
    </WikiHarness>
  ),
};
