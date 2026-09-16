# 黑神话悟空 · 非官方粉丝互动站

> **非官方粉丝作品**：本站与游戏科学（Game Science）及其关联方无隶属关系。
> 《黑神话：悟空》的名称、角色、美术与音乐等版权归游戏科学所有，本项目仅用于学习与交流。
> 站内全部数据均由本地 Mock（MSW + Dexie/IndexedDB）生成，**没有任何真实后端**。

一个「演示优先」的纯前端 SPA：内置 DEMO 演示系统，让评审用一条 URL 复现任意界面状态
（身份 / 空态 / 加载 / 错误 / 断网 / 主题 / 剧透 / 数据快照）。

---

## 快速开始

```bash
npm install
npm run dev          # http://127.0.0.1:5173
```

| 脚本                | 说明                         |
| ------------------- | ---------------------------- |
| `npm run dev`       | 启动开发服务器               |
| `npm run build`     | 类型检查 + 生产构建          |
| `npm run typecheck` | 仅类型检查（`tsc --noEmit`） |
| `npm run lint`      | ESLint（0 warning 容忍）     |
| `npm run format`    | Prettier 格式化              |
| `npm test`          | Vitest 单测 + 路由集成测试   |

## 技术栈（协议锁定）

Vite · React 18 · TypeScript(strict) · react-router-dom v6 Data Router ·
@tanstack/react-query · zustand(persist) · Tailwind CSS + CSS 变量令牌 ·
Radix 无样式原语 · framer-motion · TipTap · react-virtual · ECharts · dnd-kit ·
MSW + faker · Dexie · lz-string · html-to-image · driver.js · Vitest + Playwright · Storybook

> 依赖按阶段推进逐步引入。**阶段 1 已引入**：msw、@faker-js/faker、dexie、
> framer-motion、driver.js、@radix-ui/react-dialog、@radix-ui/react-switch，
> 以及开发期的 fake-indexeddb（jsdom 没有 IndexedDB，Dexie 与 MSW 链路需要它才能测）。
> 阶段 2/3 会继续引入 TipTap、react-virtual、ECharts、dnd-kit、lz-string、html-to-image，
> 全部来自协议清单，不新增清单外依赖。

## 目录结构

```
src/
├─ app/          路由表、Provider 组合、布局、主题与守卫
├─ pages/        页面组装（每个路由一个目录）
├─ features/     业务特性（features 之间禁止互相 import）
├─ entities/     跨特性共享的领域模型与组件
├─ components/   ui（无业务语义）/ business（含业务语义）
├─ data/         contracts / repositories / mocks / db / seeds  ← 所有数据的唯一出口
├─ demo/         演示系统：store / urlState / scenarios / tours / console / panels / snapshot
├─ stores/       zustand 客户端状态
├─ hooks/        通用 hooks
├─ utils/        纯函数工具与集中文案
├─ styles/       tokens.css（设计令牌）+ globals.css
└─ assets/
```

依赖方向严格单向：`pages → features → entities → components/ui → data`。

## 架构铁律（摘要）

1. 业务代码**永不直接调用 fetch/axios**，只依赖 `src/data/repositories`。
2. 跨层数据必须有 TS 类型契约，定义在 `src/data/contracts/`。
3. 异步 UI 一律用 `<StateBoundary>` 包裹（阶段 1 交付），页面内不散写 `if (loading)`。
4. 颜色/间距/圆角/阴影只用 CSS 变量令牌；用户可见文案集中在 `src/utils/copy.ts`。
5. 破坏性操作二次确认；写操作持久化前缀统一 `hmw:`。
6. 严禁 `any` / `@ts-ignore`；不确定类型用 `unknown` + 类型守卫。
7. 每个 UI 组件配 Storybook story，关键纯函数配 Vitest 单测。

## 主题令牌

三套主题共用同一组语义变量，切换 `<html data-theme>` 即可整体换肤：

| 主题   | `data-theme` | 定位                                   |
| ------ | ------------ | -------------------------------------- |
| 墨黑   | `ink`        | 默认，深色主体 + 鎏金强调              |
| 宣纸   | `paper`      | 浅色阅读（鎏金压深以保证对比度）       |
| 高对比 | `contrast`   | 无障碍：纯黑白、2px 边框、关闭噪点投影 |

基础令牌：`--hmw-ink` `--hmw-ink-2` `--hmw-gold` `--hmw-gold-hi` `--hmw-cinnabar`
`--hmw-paper` `--hmw-jade` `--radius-scroll` `--shadow-seal`。

## DEMO 演示系统（阶段 1）

「演示优先」是这个项目的核心卖点：**任何界面状态都能用一条 URL 复现**。
右下角葫芦打开演示控制台；所有开关都会实时写回地址栏（`replaceState`，不污染浏览器历史）。

### URL 参数

