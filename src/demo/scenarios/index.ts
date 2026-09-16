import { clearAllData, fillDemoData, resetDemoData } from '@/data/db/demoData';
import type { DemoState } from '@/demo/types';

/**
 * 预设场景（协议 1.5）。
 *
 * 结构完全按协议：`{ id, name, description, patch, route, seedData?, tourId? }`。
 *
 * ⚠️ 关于「场景链接能否复现数据」：链接携带的是**状态**（身份/界面态/主题/seed/tour），
 * seedData 是一次性的写库动作，不会因为打开链接就重放（否则会冲掉用户自己的数据）。
 * 需要连数据一起复现时请用「导出快照 / 导入快照」——两者是互补的，不是重复。
 */
export const DEMO_SCENARIO_IDS = [
  'first-visit',
  'spoiler-free',
  'build-master',
  'moderate-flow',
  'empty-launch',
  'chaos',
  'event-season',
] as const;

export type DemoScenarioId = (typeof DEMO_SCENARIO_IDS)[number];

export interface DemoScenario {
  id: DemoScenarioId;
  name: string;
  description: string;
  patch: Partial<DemoState>;
  route: string;
  /** 可选：切换场景时重置种子数据。 */
  seedData?: () => Promise<void>;
  /** 可选：切换后自动启动的引导剧本。 */
  tourId?: string;
}

export const DEMO_SCENARIOS: readonly DemoScenario[] = [
  {
    id: 'first-visit',
    name: '首次到访',
    description: '新天命人第一次进站：基线数据 + 跨页引导，展示「演示即产品」的默认体验。',
    patch: {
      role: 'newbie',
      uiState: 'normal',
      spoiler: false,
      theme: 'ink',
      clean: false,
      grid: false,
      seed: 42,
    },
    route: '/',
    seedData: async () => {
      await resetDemoData(42);
    },
    tourId: 'first-visit',
  },
  {
    id: 'spoiler-free',
    name: '零剧透浏览',
    description: '剧透全关 + 访客身份，适合把链接直接发给还没通关的朋友。',
    patch: {
      role: 'guest',
      uiState: 'normal',
      spoiler: false,
      theme: 'paper',
      clean: false,
      grid: false,
      seed: 42,
    },
    route: '/guide',
  },
  {
    id: 'build-master',
    name: '配装大师',
    description: '直奔配装模拟器，并预置满量数据（页面本身在阶段 3 交付，URL 与状态现在就正确）。',
    patch: {
      role: 'active',
      uiState: 'normal',
      spoiler: true,
      theme: 'ink',
      clean: false,
      grid: false,
      seed: 2024,
    },
    route: '/build-lab',
    seedData: async () => {
      await fillDemoData(2024);
    },
  },
  {
    id: 'moderate-flow',
    name: '版主值班',
    description: '版主身份进论坛，预演审核动线（论坛在阶段 2、后台在阶段 3 交付后自动生效）。',
    patch: {
      role: 'moderator',
      uiState: 'normal',
      spoiler: true,
      theme: 'ink',
      clean: false,
      grid: false,
      seed: 42,
    },
    route: '/forum',
  },
  {
    id: 'empty-launch',
    name: '空数据首启',
    description: '清空全部本地数据，检查空态文案与「第一次使用」的引导是否到位。',
    patch: {
      role: 'newbie',
      uiState: 'empty',
      spoiler: false,
      theme: 'ink',
      clean: false,
      grid: false,
      seed: 42,
    },
    route: '/',
    seedData: async () => {
      await clearAllData();
    },
  },
  {
    id: 'chaos',
    name: '混沌故障',
    description: '断网 + 封禁身份 + 高对比主题 + 栅格，一次性压满异常态，验证降级路径。',
    patch: {
      role: 'banned',
      uiState: 'offline',
      spoiler: true,
      theme: 'contrast',
      clean: false,
      grid: true,
      seed: 666,
    },
    route: '/',
  },
  {
    id: 'event-season',
    name: '赛季活动',
    description: '活动中心 + 满量数据，展示赛季与榜单场景（活动中心阶段 3 交付）。',
    patch: {
      role: 'active',
      uiState: 'normal',
      spoiler: true,
      theme: 'ink',
      clean: false,
      grid: false,
      seed: 777,
    },
    route: '/event',
    seedData: async () => {
      await fillDemoData(777);
    },
  },
];

export function findDemoScenario(id: string): DemoScenario | undefined {
  return DEMO_SCENARIOS.find((scenario) => scenario.id === id);
}

export function isDemoScenarioId(value: unknown): value is DemoScenarioId {
  return typeof value === 'string' && (DEMO_SCENARIO_IDS as readonly string[]).includes(value);
}

/** 场景下拉用的选项（文案与实现同在场景定义里，改一处即可）。 */
export const DEMO_SCENARIO_OPTIONS = DEMO_SCENARIOS.map((scenario) => ({
  value: scenario.id,
  label: scenario.name,
}));
