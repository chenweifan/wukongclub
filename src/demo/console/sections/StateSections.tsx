import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { SwitchField } from '@/components/ui/Switch';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { ConsoleSection } from '@/demo/console/ConsoleSection';
import { useDemoStore } from '@/demo/demoStore';
import { recordEvent } from '@/demo/recorder';
import { DEMO_ROLES, DEMO_UI_STATES } from '@/demo/types';
import { pushToast } from '@/stores/toastStore';
import { COPY } from '@/utils/copy';

const ROLE_OPTIONS = DEMO_ROLES.map((role) => ({ value: role, label: COPY.demo.role[role] }));
const UI_STATE_OPTIONS = DEMO_UI_STATES.map((state) => ({
  value: state,
  label: COPY.demo.uiState[state],
}));

/** 身份：六种角色，RequireRole 守卫直接读它。 */
export function IdentitySection() {
  const role = useDemoStore((state) => state.role);
  const patch = useDemoStore((state) => state.patch);

  return (
    <ConsoleSection
      title={COPY.demo.section.identity}
      hint={COPY.demo.sectionHint.identity}
      defaultOpen
      tourId="console-identity"
    >
      <SegmentedControl
        label={COPY.demo.section.identity}
        value={role}
        options={ROLE_OPTIONS}
        onChange={(next) => {
          patch({ role: next });
          recordEvent('console', `身份 → ${COPY.demo.role[next]}`);
        }}
      />
    </ConsoleSection>
  );
}

/** 界面状态：驱动所有 StateBoundary 的覆盖态。 */
export function UiStateSection() {
  const uiState = useDemoStore((state) => state.uiState);
  const patch = useDemoStore((state) => state.patch);

  return (
    <ConsoleSection
      title={COPY.demo.section.uiState}
      hint={COPY.demo.sectionHint.uiState}
      defaultOpen
      tourId="console-uistate"
    >
      <SegmentedControl
        label={COPY.demo.section.uiState}
        value={uiState}
        options={UI_STATE_OPTIONS}
        onChange={(next) => {
          patch({ uiState: next });
          recordEvent('console', `界面状态 → ${COPY.demo.uiState[next]}`);
        }}
      />
    </ConsoleSection>
  );
}

/** 主题：复用顶栏那个控件，保证只有一处实现、一处状态源。 */
export function ThemeSection() {
  return (
    <ConsoleSection title={COPY.demo.section.theme} hint={COPY.demo.sectionHint.theme}>
      <ThemeSwitcher />
    </ConsoleSection>
  );
}

/** 剧透开关：切到开启时给一次明确反馈，避免「点了没反应」的错觉。 */
export function SpoilerSection() {
  const spoiler = useDemoStore((state) => state.spoiler);
  const patch = useDemoStore((state) => state.patch);

  return (
    <ConsoleSection title={COPY.demo.section.spoiler} hint={COPY.demo.sectionHint.spoiler}>
      <SwitchField
        label={COPY.layout.spoilerLabel}
        checked={spoiler}
        onCheckedChange={(next) => {
          patch({ spoiler: next });
          pushToast(next ? COPY.demo.spoilerOn : COPY.demo.spoilerOff);
        }}
      />
    </ConsoleSection>
  );
}