| 参数      | 取值                                                   | 说明                         |
| --------- | ------------------------------------------------------ | ---------------------------- |
| `demo`    | `1` / `0`                                              | 进入演示模式（含控制台）     |
| `role`    | `guest` `newbie` `active` `moderator` `admin` `banned` | 身份，决定权限与可见内容     |
| `ui`      | `normal` `empty` `loading` `error` `slow` `offline`    | 覆盖所有异步 UI 的状态       |
| `theme`   | `ink` `paper` `contrast`                               | 主题                         |
| `spoiler` | `1` / `0`                                              | 剧透开关                     |
| `seed`    | 整数                                                   | 种子数据随机种子（可复现）   |
| `time`    | ISO 时间                                               | 冻结时间                     |
| `tour`    | `first-visit` `console-guide`                          | 自动启动的引导剧本           |
| `clean`   | `1` / `0`                                              | 截图模式：隐藏控制台与提示条 |
| `grid`    | `1` / `0`                                              | 布局栅格                     |
| `record`  | `1`                                                    | 记录操作路径（内存，可导出） |

示例：

```
/?demo=1&role=admin&ui=offline&theme=contrast&spoiler=0&seed=666&clean=1
/?demo=1&tour=first-visit
```

> 演示模式开启时所有字段都会显式写进 URL（链接自描述，换台机器打开结果一致）；
> 关闭时演示参数会被摘掉，且**不会**动 `?build=...` 这类第三方参数。

### 控制台分区

身份 · 界面状态 · 主题 · 剧透 · 数据（重置 / 填满 / 清空 / 导出快照 / 导入快照）·
引导（剧本 + 启动）· 场景（预设 + 应用）· 工具（栅格 / 组件边界 / 性能面板 / 复制演示链接 / 操作记录）。

### 预设场景

| id              | 名称       | 说明                                       |
| --------------- | ---------- | ------------------------------------------ |
| `first-visit`   | 首次到访   | 基线数据 + 跨页引导                        |
| `spoiler-free`  | 零剧透浏览 | 剧透全关、宣纸主题，适合分享给未通关的朋友 |
| `build-master`  | 配装大师   | 直奔配装模拟器 + 满量数据                  |
| `moderate-flow` | 版主值班   | 版主身份进论坛，预演审核动线               |
| `empty-launch`  | 空数据首启 | 清空全部本地数据，检查空态                 |
| `chaos`         | 混沌故障   | 断网 + 封禁 + 高对比 + 栅格，压满异常态    |
| `event-season`  | 赛季活动   | 活动中心 + 满量数据                        |

场景切换 = 应用状态 patch + 可选重置种子数据 + 跳转路由 + 可选启动引导。
链接复现的是**状态**；要连数据一起复现，请用快照导入导出（两者互补）。

### 引导剧本

- `first-visit`：八步走完站点骨架，中途跨页跳转（`/` → `/wiki` → `/`）再回来。
- `console-guide`：控制台六个分区逐个讲解（启动时自动展开控制台）。

键盘 `←` `→` 翻页、`Esc` 退出；步骤只写路由与选择器，文案集中在
`src/demo/fixtures/tourCopy.ts`。单测会校验每个 `data-tour` 锚点在源码里真实存在。

### 数据快照

导出内容：`{ version, app, exportedAt, demoState, db, ls }` ——
`db` 是 Dexie 全量，`ls` 只含 `hmw:` 前缀的本地存储。
导入会校验版本与结构，脏记录被逐条过滤，非 `hmw:` 键一律拒绝写入。

### 演示系统如何接管数据

- `<StateBoundary>`：所有异步 UI 的统一边界。它优先服从 `uiState`
  （`error` / `offline` / `loading` / `empty` 直接覆盖），`normal` / `slow` 则回落到真实查询状态。
- `mockDelay()` / `mockError()`：所有 MSW handler 必须先 `mockError()` 再 `await mockDelay()`；
  `slow` 注入 3–5s 延迟，`offline` 抛 `HttpError(0)`，`error` 抛 `HttpError(500, '灵蕴紊乱')`。
- 已知架构例外：`src/data/mocks/**` 允许读取 `demoStore`（协议 6.3 的写法就是
  `useDemoStore.getState()`）。除此之外数据层不认识演示状态。
- 首页底部的「演示系统自检 · 探针列表」是阶段 1 的验收实物：它真实走
  Repository → MSW → IndexedDB，可勾选（写操作持久化），也会被快照一起备份。
  阶段 2 起会被真实业务列表取代。

## 组件文档（Storybook）

```bash
npm run storybook         # http://localhost:6006
npm run build-storybook   # 静态站点输出到 storybook-static/（已 gitignore）
```

- **17 个组件 / 91 个 story**，与源码同目录（`Component.stories.tsx`），组件搬家时 story 跟着走。
- 每个组件都覆盖它真正拥有的形态：`default` / `loading` / `empty` / `error` / 极端长文本；
  没有这些形态的组件（例如纯展示的占位页）会在 story 文件头注明原因，而不是硬凑。
- 工具栏可切三套主题：写的是 `demoStore.theme`，与页面内切换是同一个状态源。
- 装饰器把 story 放进**与应用一致的上下文**：QueryClient、ThemeProvider、MemoryRouter、
  演示状态、以及 MSW Mock 后端（`mockServiceWorker.js` 通过 `staticDirs` 提供）。
  所以「演示探针面板」的 story 跑的是真实的 Repository → MSW → IndexedDB 链路，
  而不是把数据塞成 props。
- 用 `parameters.demo` 预置演示状态：

  ```tsx
  export const OfflineOverride: Story = {
    args: { query: successQuery },
    parameters: { demo: { state: { enabled: true, uiState: 'offline' } } },
  };
  ```

- 已装 `@storybook/addon-a11y`：每个 story 都能在面板里查看对比度、语义与键盘问题。

## 阶段 2 · 用户成长与登录（模块 1/6）

登录注册 → 天命人名片 → 土地庙上香 → 任务中心 → 消息中心，全部走真实链路
（Repository → MSW → Dexie），没有一条是把数据塞进组件的 shortcuts。

### 功能与接口

| 功能 | 接口 | 说明 |
| --- | --- | --- |
| 注册 / 登录 | `POST /api/auth/register`、`POST /api/auth/login` | 校验规则前后端共用一份（`data/contracts/user.ts`） |
| 演示账号一键登录 | `POST /api/auth/demo-login` | 演示站专用；账号不存在时自动创建 |
| 当前用户 | `GET /api/auth/me` | 令牌失效或被清库时返回 401，前端回落未登录 |
| 上香签到 | `GET/POST /api/growth/check-in` | 同一天只能签一次（服务端按日期键保证，重复点击 409） |
| 任务 | `GET /api/growth/tasks`、`POST /api/growth/tasks/:id/claim` | 每日/周常按周期键自动重置；进度由真实行为推导 |
| 消息 | `GET /api/notifications`、`POST /api/notifications/:id/read`、`POST /api/notifications/read-all` | 分类 + 仅未读 + 未读红点 |

### 演示用法：身份联动登录态

演示模式下，控制台的身份会单向联动登录态 —— 这让「已登录的成长中心」也能被一条 URL 复现：

| `role` | 登录态 | 打开 `/user` 看到 |
| --- | --- | --- |
| `guest` | 未登录 | 「尚未登录」引导 + 去登录按钮 |
| `newbie` / `active` / `moderator` / `admin` | 自动登录演示账号 | 名片 + 签到 + 任务 + 消息 |
| `banned` | 未登录 | 「账号处于封禁状态」说明 |

```
/user?demo=1&role=active          # 直接落到成长中心
/user?demo=1&role=guest           # 未登录引导
/user?demo=1&role=banned&ui=offline
```

> 未开启演示模式时（普通浏览）**永远不会**改动访客自己的登录态。

### 种子与规则

- 演示账号：`tianming / hmw-demo`（登录页直接给出），附 4/8 个章节徽章与修为。
- 签到历史：42 天（faker 固定 seed），最近 6 天连续、更早稀疏 —— 日历的连续段与断点都有真实数据。
- 奖励曲线：基础 10 + 连续加成 2/天，封顶 40（`utils/checkInRules.ts`，含边界单测）。
- 修行境界：凡体 → 山门客 → 行者 → 降妖者 → 大圣 → 齐天，由修为纯函数推导。
- 任务进度不是写死的：**签到会让「土地庙上香」变成可领取**，领取后灵蕴与修为同时入账。

### 会话与令牌

- 令牌存在 localStorage（`hmw:auth-token`），由 `httpClient` 统一注入请求头，**只有一处**写入。
- 会话 store 不持久化：刷新时用令牌换回用户，服务端删号后不会留下幽灵账号。
- 登出即使请求失败也会清掉本地令牌（`finally` 语义），不会卡在「登不出去」。

## 进度

| 阶段 | 内容                                                                                     | 状态                |
| ---- | ---------------------------------------------------------------------------------------- | ------------------- |
| 0    | 项目骨架（工程配置 / 目录 / 令牌三主题 / Providers / 路由守卫 / 三布局 / 占位页 / Home） | ✅ 已交付           |
| 1    | DEMO 演示系统（URL 双向同步 / StateBoundary / 葫芦控制台 / 7 场景 / 引导 / 快照 / 录制） | ✅ 已交付           |
| 2    | 核心业务：**用户成长 ✅** → 影神图 → 资讯 → 攻略 → 论坛 → 个人主页                      | 🚧 进行中（1/6）    |
| 3    | 高级功能：配装模拟器 → 互动地图 → 收集追踪 → 二创 → 活动 → 灵蕴商城 → 后台               | 未开始              |
| 4    | 审查 / 重构 / E2E / 性能 / 交付文档                                                      | 未开始              |
